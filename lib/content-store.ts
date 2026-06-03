import 'server-only';

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { GalleryImage, PortfolioContent, Project, SiteSettings } from '@/lib/content-types';
import { seedContent } from '@/lib/seed-content';

// On Vercel and Netlify, process.cwd() is read-only at runtime.
// /tmp is always writable on serverless runtimes.
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME,
);
const DATA_DIR = IS_SERVERLESS ? '/tmp/portfolio-data' : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'portfolio.sqlite');
const CONTENT_KEYS = ['projects', 'galleryImages', 'skills', 'marquee', 'timeline', 'testimonials', 'siteSettings'] as const;

const DEFAULT_SITE_SETTINGS: SiteSettings = { hiddenSections: ['testimonials'], hiddenProjects: [] };
const PROJECT_COLORS_BY_ID: Record<string, string> = {
  prepmedico: '#F5F5F5',
  liquidflow: '#F5F5F5',
  threadwrite: '#F5F5F5',
  'ananth-decodes': '#F5F5F5',
};

type ContentKey = (typeof CONTENT_KEYS)[number];

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
    seedIfNeeded(db);
  }
  return db;
}

function seedIfNeeded(database: Database.Database) {
  const count = database.prepare('select count(*) as count from content').get() as { count: number };
  if (count.count > 0) return;

  const insert = database.prepare('insert into content (key, value) values (?, ?)');
  const seed = seedContent as unknown as Record<ContentKey, unknown>;
  const transaction = database.transaction(() => {
    for (const key of CONTENT_KEYS) {
      insert.run(key, JSON.stringify(seed[key], null, 2));
    }
  });
  transaction();
}

function readKey<T>(key: ContentKey, fallback: T): T {
  const row = getDb().prepare('select value from content where key = ?').get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function getPortfolioContent(): PortfolioContent {
  const projects = normalizeProjectColors(readKey('projects', seedContent.projects));
  return {
    projects,
    galleryImages: readKey('galleryImages', buildGalleryFallback(projects)),
    skills: readKey('skills', seedContent.skills),
    marquee: readKey('marquee', seedContent.marquee),
    timeline: readKey('timeline', seedContent.timeline),
    testimonials: readKey('testimonials', seedContent.testimonials),
    siteSettings: readKey('siteSettings', DEFAULT_SITE_SETTINGS),
  };
}

function buildGalleryFallback(projects: Project[]): GalleryImage[] {
  return projects
    .flatMap((project) => [
    {
      src: project.image.src,
      alt: project.image.alt,
      title: project.title,
      sub: project.category,
      link: project.link,
    },
    {
      src: project.processImage.src,
      alt: project.processImage.alt,
      title: project.category,
      sub: project.tags[0] ?? '',
    },
  ])
    .filter((image) => Boolean(image.src));
}

function normalizeProjectColors(projects: Project[]) {
  return projects.map((project) => ({
    ...project,
    color: PROJECT_COLORS_BY_ID[project.id] ?? project.color,
  }));
}

export function getProjects() {
  return getPortfolioContent().projects;
}

export function getProject(id: string) {
  return getProjects().find((project) => project.id === id) ?? null;
}

export function savePortfolioContent(content: PortfolioContent) {
  const database = getDb();
  const statement = database.prepare(
    'insert into content (key, value, updated_at) values (?, ?, current_timestamp) on conflict(key) do update set value = excluded.value, updated_at = current_timestamp',
  );
  const transaction = database.transaction(() => {
    for (const key of CONTENT_KEYS) {
      statement.run(key, JSON.stringify(content[key], null, 2));
    }
  });
  transaction();
}

export function saveProjects(projects: Project[]) {
  const content = getPortfolioContent();
  savePortfolioContent({ ...content, projects });
}

export function recordUpload(upload: {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  publicPath: string;
}) {
  getDb()
    .prepare(
      'insert into uploads (filename, original_name, mime_type, size, public_path) values (?, ?, ?, ?, ?)',
    )
    .run(upload.filename, upload.originalName, upload.mimeType, upload.size, upload.publicPath);
}

export function ensureUploadDir() {
  const uploadDir = path.join(DATA_DIR, 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}
