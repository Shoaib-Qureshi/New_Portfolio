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
import type { CaseStudyHighlight, CaseStudyPhase, GalleryImage, Project, ProjectIconKey } from '@/lib/content-types';

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

function parseGalleryImages(value: string): GalleryImage[] {
  return lines(value)
    .map((line) => {
      const [src = '', alt = '', title = '', sub = '', link = ''] = line.split('|').map((part) => part.trim());
      return {
        src,
        alt: alt || title || 'Gallery image',
        title: title || alt || 'Gallery image',
        sub,
        link: link || undefined,
      };
    })
    .filter((image) => image.src);
}

function galleryImagesFromFields(formData: FormData): GalleryImage[] {
  const count = Number(field(formData, 'galleryImageCount', '0'));
  if (!Number.isFinite(count) || count < 1) return parseGalleryImages(field(formData, 'galleryImages'));

  const images: GalleryImage[] = [];
  for (let index = 0; index < count; index += 1) {
    const src = field(formData, `gallerySrc_${index}`);
    const title = field(formData, `galleryTitle_${index}`, 'Gallery image');
    const alt = field(formData, `galleryAlt_${index}`, title);
    const sub = field(formData, `gallerySub_${index}`);
    const link = field(formData, `galleryLink_${index}`);
    const remove = field(formData, `galleryRemove_${index}`) === 'yes';
    if (!remove && src) {
      images.push({ src, alt: alt || title, title: title || alt || 'Gallery image', sub, link: link || undefined });
    }
  }
  return images;
}

const IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME,
);

async function saveImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith('image/')) throw new Error('Only image uploads are allowed.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be smaller than 5MB.');

  const ext = path.extname(file.name).toLowerCase() || `.${file.type.split('/')[1] || 'jpg'}`;
  const filename = `portfolio/${Date.now()}-${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // On Vercel/Netlify the local filesystem is read-only — upload to Vercel Blob instead.
  if (IS_SERVERLESS && process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, buffer, { access: 'public', contentType: file.type });
    recordUpload({ filename, originalName: file.name, mimeType: file.type, size: file.size, publicPath: blob.url });
    return blob.url;
  }

  // Local dev — write to public/uploads/ so Next.js can serve it.
  const uploadDir = ensureUploadDir();
  await fs.writeFile(path.join(uploadDir, path.basename(filename)), buffer);
  const publicPath = `/uploads/${path.basename(filename)}`;
  recordUpload({ filename: path.basename(filename), originalName: file.name, mimeType: file.type, size: file.size, publicPath });
  return publicPath;
}

async function saveGalleryUploads(files: FormDataEntryValue[]): Promise<GalleryImage[]> {
  const images: GalleryImage[] = [];
  for (const file of files) {
    const publicPath = await saveImage(file);
    if (!publicPath || !(file instanceof File)) continue;
    const title = path.basename(file.name, path.extname(file.name)).replace(/[-_]+/g, ' ').trim() || 'Gallery image';
    images.push({
      src: publicPath,
      alt: title,
      title,
      sub: 'Uploaded',
    });
  }
  return images;
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
    showYear: formData.get('showYear') === 'true',
    customIcon: field(formData, 'customIcon', existing?.customIcon ?? '') || undefined,
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

const TOGGLEABLE_SECTIONS = ['testimonials', 'work', 'about', 'plugins', 'contact'];

export async function saveSiteSettingsAction(formData: FormData) {
  const content = getPortfolioContent();
  // Checkboxes submit their value only when checked. Checked = visible.
  const visibleSections = formData.getAll('visibleSections').map(String);
  const visibleProjects = formData.getAll('visibleProjects').map(String);
  const hiddenSections = TOGGLEABLE_SECTIONS.filter((id) => !visibleSections.includes(id));
  const hiddenProjects = content.projects.map((p) => p.id).filter((id) => !visibleProjects.includes(id));
  savePortfolioContent({ ...content, siteSettings: { hiddenSections, hiddenProjects } });
  refreshPublicPages();
  redirect('/admin#site-settings');
}

export async function saveSharedContentAction(formData: FormData) {
  const content = getPortfolioContent();
  savePortfolioContent({
    ...content,
    galleryImages: [
      ...galleryImagesFromFields(formData),
      ...(await saveGalleryUploads(formData.getAll('galleryImageFiles'))),
    ],
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
