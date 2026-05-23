import type { PortfolioContent } from '@/lib/content-types';

export const seedContent: PortfolioContent = {
  projects: [
    {
      num: '01',
      id: 'prepmedico',
      title: 'PrepMedico',
      category: 'Education',
      tags: ['WordPress', 'WooCommerce', 'FluentCRM', 'AiSensy', 'PHP', 'Make'],
      color: '#F5F5F5',
      desc: 'Custom WordPress and WooCommerce automation suite for medical course editions, registration tracking, CRM sync, WhatsApp campaigns, and performance optimization.',
      year: '2024',
      role: 'WordPress plugin engineering, WooCommerce automation, CRM integration, WhatsApp workflow design, and performance engineering.',
      impact: 'Saved the PrepMedico team 70-80% of manual effort, reduced long-standing site error states by roughly 80%, and improved the redesigned homepage performance score from 18 to 87.',
      iconKey: 'braces',
      image: {
        src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80',
        alt: 'Medical education platform workflow reviewed on a laptop',
      },
      processImage: {
        src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80',
        alt: 'Developer workstation used for automation and plugin architecture',
      },
      challenge:
        'PrepMedico needed to run current and upcoming course editions at the same time while reusing the same WooCommerce products, keeping registration data easy to audit, and reducing repetitive admin work across course setup, CRM updates, and WhatsApp communication. The redesigned homepage also introduced heavy DOM manipulation and weak caching, creating poor performance and recurring site errors.',
      solution:
        'Built a suite of custom WordPress plugins around the PrepMedico workflow: an edition management engine, FluentCRM contact reporting, AiSensy campaign triggers, configurable drip messaging, dynamic billing-field controls, a Google Sheets powered Instagram spotlight carousel, and a reusable performance optimizer with DOM management, safe font rendering, minification, caching, and a custom X-PrepMedico: HIT response header.',
      highlights: [
        { metric: '70-80%', label: 'Manual effort saved' },
        { metric: '~80%', label: 'Error states reduced' },
        { metric: '18 -> 87', label: 'Performance score lift' },
        { metric: '7', label: 'Custom workflow plugins' },
      ],
      process: [
        {
          phase: '01',
          title: 'Edition Management Engine',
          detail:
            'Built a custom plugin to automate course edition setup, current and next course handling, same-product course mapping, dynamic tables, registration badges, new course configuration, and ASiT membership workflow logic.',
        },
        {
          phase: '02',
          title: 'Registration Intelligence',
          detail:
            'Created FluentCRM Contact by Editions so doctors can track registrations by edition number, review clean registration tables, export CSVs, and keep WooCommerce contacts synced into FluentCRM automatically.',
        },
        {
          phase: '03',
          title: 'WhatsApp Campaign Automation',
          detail:
            'Integrated AiSensy with FluentCRM so new contacts and automation notes can trigger WhatsApp messages. Added error logging and a simple campaign-management interface for new campaign setups.',
        },
        {
          phase: '04',
          title: 'Dynamic Checkout Controls',
          detail:
            'Built a dashboard-managed Hide Billing Fields plugin to conditionally remove speciality and exam-date fields for selected product categories without touching code for each campaign.',
        },
        {
          phase: '05',
          title: 'Spotlight Content Pipeline',
          detail:
            'Developed the PrepMedico Spotlight Carousel to display Instagram images filtered by hashtags, pulled from Google Sheets through Make. The feature is structured for ongoing enhancement.',
        },
        {
          phase: '06',
          title: 'Performance Optimizer',
          detail:
            'Created a reusable optimizer plugin for the redesigned homepage, handling heavy DOM manipulation, safe font rendering, JS/CSS minification, caching, and the custom X-PrepMedico: HIT cache header.',
        },
        {
          phase: '07',
          title: 'Stability & Handover',
          detail:
            'Reduced long-standing error states, simplified admin workflows, and gave the team repeatable plugin controls so course operations, CRM exports, and campaign setup no longer depend on manual intervention.',
        },
      ],
      link: 'https://prepmedico.com/',
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
      iconKey: 'palette',
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
        { metric: '2.3x', label: 'Mobile session length' },
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
      iconKey: 'layout',
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
  ],
  skills: [
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
  ],
  marquee: [
    'Frontend Developer',
    'React.js',
    'Next.js',
    'WordPress',
    'Webflow',
    'Shopify',
    'UI/UX Design',
    'Creative Builder',
  ],
  timeline: [
    {
      period: '2022 - Present',
      title: 'Frontend Developer',
      place: 'Tier2 Digital',
      detail: 'Building custom WordPress, WooCommerce, React, and conversion-focused web experiences.',
      iconKey: 'code',
    },
    {
      period: '2020 - 2022',
      title: 'Independent web builder',
      place: 'Freelance and product experiments',
      detail: 'Shipped client websites, landing pages, CMS workflows, and interaction prototypes.',
      iconKey: 'braces',
    },
    {
      period: '2017 - 2020',
      title: 'B.C.A.',
      place: 'AIIS, Bengaluru',
      detail: 'Computer applications foundation with a focus on web development and systems thinking.',
      iconKey: 'shoppingBag',
    },
  ],
  testimonials: [
    {
      quote:
        'Working with Shoaib felt like having an in-house developer. The attention to detail and delivery speed were exceptional.',
      name: 'Sarah Coleman',
      title: 'CEO, NovaTech',
      initials: 'SC',
    },
    {
      quote: "From the first call to the final handoff, everything was seamless. The UI/UX work was some of the best we've seen.",
      name: 'Daniel Reyes',
      title: 'Product Manager, Clarity CRM',
      initials: 'DR',
    },
    {
      quote: 'We came with a rough idea and it turned into a beautiful, functional product in weeks. Highly recommended.',
      name: 'Rachel Lin',
      title: 'Co-Founder, Driftly',
      initials: 'RL',
    },
    {
      quote: 'Communication is fast, process is clear, and the results speak for themselves. Engagement went up 40% post-launch.',
      name: 'Marcus Webb',
      title: 'CTO, Stackflow',
      initials: 'MW',
    },
  ],
};
