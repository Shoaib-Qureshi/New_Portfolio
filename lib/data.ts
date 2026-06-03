import type { LucideIcon } from 'lucide-react';
import { Braces, Code2, LayoutPanelTop, Palette, ShoppingBag, Workflow } from 'lucide-react';

export type CaseStudyHighlight = { metric: string; label: string };
export type CaseStudyPhase = { phase: string; title: string; detail: string };

export type Project = {
  num: string;
  id: string;
  title: string;
  category: 'Apps' | 'Commerce' | 'Education' | 'Brand';
  tags: string[];
  color: string;
  desc: string;
  year: string;
  role: string;
  impact: string;
  icon: LucideIcon;
  image: {
    src: string;
    alt: string;
  };
  processImage: {
    src: string;
    alt: string;
  };
  challenge: string;
  solution: string;
  highlights: CaseStudyHighlight[];
  process: CaseStudyPhase[];
  link?: string;
};

export const projects: Project[] = [
  {
    num: '01',
    id: 'liquidflow',
    title: 'LiquidFlow',
    category: 'Apps',
    tags: ['Laravel', 'React.js', 'WooCommerce', 'Stripe'],
    color: '#F5F5F5',
    desc: 'Real-time collaborative task management connected to a subscription workflow with automated onboarding and payment-gated access.',
    year: '2024',
    role: 'Frontend engineering, integration architecture',
    impact: 'Reduced manual setup and created a cleaner premium product flow.',
    icon: Workflow,
    image: {
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
      alt: 'Analytics dashboard interface on a workstation',
    },
    processImage: {
      src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
      alt: 'Product team planning workflow architecture',
    },
    challenge:
      'The client needed a seamless way to gate premium features behind a subscription, while keeping onboarding frictionless enough that new users could move from signup to paying customer in under two minutes.',
    solution:
      'Built a Laravel + React.js SPA with a WooCommerce backend for subscription management. A custom webhook layer bridged payment events to feature flags, enabling instant access upgrades without page refreshes.',
    highlights: [
      { metric: '< 2min', label: 'Signup to paid' },
      { metric: '98%', label: 'Uptime SLA' },
      { metric: '3×', label: 'Conversion lift' },
      { metric: '0', label: 'Manual onboarding steps' },
    ],
    process: [
      {
        phase: '01',
        title: 'Discovery & Architecture',
        detail:
          'Mapped the full user journey from trial to paid, identifying friction points in the existing checkout flow. Designed a stateless webhook architecture to decouple payment events from feature access.',
      },
      {
        phase: '02',
        title: 'Frontend Engineering',
        detail:
          'Built the React SPA with optimistic UI updates. Access gates reflected instantly on payment success. Used Zustand for local state and React Query for server sync.',
      },
      {
        phase: '03',
        title: 'Integration Layer',
        detail:
          'Wired Stripe webhooks through Laravel to a permission model that WooCommerce consumed. Wrote custom PHP middleware to handle subscription upgrades, downgrades, and cancellations.',
      },
      {
        phase: '04',
        title: 'Testing & Launch',
        detail:
          'Ran end-to-end payment flow tests with Stripe test mode. Deployed to a Laravel Forge instance with Redis queues for webhook reliability.',
      },
    ],
  },
  {
    num: '02',
    id: 'magic-loft',
    title: 'Magic Loft',
    category: 'Brand',
    tags: ['WordPress', 'PHP', 'Elementor', 'SEO'],
    color: '#F5F5F5',
    desc: 'Responsive lifestyle brand website with custom theme enhancements, performance improvements, and search-focused structure.',
    year: '2024',
    role: 'Custom WordPress build and UX polish',
    impact: 'Improved content rhythm, mobile polish, and content discoverability.',
    icon: Palette,
    image: {
      src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
      alt: 'Editorial brand website displayed in a creative studio',
    },
    processImage: {
      src: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80',
      alt: 'Design composition with layered brand materials',
    },
    challenge:
      'Magic Loft had strong visual brand identity but their WordPress site was slow, hard to navigate on mobile, and structured in a way that buried their best content from search engines.',
    solution:
      'Rebuilt the theme layer with custom PHP templates and Elementor overrides. Implemented proper heading hierarchy, structured data markup, and lazy-loaded media to cut LCP by 40%. Redesigned mobile navigation for thumb-friendly access.',
    highlights: [
      { metric: '40%', label: 'LCP reduction' },
      { metric: '92', label: 'PageSpeed score' },
      { metric: '2.3×', label: 'Mobile session length' },
      { metric: '+34%', label: 'Organic reach' },
    ],
    process: [
      {
        phase: '01',
        title: 'Audit & Strategy',
        detail:
          'Ran a full Core Web Vitals audit and content structure review. Identified 14 render-blocking resources and a flat site architecture that prevented crawl depth.',
      },
      {
        phase: '02',
        title: 'Theme Engineering',
        detail:
          'Built custom Elementor widgets for the editorial content grid. Replaced the generic gallery with a CSS masonry layout that preserved aspect ratios without JavaScript.',
      },
      {
        phase: '03',
        title: 'Performance Pass',
        detail:
          'Implemented critical CSS inlining, deferred non-essential scripts, and a WebP conversion pipeline. Moved font loading to resource hints for a faster first paint.',
      },
      {
        phase: '04',
        title: 'SEO Architecture',
        detail:
          'Structured category taxonomy to create meaningful content clusters. Added JSON-LD for articles and products, reviewed internal linking density across 200+ posts.',
      },
    ],
  },
  {
    num: '03',
    id: 'arau',
    title: 'ARAU University',
    category: 'Education',
    tags: ['WordPress', 'PHP', 'HTML/CSS', 'JavaScript'],
    color: '#F5F5F5',
    desc: 'E-learning platform for course delivery, student registration, admissions flow, and institutional content management.',
    year: '2023',
    role: 'Platform UI, CMS structure, interaction layer',
    impact: 'Created a more accessible digital admissions and learning experience.',
    icon: LayoutPanelTop,
    image: {
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
      alt: 'Students using a digital learning platform together',
    },
    processImage: {
      src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1400&q=80',
      alt: 'University study space used for platform planning',
    },
    challenge:
      "ARAU's admissions process was entirely paper-based. The institution needed a digital platform that could handle high-traffic enrollment periods, serve students on slow mobile connections, and remain maintainable by non-technical staff.",
    solution:
      'Built a WordPress platform with a custom admissions workflow using WPForms and custom post types. Designed a component-based theme that staff could edit safely. Implemented a service worker for offline course access on poor connections.',
    highlights: [
      { metric: '4,200+', label: 'Annual applications' },
      { metric: '100%', label: 'Paper-free admissions' },
      { metric: '68ms', label: 'TTFB on 3G' },
      { metric: '12', label: 'Staff editors trained' },
    ],
    process: [
      {
        phase: '01',
        title: 'Requirements & IA',
        detail:
          'Ran workshops with admissions staff to map the full application lifecycle. Defined 6 content types and 3 user roles with distinct editing permissions.',
      },
      {
        phase: '02',
        title: 'CMS Architecture',
        detail:
          'Built a custom WordPress theme with ACF field groups for each content type. Locked Gutenberg to a safe block whitelist to prevent layout breaks by non-technical editors.',
      },
      {
        phase: '03',
        title: 'Admissions Flow',
        detail:
          "Built a multi-step application form with WPForms, conditional logic, file upload validation, and email confirmation sequences. Integrated with the institution's existing ERP via REST API.",
      },
      {
        phase: '04',
        title: 'Performance & Accessibility',
        detail:
          'Passed WCAG 2.1 AA audit. Achieved 68ms TTFB with server-side caching and a CDN layer. Added a service worker for offline course catalogue access.',
      },
    ],
  },
];

