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
        src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=70',
        alt: 'Medical education platform workflow reviewed on a laptop',
      },
      processImage: {
        src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=70',
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
      id: 'liquidflow',
      title: 'LiquidFlow',
      category: 'Apps',
      tags: ['Laravel', 'React.js', 'Tailwind CSS', 'MySQL', 'WordPress', 'WooCommerce', 'Stripe', 'GSAP', 'Spline'],
      color: '#F5F5F5',
      desc: 'Built the full platform powering LiquidFlow, a design subscription service by Tier2 Digital. Includes a Laravel task portal with real-time designer collaboration, a zero-touch WooCommerce onboarding pipeline, and a GSAP-animated WordPress landing page with custom 3D visual elements.',
      year: '2024',
      role: 'Full-stack development, Laravel API, React task portal, WooCommerce subscription pipeline, GSAP animations, 3D landing page',
      impact: 'The platform now runs a live design subscription service across three pricing tiers, with fully automated subscriber onboarding, a multi-brand task portal, and a conversion-focused landing page that showcases 3D design capabilities.',
      iconKey: 'workflow',
      image: {
        src: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=70',
        alt: 'LiquidFlow design subscription platform dashboard',
      },
      processImage: {
        src: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=70',
        alt: 'Design task workflow and collaboration board',
      },
      challenge:
        'Tier2 Digital needed a purpose-built platform to run their subscription design service, one that could handle client task submissions, designer assignments, in-task communication, and priority queuing, all without manual overhead. The onboarding pipeline had to be fully automated: a WooCommerce subscription should instantly provision a Laravel account and grant portal access, with no human step in between. The public landing page also needed a full redesign to match the quality of the product and convert visitors across Starter, Business, and Agency tiers.',
      solution:
        'Built the complete platform from scratch: a Laravel backend with role-based access and a webhook-driven provisioning endpoint, a React task portal with priority queuing, designer assignment, comment threads, and AJAX-powered live updates. The WooCommerce-to-Laravel pipeline handles account creation, role assignment, and onboarding emails automatically on order completion. The WordPress landing page was rebuilt with GSAP scroll animations (staggered reveals, cinematic hero sequences, and 3D elements created in Spline) to demonstrate the service\'s design quality and drive subscription conversions.',
      highlights: [
        { metric: '3 tiers', label: 'Starter · Business · Agency' },
        { metric: '100%', label: 'Automated onboarding' },
        { metric: 'Real-time', label: 'Designer collaboration' },
        { metric: 'GSAP + 3D', label: 'Landing page' },
      ],
      process: [
        {
          phase: '01',
          title: 'Platform Architecture',
          detail:
            'Designed the end-to-end system: Laravel API, React SPA, and the WooCommerce-to-Laravel provisioning pipeline. Defined webhook contracts, subscription tier role mappings, and the Stripe access gate model before writing a line of code.',
        },
        {
          phase: '02',
          title: 'Laravel API & Subscription Pipeline',
          detail:
            'Built the Laravel backend with Sanctum auth, role-based access control, and data models for tasks, assignments, and comments. The WooCommerce webhook endpoint creates a new portal account, assigns the correct plan role, and triggers an onboarding email automatically on every successful order.',
        },
        {
          phase: '03',
          title: 'React Task Portal',
          detail:
            'Developed the React SPA with a priority-aware task board. Clients can submit up to five tasks daily, set priorities, and attach briefs. Designers get real-time status updates via AJAX polling, with task ownership and sequential completion built into the workflow.',
        },
        {
          phase: '04',
          title: 'Collaboration & Communication',
          detail:
            'Added in-task comment threads and review flows so clients and designers can communicate, share Figma links, and request revisions without leaving the portal. Built to support simultaneous multi-designer access across shared client accounts.',
        },
        {
          phase: '05',
          title: 'GSAP Landing Page',
          detail:
            'Rebuilt the WordPress marketing site with GSAP animations learned and implemented from scratch: scroll-triggered section reveals, staggered headline entrances, and a cinematic hero sequence. Pricing, process, and feature sections were restructured to guide visitors toward the right subscription tier.',
        },
        {
          phase: '06',
          title: '3D Visual Elements',
          detail:
            'Designed and integrated custom 3D elements using Spline to elevate the landing page beyond standard web aesthetics. The 3D assets reinforce the service\'s advanced design capability, particularly relevant for the Business plan\'s 3D and AR deliverables offering.',
        },
      ],
      link: 'https://liquidflow.design/',
    },
    {
      num: '03',
      id: 'threadwrite',
      title: 'ThreadWrite',
      category: 'Apps',
      tags: ['Node.js', 'TypeScript', 'LangGraph', 'Gemini', 'Google Docs', 'Fastify', 'SQLite', 'Apps Script'],
      color: '#F5F5F5',
      desc: 'AI-powered editorial tool built entirely inside Google Docs. Editors highlight text, leave a comment, and the system runs it through an 8-stage quality pipeline (safety gate, retrieval, rewrite, 3 parallel validators, AI judge), then posts the result as a reply. No external tools, no copy-pasting.',
      year: '2025',
      role: 'Architecture, LangGraph pipeline design, Fastify backend, Google Apps Script integration, vector store, test suite',
      impact: 'Delivered a zero-friction AI editing layer inside the tool editors already use, with medical safety guarantees, conversational refinement, and a style learning system that only trains on human-approved rewrites.',
      iconKey: 'braces',
      image: {
        src: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=1200&q=70',
        alt: 'AI-assisted text editing interface on a modern screen',
      },
      processImage: {
        src: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=70',
        alt: 'AI pipeline workflow diagram with nodes and connections',
      },
      challenge:
        'Editorial teams working on healthcare content needed AI writing assistance that fit their existing Google Docs workflow, not another external tool requiring copy-pasting. The system had to prevent clinical fact drift (a hard medical safety requirement), support iterative refinement through conversation, and get smarter over time using only human-approved suggestions. It also needed to be resilient enough to handle full Drive folder batches, API outages, and rate limits without dropping work.',
      solution:
        'Built an Apps Script add-on that intercepts comment events in Google Docs and forwards them to a Fastify backend running a LangGraph state machine. The 8-node pipeline covers intent analysis, a medical safety gate that locks clinical facts, vector retrieval of similar approved examples, rewrite generation, three parallel validators (meaning preservation, instruction following, SEO), and an independent AI judge with one auto-retry on failure. Editors can reply to any suggestion to refine it further, and the AI reads the full thread and improves iteratively. Approved rewrites are stored as embeddings and fed into future prompts; rejected ones are never learned from.',
      highlights: [
        { metric: '8-stage', label: 'Quality pipeline' },
        { metric: '3', label: 'Parallel validators' },
        { metric: '32', label: 'Automated tests' },
        { metric: 'Zero', label: 'External tools needed' },
      ],
      process: [
        {
          phase: '01',
          title: 'Pipeline Architecture',
          detail:
            'Designed the full LangGraph state machine before writing application code, mapping each node (intent, safety, retrieval, rewrite, validate ×3, judge), defining state schema with Zod, and planning the retry and fallback paths for model failures.',
        },
        {
          phase: '02',
          title: 'Google Docs Integration',
          detail:
            'Built the Apps Script add-on to detect comment events, extract highlighted text and thread context, and POST to the Fastify backend. On pipeline completion, the suggestion is posted back as a reply to the original comment, so the editor never leaves the document.',
        },
        {
          phase: '03',
          title: '8-Stage Quality Pipeline',
          detail:
            'Implemented the full LangGraph workflow: intent classification → medical safety gate (blocks rewrites that alter clinical facts) → vector retrieval of approved past examples → Gemini rewrite → three parallel validators checking meaning, instruction compliance, and SEO → independent AI judge with structured scoring and one auto-retry on any failure.',
        },
        {
          phase: '04',
          title: 'Conversational Refinement',
          detail:
            'Enabled multi-turn editing by reading the full Google Docs comment thread on each invocation. Editors can reply with follow-up instructions ("make it shorter", "add a statistic"), and the pipeline re-runs with the full conversation as context, improving iteratively.',
        },
        {
          phase: '05',
          title: 'Style Learning System',
          detail:
            'Built a human-gated style memory using SQLite with vector similarity search. Every completed suggestion gets an Approve/Reject column. Approved rewrites are embedded and stored as searchable examples. The retrieval node surfaces the most similar approved examples for each new rewrite. Rejected suggestions are never learned from.',
        },
        {
          phase: '06',
          title: 'Scale & Reliability',
          detail:
            'Added full-folder batch processing via Google Drive API, API rate limiting with request queuing, automatic model fallbacks (Gemini → OpenRouter), a circuit breaker for sustained outages, PHI-safe hashed logging for healthcare compliance, and 32 Vitest tests covering pipeline nodes, validators, and edge cases.',
        },
      ],
      link: 'https://github.com/Shoaib-Qureshi/AI-blog-commits',
    },
    {
      num: '04',
      id: 'ananth-decodes',
      title: 'Ananth Decodes',
      category: 'Brand',
      tags: ['Laravel', 'PHP', 'Blade', 'Tailwind CSS', 'MySQL', 'Razorpay', 'Google OAuth', 'Laravel Mix'],
      color: '#F5F5F5',
      desc: 'Full-stack Laravel platform for a logistics advisory firm with 25+ years of industry experience. Covers a blog, board insights, book reviews, expert contributor desk, event registration, gallery, and a custom admin CMS that lets the client update every section of the site without touching code.',
      year: '2025',
      role: 'Full-stack development, Laravel architecture, custom admin CMS, contributor workflow, event & payment integration, Hostinger deployment',
      impact: 'Gave a high-credibility logistics expert a fully self-managed digital presence: 6+ content modules, a live contributor publishing platform, and event registration with Razorpay payments, all controllable from the admin panel.',
      iconKey: 'layout',
      image: {
        src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=70',
        alt: 'Logistics supply chain operations aerial view',
      },
      processImage: {
        src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=70',
        alt: 'Content strategy and editorial planning workspace',
      },
      challenge:
        'Dr. Ananthakrishnan Janardhanan, a logistics strategist with 25+ years of experience and 500+ published articles, needed a professional platform that could house multiple content verticals (blog, board insights, book reviews, expert contributor pieces, events) without requiring a developer for every update. The admin needed full control over every section of the site, contributors needed a structured application and approval workflow, and events needed to support online registration with payment.',
      solution:
        'Built a Laravel 8 platform with Blade templates and Tailwind CSS, structured around a custom admin CMS that covers every content section: blog posts, board insights, book reviews, the expert desk, event management, gallery, and site-wide copy. Contributors apply through the platform, get reviewed and approved, then publish under their own byline. Events use Razorpay for registration payments. Google OAuth handles contributor and admin login. The full stack was deployed to Hostinger shared hosting with a tuned Laravel Mix build pipeline.',
      highlights: [
        { metric: '6+', label: 'Content modules' },
        { metric: 'Full CMS', label: 'Admin panel control' },
        { metric: 'Razorpay', label: 'Event payments' },
        { metric: '500+', label: 'Articles supported' },
      ],
      process: [
        {
          phase: '01',
          title: 'Architecture & Content Modelling',
          detail:
            'Mapped the full content model across six verticals: blog, board insights, book reviews, expert desk, events, and gallery. Designed the MySQL schema, defined contributor vs admin roles, and planned the Laravel routing structure before writing any templates.',
        },
        {
          phase: '02',
          title: 'Custom Admin CMS',
          detail:
            'Built a bespoke admin dashboard covering every editable section of the site. The client can create, edit, and publish content across all modules, manage contributors, moderate applications, upload gallery images, and configure event details, entirely without developer involvement.',
        },
        {
          phase: '03',
          title: 'Content Sections',
          detail:
            'Developed the full public-facing content layer: a blog with category filtering, board insights for strategic commentary, book reviews, and a curated gallery. Each section is independently manageable from the admin panel with its own publish/draft/archive controls.',
        },
        {
          phase: '04',
          title: 'Expert Contributor Desk',
          detail:
            'Built a contributor platform where logistics practitioners apply to write for the Expert Desk. Applications go through an admin approval workflow before publishing rights are granted. Approved contributors get their own login, byline, and article management dashboard.',
        },
        {
          phase: '05',
          title: 'Events & Payments',
          detail:
            'Implemented event management for logistics conferences and workshops, including the LogiSphere series. Attendees register and pay through a Razorpay-integrated checkout. Admins manage event listings, capacity, and registration records from the CMS.',
        },
        {
          phase: '06',
          title: 'Auth & Deployment',
          detail:
            'Integrated Google OAuth for frictionless contributor and admin sign-in alongside traditional credential login. Deployed to Hostinger shared hosting with a production-tuned Laravel Mix build, optimised asset pipeline, and environment-specific configuration for stability.',
        },
      ],
      link: 'https://www.ananthdecodeslogistics.com/',
    },
    {
      num: '05',
      id: 'frontend-auditor',
      title: 'Frontend Auditor',
      category: 'Apps',
      tags: ['Node.js', 'React', 'Vite', 'Playwright', 'Lighthouse', 'SQLite', 'AI Integration', 'JavaScript'],
      color: '#F5F5F5',
      desc: 'Agentic AI tool for automated frontend website auditing. Accepts any URL, queues crawl jobs, and generates comprehensive reports across performance, SEO, security, and broken-link analysis — with real-time log streaming and JSON/HTML export.',
      year: '2025',
      role: 'Full-stack development, agentic crawler architecture, Playwright + Lighthouse integration, AI content review pipeline, React frontend.',
      impact: 'Reduces manual site auditing from hours to minutes. A single URL submission triggers a fully automated audit covering Core Web Vitals, SEO signals, security headers, and crawl mapping across up to 50 pages, with a shareable report at the end.',
      iconKey: 'code2',
      image: {
        src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=70',
        alt: 'Code editor with frontend performance audit results',
      },
      processImage: {
        src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=70',
        alt: 'Analytics dashboard showing web performance metrics',
      },
      challenge:
        'Auditing a website end-to-end — performance, SEO, security, broken links, and content quality — normally requires running four or five separate tools, stitching results together manually, and re-running everything when the site changes. There was no single tool that could crawl a site to a configurable depth, score every page through Lighthouse, scan headers for security issues, and pass content through an AI reviewer, all from a single URL submission.',
      solution:
        'Built an agentic auditing system with a Node.js queue-backed worker, a Playwright-powered crawler, and a React 19 + Vite frontend. The user submits a URL and crawl depth (10, 30, or 50 pages). A background worker queues and processes pages through Lighthouse for Core Web Vitals, a custom SEO validator, an HTTP header security scanner, and an OpenRouter-powered AI content reviewer. Results stream in real time via live logs and are presented across six analysis tabs. Reports export as JSON or formatted HTML.',
      highlights: [
        { metric: '6', label: 'Analysis dimensions' },
        { metric: '50 pages', label: 'Max crawl depth' },
        { metric: 'Real-time', label: 'Live log streaming' },
        { metric: 'AI-powered', label: 'Content review layer' },
      ],
      process: [
        {
          phase: '01',
          title: 'Crawler & Queue Architecture',
          detail:
            'Built a framework-free Node.js server with a SQLite-backed job queue. Playwright handles the crawl — following internal links up to the configured depth, deduplicating URLs, and tracking redirects and broken links. Each crawled page is queued as an individual audit job.',
        },
        {
          phase: '02',
          title: 'Lighthouse Performance Auditing',
          detail:
            'Integrated Lighthouse programmatically to score each crawled page against Core Web Vitals and overall performance. Results include LCP, CLS, TBT, and the full Lighthouse opportunity list, surfaced per-page in the report.',
        },
        {
          phase: '03',
          title: 'SEO & Metadata Validation',
          detail:
            'Built a custom SEO validator that checks title and description presence and length, canonical tags, Open Graph metadata, sitemap and robots.txt availability, and heading structure. Coverage stats roll up to a site-wide SEO score.',
        },
        {
          phase: '04',
          title: 'Security Header Scanning',
          detail:
            'The security scanner checks each page\'s HTTP response headers for HTTPS enforcement, HSTS, CSP, X-Frame-Options, referrer policy, and TLS configuration. Missing or misconfigured headers are flagged with remediation notes.',
        },
        {
          phase: '05',
          title: 'AI Content Review',
          detail:
            'Piped page content through OpenRouter\'s API for AI-powered readability, clarity, and relevance analysis. The reviewer surfaces thin content, keyword stuffing signals, and structural copy issues per page, gated behind an optional API key.',
        },
        {
          phase: '06',
          title: 'React Frontend & Report Export',
          detail:
            'Built the React 19 + Vite frontend with Framer Motion for animated state transitions. Live log streaming gives real-time visibility into the worker. Results are split across six tabs. Reports export as structured JSON for downstream tooling or as a formatted HTML file for sharing.',
        },
      ],
      link: 'https://github.com/Shoaib-Qureshi/frontend_testing',
    },
  ],
  galleryImages: [
    {
      src: '/img/a-decades-old-hospital-digitally-enabled.jpg',
      alt: 'A decades old hospital digitally enabled!',
      title: 'A decades old hospital digitally enabled!',
      sub: 'Gallery',
    },
    {
      src: '/img/can-we-slow-down-time-a-bit.jpg',
      alt: 'Can we slow down time a bit',
      title: 'Can we slow down time a bit',
      sub: 'Gallery',
    },
    {
      src: '/img/feature-rich-and-modern-and-to-delight.jpg',
      alt: 'Feature rich and modern, and to delight',
      title: 'Feature rich and modern, and to delight',
      sub: 'Gallery',
    },
    {
      src: '/img/functional-and-what-not-kept-simple.jpg',
      alt: 'Functional and what not, kept simple',
      title: 'Functional and what not, kept simple',
      sub: 'Gallery',
    },
    {
      src: '/img/give-me-minimalist-give-me-an-identity.jpg',
      alt: 'Give me minimalist. Give me an identity',
      title: 'Give me minimalist. Give me an identity',
      sub: 'Gallery',
    },
    {
      src: '/img/intelligent-friendly-and-decisively-modern.jpg',
      alt: 'Intelligent, friendly, and decisively modern',
      title: 'Intelligent, friendly, and decisively modern',
      sub: 'Gallery',
    },
    {
      src: '/img/make-it-bold-make-it-exclusive.jpg',
      alt: 'Make it bold, make it exclusive',
      title: 'Make it bold, make it exclusive',
      sub: 'Gallery',
    },
    {
      src: '/img/make-it-modern-and-cool.jpg',
      alt: 'Make it modern and cool',
      title: 'Make it modern and cool',
      sub: 'Gallery',
    },
    {
      src: '/img/name-brand-and-navigate-intuitively.jpg',
      alt: 'Name, brand, and navigate intuitively',
      title: 'Name, brand, and navigate intuitively',
      sub: 'Gallery',
    },
    {
      src: '/img/plant-based-innovation-crafted-with-freshness.jpg',
      alt: 'Plant based innovation. Crafted with freshness',
      title: 'Plant based innovation. Crafted with freshness',
      sub: 'Gallery',
    },
    {
      src: '/img/precision-care-presented-with-clarity.jpg',
      alt: 'Precision care. Presented with clarity',
      title: 'Precision care. Presented with clarity',
      sub: 'Gallery',
    },
    {
      src: '/img/something-about-real-talk.jpg',
      alt: 'Something about real talk',
      title: 'Something about real talk',
      sub: 'Gallery',
    },
    {
      src: '/img/sophistication-and-elegance-only-please.jpg',
      alt: 'Sophistication and elegance only please',
      title: 'Sophistication and elegance only please',
      sub: 'Gallery',
    },
    {
      src: '/img/surprise-us-and-we-did.jpg',
      alt: 'Surprise Us. And we did',
      title: 'Surprise Us. And we did',
      sub: 'Gallery',
    },
    {
      src: '/img/we-ve-been-busy-shifting-the-horizons-for-global-education-can-you-help-us-go-digital.jpg',
      alt: "We've been busy shifting the horizons for global education, can you help us go digital",
      title: "We've been busy shifting the horizons for global education, can you help us go digital",
      sub: 'Gallery',
    },
    {
      src: '/img/we-want-to-stand-out-elegantly-and-adorably.jpg',
      alt: 'We want to stand out. Elegantly and adorably',
      title: 'We want to stand out. Elegantly and adorably',
      sub: 'Gallery',
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
    'Laravel',
    'Node.js',
    'WordPress',
    'WooCommerce',
    'Shopify',
    'Webflow',
    'MySQL',
    'Tailwind CSS',
    'UI/UX',
    'AI Integration',
    'Vibe Coding',
    'Git',
  ],
  marquee: [
    'Senior Frontend Developer',
    'React.js',
    'Next.js',
    'Laravel',
    'WordPress',
    'WooCommerce',
    'UI/UX Design',
    'AI Integration',
  ],
  timeline: [
    {
      period: '2022 - Present',
      title: 'Senior Frontend Developer',
      place: 'Tier2 Digital',
      detail: 'Building React applications, Laravel platforms, AI-powered tools, WordPress systems, and WooCommerce stores.',
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
  plugins: [
    {
      num: '01',
      id: 'fluentcrm-edition-contacts',
      name: 'FluentCRM Edition Contacts',
      category: 'WordPress Plugin',
      desc: 'Extends FluentCRM with edition-based contact segmentation and automated tag management for course-driven workflows.',
      tags: ['PHP', 'WordPress', 'FluentCRM', 'MySQL'],
      githubUrl: 'https://github.com/Shoaib-Qureshi/fluentcrm-edition-contacts',
      year: '2024',
    },
    {
      num: '02',
      id: 'ai-blog-commits',
      name: 'AI Blog Commits',
      category: 'AI Automation',
      desc: 'GitHub Action that reads commit history and auto-publishes AI-generated blog posts to WordPress.',
      tags: ['Node.js', 'GitHub Actions', 'AI Integration', 'TypeScript'],
      githubUrl: 'https://github.com/Shoaib-Qureshi/AI-blog-commits',
      year: '2025',
    },
  ],
  siteSettings: {
    hiddenSections: ['testimonials'],
    hiddenProjects: [],
  },
};
