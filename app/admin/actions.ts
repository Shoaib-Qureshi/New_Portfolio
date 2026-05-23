'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearAdminSession, setAdminSession, verifyAdminCredentials } from '@/lib/auth';
import {
  ensureUploadDir,
  getPortfolioContent,
  recordUpload,
  savePortfolioContent,
  saveProjects,
} from '@/lib/content-store';
import type { CaseStudyHighlight, CaseStudyPhase, Project, ProjectIconKey } from '@/lib/content-types';

function field(formData: FormData, name: string, fallback = '') {
  return String(formData.get(name) ?? fallback).trim();
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function tags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function uniqueSlug(slug: string, projects: Project[], currentId?: string) {
  const base = slug || 'project';
  let next = base;
  let i = 2;
  while (projects.some((project) => project.id === next && project.id !== currentId)) {
    next = `${base}-${i}`;
    i += 1;
  }
  return next;
}

function parseHighlights(value: string): CaseStudyHighlight[] {
  return lines(value).map((line) => {
    const [metric = '', label = ''] = line.split('|').map((part) => part.trim());
    return { metric, label };
  });
}

function parseProcess(value: string): CaseStudyPhase[] {
  return lines(value).map((line, index) => {
    const [phase = String(index + 1).padStart(2, '0'), title = '', detail = ''] = line
      .split('|')
      .map((part) => part.trim());
    return { phase, title, detail };
  });
}

async function saveImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith('image/')) throw new Error('Only image uploads are allowed.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be smaller than 5MB.');

  const ext = path.extname(file.name).toLowerCase() || `.${file.type.split('/')[1] || 'jpg'}`;
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const uploadDir = ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  const publicPath = `/uploads/${filename}`;
  recordUpload({
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    publicPath,
  });
  return publicPath;
}

async function projectFromForm(formData: FormData, existing?: Project): Promise<Project> {
  const content = getPortfolioContent();
  const title = field(formData, 'title', existing?.title ?? 'Untitled Project');
  const requestedSlug = slugify(field(formData, 'id', existing?.id ?? title));
  const imageUpload = await saveImage(formData.get('imageFile'));
  const processImageUpload = await saveImage(formData.get('processImageFile'));

  return {
    num: field(formData, 'num', existing?.num ?? String(content.projects.length + 1).padStart(2, '0')),
    id: uniqueSlug(requestedSlug, content.projects, existing?.id),
    title,
    category: field(formData, 'category', existing?.category ?? 'Apps') as Project['category'],
    tags: tags(field(formData, 'tags', existing?.tags.join(', ') ?? '')),
    color: field(formData, 'color', existing?.color ?? '#F5F5F5'),
    desc: field(formData, 'desc', existing?.desc ?? ''),
    year: field(formData, 'year', existing?.year ?? new Date().getFullYear().toString()),
    role: field(formData, 'role', existing?.role ?? ''),
    impact: field(formData, 'impact', existing?.impact ?? ''),
    iconKey: field(formData, 'iconKey', existing?.iconKey ?? 'workflow') as ProjectIconKey,
    image: {
      src: imageUpload ?? field(formData, 'imageSrc', existing?.image.src ?? ''),
      alt: field(formData, 'imageAlt', existing?.image.alt ?? title),
    },
    processImage: {
      src: processImageUpload ?? field(formData, 'processImageSrc', existing?.processImage.src ?? ''),
      alt: field(formData, 'processImageAlt', existing?.processImage.alt ?? `${title} process`),
    },
    challenge: field(formData, 'challenge', existing?.challenge ?? ''),
    solution: field(formData, 'solution', existing?.solution ?? ''),
    highlights: parseHighlights(field(formData, 'highlights', '')),
    process: parseProcess(field(formData, 'process', '')),
    link: field(formData, 'link', existing?.link ?? '') || undefined,
  };
}

function refreshPublicPages() {
  revalidatePath('/');
  revalidatePath('/work/[id]', 'page');
  revalidatePath('/admin');
}

export async function loginAction(formData: FormData) {
  const username = field(formData, 'username', 'admin');
  const password = field(formData, 'password');
  if (!verifyAdminCredentials(username, password)) {
    redirect('/admin/login?error=1');
  }
  await setAdminSession();
  redirect(field(formData, 'next', '/admin') || '/admin');
}

export async function logoutAction() {
  await clearAdminSession();
  redirect('/admin/login');
}

export async function createProjectAction(formData: FormData) {
  const content = getPortfolioContent();
  const project = await projectFromForm(formData);
  saveProjects([...content.projects, project]);
  refreshPublicPages();
  redirect('/admin');
}

export async function saveProjectAction(formData: FormData) {
  const content = getPortfolioContent();
  const currentId = field(formData, 'currentId');
  const existing = content.projects.find((project) => project.id === currentId);
  if (!existing) redirect('/admin');
  const project = await projectFromForm(formData, existing);
  saveProjects(content.projects.map((item) => (item.id === currentId ? project : item)));
  refreshPublicPages();
  redirect('/admin');
}

export async function deleteProjectAction(formData: FormData) {
  if (field(formData, 'confirmDelete') !== 'delete') redirect('/admin');
  const id = field(formData, 'currentId');
  const content = getPortfolioContent();
  saveProjects(content.projects.filter((project) => project.id !== id));
  refreshPublicPages();
  redirect('/admin');
}

export async function saveSharedContentAction(formData: FormData) {
  const content = getPortfolioContent();
  savePortfolioContent({
    ...content,
    skills: lines(field(formData, 'skills')),
    marquee: lines(field(formData, 'marquee')),
    timeline: lines(field(formData, 'timeline')).map((line) => {
      const [period = '', title = '', place = '', iconKey = 'code', detail = ''] = line
        .split('|')
        .map((part) => part.trim());
      return { period, title, place, iconKey: iconKey as ProjectIconKey, detail };
    }),
    testimonials: lines(field(formData, 'testimonials')).map((line) => {
      const [name = '', title = '', initials = '', quote = ''] = line.split('|').map((part) => part.trim());
      return { name, title, initials, quote };
    }),
  });
  refreshPublicPages();
  redirect('/admin#shared-content');
}