export const skills = [
  'HTML5',
  'CSS3',
  'JavaScript',
  'TypeScript',
  'React.js',
  'Next.js',
  'PHP',
  'WordPress',
  'Shopify',
  'Webflow',
  'WooCommerce',
  'Elementor',
  'Figma',
  'UI/UX',
  'Tailwind CSS',
  'Git',
];

export const marquee = [
  'Frontend Developer',
  'React.js',
  'Next.js',
  'WordPress',
  'Webflow',
  'Shopify',
  'UI/UX Design',
  'Creative Builder',
];

export const timeline = [
  {
    period: '2022 - Present',
    title: 'Frontend Developer',
    place: 'Tier2 Digital',
    detail: 'Building custom WordPress, WooCommerce, React, and conversion-focused web experiences.',
    icon: Code2,
  },
  {
    period: '2020 - 2022',
    title: 'Independent web builder',
    place: 'Freelance and product experiments',
    detail: 'Shipped client websites, landing pages, CMS workflows, and interaction prototypes.',
    icon: Braces,
  },
  {
    period: '2017 - 2020',
    title: 'B.C.A.',
    place: 'AIIS, Bengaluru',
    detail: 'Computer applications foundation with a focus on web development and systems thinking.',
    icon: ShoppingBag,
  },
];
