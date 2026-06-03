s Shoaib Qureshi Portfolio

Dark, cinematic personal portfolio built with Next.js, React, Tailwind CSS, Framer Motion, GSAP, Three.js, and Spline.

The site includes an animated hero, scroll-reactive sections, project filtering, quick-view project popups, creative image-wall motion, testimonials, contact form interactions, and dynamic case study pages.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP / ScrollTrigger
- Three.js
- Spline runtime
- SQLite content fallback/store

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```
s
Build for production:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

## Key Files

- `components/portfolio-experience.tsx`  
  Main homepage experience: hero, navigation, about, work, creative projects, testimonials, contact, and project modal.

- `components/case-study.tsx`  
  Dynamic case study page layout for `/work/[id]`.

- `components/hero-interactive-field.tsx`  
  Three.js particle field behind the hero.

- `components/spline-work-scene.tsx`  
  Spline visual used in the Work section.

- `components/fluid-particles-background.tsx`  
  Particle background used in Testimonials.

- `lib/seed-content.ts`  
  Fallback project, testimonial, timeline, and content data.

- `lib/content-store.ts`  
  Loads content and normalizes project data.

- `app/globals.css`  
  Global styles, design tokens, scroll behavior, and shared effects.

## Content Notes

Project and case study content is driven from the local content store with seed fallback data. PrepMedico is the primary case study and uses the project ID:

```txt
prepmedico
```

## Development Notes

- The homepage scrolls inside an internal `h-screen overflow-y-auto` container.
- Scroll calculations should use the local container ref where possible, not `window`.
- Keep decorative motion lightweight and respect reduced-motion behavior.
- Avoid adding heavy always-on animations unless they are gated by visibility.
- Keep the dark visual system minimal, premium, and motion-led.

## Build Notes

`npm run build` should pass. Next.js may show a warning that the `middleware` file convention is deprecated in favor of `proxy`; this is currently an existing framework warning.
