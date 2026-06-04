import type { LucideIcon } from 'lucide-react';

export type CaseStudyHighlight = { metric: string; label: string };
export type CaseStudyPhase = { phase: string; title: string; detail: string };
export type ImageField = { src: string; alt: string };
export type GalleryImage = ImageField & { title: string; sub: string; link?: string };

export type ProjectCategory = string;

export type ProjectIconKey =
  | 'workflow'
  | 'palette'
  | 'layout'
  | 'code'
  | 'braces'
  | 'shoppingBag'
  | 'custom'
  | string;

export type Project = {
  num: string;
  id: string;
  title: string;
  category: ProjectCategory;
  tags: string[];
  color: string;
  desc: string;
  year: string;
  showYear?: boolean;
  customIcon?: string;
  role: string;
  impact: string;
  iconKey: ProjectIconKey;
  icon?: LucideIcon;
  image: ImageField;
  processImage: ImageField;
  challenge: string;
  solution: string;
  highlights: CaseStudyHighlight[];
  process: CaseStudyPhase[];
  link?: string;
};

export type TimelineItem = {
  period: string;
  title: string;
  place: string;
  detail: string;
  iconKey: ProjectIconKey;
  icon?: LucideIcon;
};

export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  initials: string;
};

export type Plugin = {
  num: string;
  id: string;
  name: string;
  category: 'WordPress Plugin' | 'AI Automation' | 'WooCommerce Extension';
  desc: string;
  tags: string[];
  githubUrl: string;
  year: string;
};

export type SiteSettings = {
  hiddenSections: string[];   // section IDs: 'testimonials' | 'work' | 'about' | etc.
  hiddenProjects: string[];   // project IDs
};

export type PortfolioContent = {
  projects: Project[];
  galleryImages: GalleryImage[];
  skills: string[];
  marquee: string[];
  timeline: TimelineItem[];
  testimonials: Testimonial[];
  plugins: Plugin[];
  siteSettings: SiteSettings;
};

export const projectCategories: string[] = ['Apps', 'Commerce', 'Education', 'Brand'];

export const iconOptions: { key: string; label: string }[] = [
  { key: 'workflow', label: 'Workflow' },
  { key: 'palette', label: 'Palette' },
  { key: 'layout', label: 'Layout' },
  { key: 'code', label: 'Code' },
  { key: 'braces', label: 'Braces' },
  { key: 'shoppingBag', label: 'Shopping bag' },
  { key: 'custom', label: 'Custom SVG ↓' },
];
