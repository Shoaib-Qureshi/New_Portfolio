import 'server-only';

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { GalleryImage, Plugin, PortfolioContent, Project, SiteSettings } from '@/lib/content-types';
import { seedContent } from '@/lib/seed-content';

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME,
);
const HAS_KV = Boolean(process.env.KV_REST_API_URL);

const DATA_DIR = IS_SERVERLESS ? '/tmp/portfolio-data' : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'portfolio.sqlite');
const CONTENT_KEYS = ['projects', 'galleryImages', 'skills', 'marquee', 'timeline', 'testimonials', 'plugins', 'siteSettings'] as const;

const DEFAULT_SITE_SETTINGS: SiteSettings = { hiddenSections: ['testimonials'], hiddenProjects: [] };
const PROJECT_COLORS_BY_ID: Record<string, string> = {
  prepmedico: '#F5F5F5',
  liquidflow: '#F5F5F5',
  threadwrite: '#F5F5F5',
  'ananth-decodes': '#F5F5F5',
};

type ContentKey = (typeof CONTENT_KEYS)[number];

// ── Local SQLite (dev) ────────────────────────────────────────────────────────

let db: Database.Database | null = null;

function getDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      create table if not exists content (
        key text primary key,
        value text not null,
        updated_at text not null default current_timestamp
      );
      create table if not exists uploads (
        id integer primary key autoincrement,
        filename text not null,
        original_name text not null,
        mime_type text not null,
        size integer not null,
        public_path text not null,
        created_at text not null default current_timestamp
      );
    `);
    seedLocalIfNeeded(db);
  }
  return db;
}

function seedLocalIfNeeded(database: Database.Database) {
  const count = database.prepare('select count(*) as count from content').get() as { count: number };
  if (count.count > 0) return;
  const insert = database.prepare('insert into content (key, value) values (?, ?)');
  const seed = seedContent as unknown as Record<ContentKey, unknown>;
  const tx = database.transaction(() => {
    for (const key of CONTENT_KEYS) insert.run(key, JSON.stringify(seed[key], null, 2));
  });
  tx();
}

function dbRead<T>(key: ContentKey, fallback: T): T {
  const row = getDb().prepare('select value from content where key = ?').get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try { return JSON.parse(row.value) as T; } catch { return fallback; }
}

function dbWrite(content: PortfolioContent) {
  const database = getDb();
  const stmt = database.prepare(
    'insert into content (key, value, updated_at) values (?, ?, current_timestamp) on conflict(key) do update set value = excluded.value, updated_at = current_timestamp',
  );
  const tx = database.transaction(() => {
    for (const key of CONTENT_KEYS) stmt.run(key, JSON.stringify(content[key as keyof PortfolioContent], null, 2));
  });
  tx();
}

// ── Vercel KV (serverless — persistent across instances & cold starts) ─────────

const KV_PREFIX = 'portfolio:';

async function kvRead<T>(key: ContentKey, fallback: T): Promise<T> {
  try {
    const { kv } = await import('@vercel/kv');
    const raw = await kv.get<string>(`${KV_PREFIX}${key}`);
    if (raw === null || raw === undefined) return fallback;
    return typeof raw === 'string' ? JSON.parse(raw) as T : raw as unknown as T;
  } catch {
    return fallback;
  }
}

async function kvWrite(content: PortfolioContent): Promise<void> {
  const { kv } = await import('@vercel/kv');
  const pipeline = kv.pipeline();
  for (const key of CONTENT_KEYS) {
    pipeline.set(`${KV_PREFIX}${key}`, JSON.stringify(content[key as keyof PortfolioContent]));
  }
  await pipeline.exec();
}

async function kvSeedIfNeeded(): Promise<void> {
  const { kv } = await import('@vercel/kv');
  const existing = await kv.get(`${KV_PREFIX}projects`);
  if (existing !== null && existing !== undefined) return;
  // First request ever — seed from seed-content.ts
  const pipeline = kv.pipeline();
  const seed = seedContent as unknown as Record<ContentKey, unknown>;
  for (const key of CONTENT_KEYS) pipeline.set(`${KV_PREFIX}${key}`, JSON.stringify(seed[key]));
  await pipeline.exec();
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (IS_SERVERLESS && HAS_KV) {
    await kvSeedIfNeeded();
    const projects = normalizeProjectColors(await kvRead('projects', seedContent.projects));
    return {
      projects,
      galleryImages: await kvRead('galleryImages', buildGalleryFallback(projects)),
      skills:        await kvRead('skills',        seedContent.skills),
      marquee:       await kvRead('marquee',       seedContent.marquee),
      timeline:      await kvRead('timeline',      seedContent.timeline),
      testimonials:  await kvRead('testimonials',  seedContent.testimonials),
      plugins:       await kvRead('plugins',       seedContent.plugins),
      siteSettings:  await kvRead('siteSettings',  DEFAULT_SITE_SETTINGS),
    };
  }

  // Local dev or Netlify without KV → SQLite
  const projects = normalizeProjectColors(dbRead('projects', seedContent.projects));
  return {
    projects,
    galleryImages: dbRead('galleryImages', buildGalleryFallback(projects)),
    skills:        dbRead('skills',        seedContent.skills),
    marquee:       dbRead('marquee',       seedContent.marquee),
    timeline:      dbRead('timeline',      seedContent.timeline),
    testimonials:  dbRead('testimonials',  seedContent.testimonials),
    plugins:       dbRead('plugins',       seedContent.plugins),
    siteSettings:  dbRead('siteSettings',  DEFAULT_SITE_SETTINGS),
  };
}

export async function savePortfolioContent(content: PortfolioContent): Promise<void> {
  if (IS_SERVERLESS && HAS_KV) {
    await kvWrite(content);
    return;
  }
  dbWrite(content);
}

export async function getProjects(): Promise<Project[]> {
  return (await getPortfolioContent()).projects;
}

export async function getProject(id: string): Promise<Project | null> {
  return (await getProjects()).find((p) => p.id === id) ?? null;
}

export async function saveProjects(projects: Project[]): Promise<void> {
  const content = await getPortfolioContent();
  await savePortfolioContent({ ...content, projects });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildGalleryFallback(projects: Project[]): GalleryImage[] {
  return projects
    .flatMap((project) => [
      { src: project.image.src, alt: project.image.alt, title: project.title, sub: project.category, link: project.link },
      { src: project.processImage.src, alt: project.processImage.alt, title: project.category, sub: project.tags[0] ?? '' },
    ])
    .filter((image) => Boolean(image.src));
}

function normalizeProjectColors(projects: Project[]) {
  return projects.map((project) => ({
    ...project,
    color: PROJECT_COLORS_BY_ID[project.id] ?? project.color,
  }));
}

// ── Upload helpers (unchanged) ─────────────────────────────────────────────────

export function recordUpload(upload: {
  filename: string; originalName: string; mimeType: string; size: number; publicPath: string;
}) {
  if (IS_SERVERLESS) return; // uploads go to Blob — no local DB record needed on serverless
  getDb()
    .prepare('insert into uploads (filename, original_name, mime_type, size, public_path) values (?, ?, ?, ?, ?)')
    .run(upload.filename, upload.originalName, upload.mimeType, upload.size, upload.publicPath);
}

export function ensureUploadDir() {
  // Serve from public/uploads/ so Next.js static serving picks it up in dev.
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}
