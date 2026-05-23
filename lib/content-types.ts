import type { LucideIcon } from 'lucide-react';

export type CaseStudyHighlight = { metric: string; label: string };
export type CaseStudyPhase = { phase: string; title: string; detail: string };
export type ImageField = { src: string; alt: string };

export type ProjectCategory = 'Apps' | 'Commerce' | 'Education' | 'Brand';

export type ProjectIconKey =
  | 'workflow'
  | 'palette'
  | 'layout'
  | 'code'
  | 'braces'
  | 'shoppingBag';

export type Project = {
  num: string;
  id: string;
  title: string;
  category: ProjectCategory;
  tags: string[];
  color: string;
  desc: string;
  year: string;
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

export type PortfolioContent = {
  projects: Project[];
  skills: string[];
  marquee: string[];
  timeline: TimelineItem[];
  testimonials: Testimonial[];
};

export const projectCategories: ProjectCategory[] = ['Apps', 'Commerce', 'Education', 'Brand'];

export const iconOptions: { key: ProjectIconKey; label: string }[] = [
  { key: 'workflow', label: 'Workflow' },
  { key: 'palette', label: 'Palette' },
  { key: 'layout', label: 'Layout' },
  { key: 'code', label: 'Code' },
  { key: 'braces', label: 'Braces' },
  { key: 'shoppingBag', label: 'Shopping bag' },
];
