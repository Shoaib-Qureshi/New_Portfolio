import type { PortfolioContent } from '@/lib/content-types';

export const seedContent: PortfolioContent = {
  projects: [
    {
      num: '01',
      id: 'thekua',
      title: 'The Thekua Company',
      category: 'E-commerce',
      tags: ['WordPress', 'WooCommerce', 'Three.js', 'GSAP', 'Lenis', 'PHP', 'Razorpay', 'Shiprocket'],
      color: '#F5F5F5',
      desc: 'D2C WooCommerce store for a handmade Mithila snack brand, with a scroll-driven Three.js product story, live 3D pack cards and a custom commerce and operations layer.',
      year: '2026',
      role: 'Frontend architecture, Three.js and GSAP scroll storytelling, 3D asset pipeline, WooCommerce customisation and custom plugin development.',
      impact: 'A homepage where the product assembles itself in 3D as you scroll, falling back to static stills on low-end devices, with the 3D download cut from 4.8 MB to 3.2 MB on desktop and 2.2 MB on phones.',
      iconKey: 'shoppingBag',
      image: { src: '/img/projects/thekua-hero.jpg', alt: 'The Thekua Company homepage hero' },
      processImage: { src: '/img/projects/thekua-process.jpg', alt: 'The Thekua Company product range' },
      challenge:
        'A traditional handmade snack needed a storefront that felt as crafted as the product, while still loading fast on the mid-range phones most Indian buyers use. Years of code had also piled up in one functions file, and checkout, delivery and support ran on manual work.',
      solution:
        'Hand-coded a homepage outside the page builder with a single sticky Three.js canvas driven by one GSAP timeline across five chapters: the thekua flies into the jar, more drop in, the lid screws on and the jar turns. A device check serves lite models or static stills where 3D would struggle. Around it, the store got live 3D pack cards with one-tap add to cart, Shiprocket delivery estimates, a restock waitlist, and three operations plugins for invoices, a WhatsApp inbox and a support chatbot.',
      highlights: [
        { metric: '5', label: 'Chapter 3D scroll story' },
        { metric: '-33%', label: '3D download size' },
        { metric: '3', label: 'Custom operations plugins' },
        { metric: '26', label: 'Custom store modules' },
      ],
      process: [
        { phase: '01', title: 'Audit & Restructure', detail: 'Broke the code that had piled up in the theme functions file into 26 focused feature modules, so each piece of store behaviour could be changed safely.' },
        { phase: '02', title: '3D Asset Pipeline', detail: 'Prepared the jar model and a scanned thekua with Draco compression and HDRI lighting, plus lite versions for phones, and matched them against the reference renders.' },
        { phase: '03', title: 'Scroll Story', detail: 'Built one GSAP ScrollTrigger timeline that drives a sticky Three.js scene through five chapters, with a custom shader rim so the glass jar stays readable.' },
        { phase: '04', title: 'Interactive Range', detail: 'Rendered the jar into four pack cards from a single canvas, with tilt on hover, spin on tap and one-tap AJAX add to cart into the cart drawer.' },
        { phase: '05', title: 'Commerce Layer', detail: 'Added pincode delivery estimates via Shiprocket, a back-in-stock waitlist, a size picker, variation fixes, WhatsApp consent at checkout, and a restyled cart, checkout and account area.' },
        { phase: '06', title: 'Performance & Fallbacks', detail: 'Gated 3D behind a device check (reduced motion, save-data, slow networks, low memory, no WebGL2) and cut the 3D payload by a third.' },
        { phase: '07', title: 'Operations Tooling', detail: 'Built custom plugins for PDF invoices, a WhatsApp Cloud API inbox inside WordPress admin, and a support and recipe chatbot.' },
      ],
      link: 'https://thekuacompany.com/',
    },
    {
      num: '03',
      id: 'guilded',
      title: 'Guilded',
      category: 'Apps',
      tags: ['Next.js', 'React', 'TypeScript', 'Prisma', 'MariaDB', 'NextAuth', 'Tailwind CSS', 'GSAP'],
      color: '#F5F5F5',
      desc: 'Invite-only peer community for agency founders: a vetted application flow, moderator and member dashboards, live sessions, and a credit-gated wall of client-experience reviews.',
      year: '2026',
      role: 'Full-stack product development: Figma-to-code with Figma MCP and Claude Code, data model, auth and roles, onboarding and vetting, member features, email infrastructure and the animated marketing site.',
      impact: 'Built a complete community product end to end, ready for launch: 24 screens across two role-based dashboards, an 18-model data layer, and 12 automated emails, built to stay correct across deploys and multiple server instances.',
      iconKey: 'layout',
      image: { src: '/img/projects/guilded-hero.jpg', alt: 'Guilded landing page hero' },
      processImage: { src: '/img/projects/guilded-process.jpg', alt: 'Guilded marketing page section' },
      challenge:
        'Agency founders needed somewhere to talk honestly about pricing, clients and hiring without freelancers or employees in the room. That meant gated entry, human vetting, and a way to share client-experience reviews without them being skimmed for free.',
      solution:
        'Built the whole product on Next.js and Prisma from a Figma design, using Figma MCP and Claude Code to turn frames into components. It has a multi-step application with a moderator review queue and invite-token onboarding, discussions, live sessions with RSVP and calendar files, and client-experience reviews unlocked through a credit ledger. A database-backed email outbox and rate limiter keep it reliable without extra infrastructure, and a GSAP scroll-animated landing page sells the membership.',
      highlights: [
        { metric: '24', label: 'App screens' },
        { metric: '18', label: 'Data models' },
        { metric: '12', label: 'Automated emails' },
        { metric: '2', label: 'Role-based dashboards' },
      ],
      process: [
        { phase: '01', title: 'Product Definition', detail: 'Turned the brief into user and moderator flows, a roles and permissions model, and a screen map tied to the Figma frames before writing code.' },
        { phase: '02', title: 'Data & Auth', detail: 'Designed an 18-model relational schema in Prisma and set up credentials auth with route protection for members and moderators.' },
        { phase: '03', title: 'Onboarding & Vetting', detail: 'Built the multi-step application, the moderator review queue, and invite-token links that deliver access by email.' },
        { phase: '04', title: 'Member Experience', detail: 'Built discussions, sessions with RSVP and calendar downloads that never leak the meeting link, and client-experience reviews.' },
        { phase: '05', title: 'Credit Ledger', detail: 'Gated reviews behind an append-only credit ledger where the balance is always computed and each earn or spend can only happen once.' },
        { phase: '06', title: 'Reliability', detail: 'Added a database-backed email outbox with cron retries, a deploy-safe rate limiter, error monitoring, indexes and smoke tests.' },
        { phase: '07', title: 'Marketing Site', detail: 'Built the landing page with GSAP ScrollTrigger animations, including stroke-drawn SVG rings, to present the membership.' },
      ],
      link: 'https://guilded.club/',
    },
    {
      num: '01',
      id: 'prepmedico',
      title: 'PrepMedico',
      category: 'Education',
      tags: ['WordPress', 'WooCommerce', 'FluentCRM', 'AiSensy', 'PHP', 'Make'],
      color: '#F5F5F5',
      desc: 'Custom WordPress and WooCommerce plugin suite for a medical e-learning platform: course editions, registration tracking, CRM sync, WhatsApp campaigns and a faster homepage.',
      year: '2024',
      role: 'WordPress plugin development, WooCommerce automation, FluentCRM and AiSensy integration, and performance work.',
      impact: 'Cut the team\'s manual admin work by 70-80%, reduced recurring site errors by about 80%, and raised the redesigned homepage\'s mobile performance score from 18 to 87.',
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
        'PrepMedico runs current and upcoming editions of the same course at once, on the same WooCommerce products. Staff set up each edition by hand, updated the CRM by hand and sent WhatsApp messages by hand, and registration data was hard to audit. A homepage redesign had also added heavy DOM work and weak caching, which hurt performance and caused recurring errors.',
      solution:
        'Built seven custom plugins around how the team works: an edition management engine, FluentCRM reporting by edition, AiSensy WhatsApp triggers and drip campaigns, dashboard-controlled checkout fields, an Instagram spotlight carousel fed from Google Sheets, and a reusable performance optimizer. More than 2,000 contacts now sync from WooCommerce into FluentCRM, and 38+ WhatsApp drip campaigns run from CRM triggers with no manual sends.',
      highlights: [
        { metric: '70-80%', label: 'Less manual admin work' },
        { metric: '~80%', label: 'Fewer site errors' },
        { metric: '18 -> 87', label: 'Performance score' },
        { metric: '7', label: 'Custom plugins' },
      ],
      process: [
        {
          phase: '01',
          title: 'Edition Management Engine',
          detail:
            'Automated course edition setup: current and next edition handling on the same product, dynamic tables, registration badges, new course configuration and the ASiT membership rules.',
        },
        {
          phase: '02',
          title: 'Registration Reporting',
          detail:
            'Built FluentCRM Contacts by Edition so staff can see registrations per edition, export clean CSVs, and keep 2,000+ WooCommerce contacts synced into FluentCRM automatically.',
        },
        {
          phase: '03',
          title: 'WhatsApp Campaign Automation',
          detail:
            'Connected AiSensy to FluentCRM so new contacts and automation notes trigger WhatsApp messages. 38+ drip campaigns now run on these triggers, with error logging and a simple screen for setting up new ones.',
        },
        {
          phase: '04',
          title: 'Dynamic Checkout Controls',
          detail:
            'Built a dashboard-managed plugin that hides the speciality and exam-date billing fields for chosen product categories, so a new campaign no longer needs a code change.',
        },
        {
          phase: '05',
          title: 'Spotlight Content Pipeline',
          detail:
            'Built the Spotlight Carousel, which shows Instagram images filtered by hashtag, pulled from Google Sheets through Make.',
        },
        {
          phase: '06',
          title: 'Performance Optimizer',
          detail:
            'Built a reusable optimizer plugin for the redesigned homepage: DOM cleanup, safe font rendering, JS and CSS minification, caching, and a custom X-PrepMedico: HIT cache header.',
        },
        {
          phase: '07',
          title: 'Stability & Handover',
          detail:
            'Cleared long-standing error states and gave the team plugin settings for course setup, CRM exports and campaigns, so day-to-day operations no longer wait on a developer.',
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
      desc: 'The full platform behind LiquidFlow, Tier2 Digital\'s design subscription service: a Laravel and React task portal, automated WooCommerce onboarding, and a GSAP-animated WordPress landing page with 3D elements.',
      year: '2024',
      role: 'Full-stack development: Laravel API, React task portal, WooCommerce subscription pipeline, GSAP animation and the 3D landing page.',
      impact: 'LiquidFlow now runs as a live subscription service on three pricing tiers. Subscribers are onboarded with no manual steps, tasks flow through a multi-brand portal, and the landing page shows the 3D work the service sells.',
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
        'Tier2 Digital needed its own platform to run a subscription design service: clients submit tasks, designers pick them up, both talk inside the task, and priorities decide the queue. Onboarding had to be automatic, so a WooCommerce subscription creates a portal account with the right access and no human step. The public landing page also needed a redesign to match the product and sell the Starter, Business and Agency tiers.',
      solution:
        'Built the platform from scratch. A Laravel backend handles role-based access and a webhook endpoint that provisions accounts. A React portal handles priority queuing, designer assignment, comment threads and live status updates. When a WooCommerce order completes, the pipeline creates the account, assigns the plan role and sends the onboarding email. The WordPress landing page was rebuilt with GSAP scroll animations and 3D elements made in Spline.',
      highlights: [
        { metric: '3 tiers', label: 'Starter · Business · Agency' },
        { metric: '100%', label: 'Automated onboarding' },
        { metric: 'Live', label: 'Task status updates' },
        { metric: 'GSAP + 3D', label: 'Landing page' },
      ],
      process: [
        {
          phase: '01',
          title: 'Platform Architecture',
          detail:
            'Designed the system end to end before writing code: the Laravel API, the React app and the WooCommerce-to-Laravel provisioning pipeline. Defined the webhook contracts, how each subscription tier maps to a role, and how Stripe payments gate access.',
        },
        {
          phase: '02',
          title: 'Laravel API & Subscription Pipeline',
          detail:
            'Built the Laravel backend with Sanctum auth, role-based access control and data models for tasks, assignments and comments. On every successful order, the WooCommerce webhook creates a portal account, assigns the plan role and sends an onboarding email.',
        },
        {
          phase: '03',
          title: 'React Task Portal',
          detail:
            'Built the React app around a priority-aware task board. Clients submit up to five tasks a day, set priorities and attach briefs. Designers see status updates through AJAX polling, with task ownership and sequential completion built into the workflow.',
        },
        {
          phase: '04',
          title: 'Collaboration & Communication',
          detail:
            'Added comment threads and review flows inside each task, so clients and designers can talk, share Figma links and request revisions without leaving the portal. Several designers can work on a shared client account at once.',
        },
        {
          phase: '05',
          title: 'GSAP Landing Page',
          detail:
            'Rebuilt the WordPress marketing site with GSAP: scroll-triggered section reveals, staggered headline entrances and an animated hero sequence. Restructured the pricing, process and feature sections to lead visitors to the right tier.',
        },
        {
          phase: '06',
          title: '3D Visual Elements',
          detail:
            'Designed custom 3D elements in Spline and built them into the landing page. They show the kind of 3D and AR work included in the Business plan.',
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
      desc: 'AI editorial tool that works inside Google Docs. An editor highlights text and leaves a comment; the system runs it through an 8-stage quality pipeline and posts the rewrite as a reply. No external tools and no copy-pasting.',
      year: '2025',
      role: 'Architecture, LangGraph pipeline design, Fastify backend, Google Apps Script integration, vector store and test suite.',
      impact: 'Built an AI editing layer inside the tool editors already use, with a medical safety gate, conversational refinement, and a style memory that learns only from rewrites a human has approved.',
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
        'Editorial teams working on healthcare content wanted AI help inside their existing Google Docs workflow, not another tool to copy text into. The system had to keep clinical facts unchanged, which is a hard requirement for medical content. It also had to support back-and-forth refinement, learn only from suggestions a human approved, and keep working through whole Drive folders, API outages and rate limits without dropping work.',
      solution:
        'Built an Apps Script add-on that picks up comment events in Google Docs and sends them to a Fastify backend running a LangGraph state machine. The 8-node pipeline covers intent analysis, a medical safety gate that locks clinical facts, retrieval of similar approved examples, the rewrite, three parallel validators (meaning, instruction following, SEO) and an independent AI judge with one automatic retry. Editors reply to a suggestion to refine it, and the pipeline reads the whole thread. Approved rewrites are stored as embeddings and used in later prompts; rejected ones are never learned from.',
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
            'Designed the full LangGraph state machine before writing application code: each node (intent, safety, retrieval, rewrite, three validators, judge), the state schema in Zod, and the retry and fallback paths for model failures.',
        },
        {
          phase: '02',
          title: 'Google Docs Integration',
          detail:
            'Built the Apps Script add-on to detect comment events, extract the highlighted text and thread context, and send them to the Fastify backend. When the pipeline finishes, the suggestion is posted as a reply to the original comment, so the editor never leaves the document.',
        },
        {
          phase: '03',
          title: '8-Stage Quality Pipeline',
          detail:
            'Implemented the workflow: intent classification, a medical safety gate that blocks rewrites which alter clinical facts, vector retrieval of approved past examples, the Gemini rewrite, three parallel validators for meaning, instruction compliance and SEO, and an independent AI judge with structured scoring and one automatic retry.',
        },
        {
          phase: '04',
          title: 'Conversational Refinement',
          detail:
            'Each run reads the full Google Docs comment thread, so editors can reply with follow-ups like "make it shorter" or "add a statistic" and the pipeline re-runs with the whole conversation as context.',
        },
        {
          phase: '05',
          title: 'Style Learning System',
          detail:
            'Built a human-gated style memory on SQLite with vector similarity search. Every suggestion gets an Approve or Reject mark. Approved rewrites are embedded and stored as examples, and the retrieval node pulls the most similar ones for each new rewrite. Rejected suggestions are never learned from.',
        },
        {
          phase: '06',
          title: 'Scale & Reliability',
          detail:
            'Added whole-folder batch processing through the Google Drive API, rate limiting with a request queue, automatic model fallback from Gemini to OpenRouter, a circuit breaker for long outages, PHI-safe hashed logging, and 32 Vitest tests covering pipeline nodes, validators and edge cases.',
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
      desc: 'Full-stack Laravel platform for a logistics advisory firm: blog, board insights, book reviews, an expert contributor desk, event registration, a gallery, and a custom admin CMS that lets the client update every section without touching code.',
      year: '2025',
      role: 'Full-stack development: Laravel architecture, custom admin CMS, contributor workflow, events and payments, Hostinger deployment.',
      impact: 'A logistics expert with 25+ years in the industry now runs the whole site without a developer: six content modules, a contributor publishing desk, and event registration with Razorpay payments, all managed from the admin panel.',
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
        'Dr. Ananthakrishnan Janardhanan, a logistics strategist with 25+ years of experience and 500+ published articles, needed one platform for several kinds of content: blog posts, board insights, book reviews, expert contributor pieces and events. Every section had to be editable without a developer. Contributors needed an application and approval workflow, and events needed online registration with payment.',
      solution:
        'Built a Laravel 8 platform with Blade templates and Tailwind CSS around a custom admin CMS that covers every section: blog, board insights, book reviews, the expert desk, events, gallery and site-wide copy. Contributors apply on the site, are reviewed and approved, then publish under their own byline. Events take registration payments through Razorpay, and Google OAuth handles contributor and admin sign-in. The site is deployed on Hostinger shared hosting with a tuned Laravel Mix build.',
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
            'Mapped the content model across six verticals: blog, board insights, book reviews, expert desk, events and gallery. Designed the MySQL schema, defined contributor and admin roles, and planned the Laravel routing before writing any templates.',
        },
        {
          phase: '02',
          title: 'Custom Admin CMS',
          detail:
            'Built a custom admin dashboard for every editable section. The client creates, edits and publishes content across all modules, manages contributors, moderates applications, uploads gallery images and sets up events, all without a developer.',
        },
        {
          phase: '03',
          title: 'Content Sections',
          detail:
            'Built the public content layer: a blog with category filtering, board insights for strategic commentary, book reviews and a curated gallery. Each section has its own publish, draft and archive controls in the admin panel.',
        },
        {
          phase: '04',
          title: 'Expert Contributor Desk',
          detail:
            'Built a contributor desk where logistics practitioners apply to write. Applications go through admin approval before publishing rights are granted. Approved contributors get their own login, byline and article dashboard.',
        },
        {
          phase: '05',
          title: 'Events & Payments',
          detail:
            'Built event management for logistics conferences and workshops, including the LogiSphere series. Attendees register and pay through a Razorpay checkout, and admins manage listings, capacity and registrations from the CMS.',
        },
        {
          phase: '06',
          title: 'Auth & Deployment',
          detail:
            'Added Google OAuth sign-in for contributors and admins alongside standard credentials. Deployed to Hostinger shared hosting with a production Laravel Mix build and environment-specific configuration.',
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
      desc: 'Agentic tool for automated website audits. Give it a URL and it queues crawl jobs and reports on performance, SEO, security and broken links, with live logs and JSON or HTML export.',
      year: '2025',
      role: 'Full-stack development: agentic crawler architecture, Playwright and Lighthouse integration, AI content review pipeline, React frontend.',
      impact: 'Cuts a manual site audit from hours to minutes. One URL starts a full audit of Core Web Vitals, SEO signals, security headers and crawl mapping across up to 50 pages, and ends with a shareable report.',
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
        'A full website audit covers performance, SEO, security, broken links and content quality. That normally means running four or five separate tools, stitching the results together by hand, and repeating it all when the site changes. No single tool crawled a site to a set depth, scored every page in Lighthouse, scanned security headers and passed the content to an AI reviewer from one URL.',
      solution:
        'Built an auditing system with a queue-backed Node.js worker, a Playwright crawler and a React 19 and Vite frontend. The user submits a URL and a crawl depth of 10, 30 or 50 pages. A background worker runs each page through Lighthouse for Core Web Vitals, a custom SEO validator, an HTTP header security scanner and an AI content reviewer on OpenRouter. Results stream in through live logs and appear across six analysis tabs. Reports export as JSON or formatted HTML.',
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
            'Built a framework-free Node.js server with a SQLite-backed job queue. Playwright crawls the site, following internal links to the set depth, removing duplicate URLs and tracking redirects and broken links. Each crawled page becomes its own audit job.',
        },
        {
          phase: '02',
          title: 'Lighthouse Performance Auditing',
          detail:
            'Ran Lighthouse programmatically to score each crawled page on Core Web Vitals and overall performance. The report shows LCP, CLS, TBT and the full Lighthouse opportunity list for every page.',
        },
        {
          phase: '03',
          title: 'SEO & Metadata Validation',
          detail:
            'Built a custom SEO validator that checks title and description presence and length, canonical tags, Open Graph metadata, sitemap and robots.txt availability, and heading structure. The results roll up into a site-wide SEO score.',
        },
        {
          phase: '04',
          title: 'Security Header Scanning',
          detail:
            'The security scanner checks each page\'s HTTP response headers for HTTPS enforcement, HSTS, CSP, X-Frame-Options, referrer policy and TLS configuration. Missing or misconfigured headers are flagged with notes on how to fix them.',
        },
        {
          phase: '05',
          title: 'AI Content Review',
          detail:
            'Sent page content to the OpenRouter API for an AI review of readability, clarity and relevance. The reviewer flags thin content, keyword stuffing and structural copy issues for each page, and only runs when an API key is set.',
        },
        {
          phase: '06',
          title: 'React Frontend & Report Export',
          detail:
            'Built the React 19 and Vite frontend with Framer Motion for state transitions. Live log streaming shows what the worker is doing. Results are split across six tabs, and reports export as structured JSON for other tools or as a formatted HTML file for sharing.',
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
