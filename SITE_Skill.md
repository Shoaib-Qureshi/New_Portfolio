# Portfolio Site Handoff

Last updated: 2026-05-23

This file is a compact source of truth for future chats working on this portfolio. It summarizes the current site direction, important files, completed visual changes, and known implementation notes.

## Project Overview

This is a dark, cinematic personal portfolio for Shoaib Qureshi. The visual direction is minimalist, high-contrast, premium, and motion-led without becoming decorative. The site is built as a Next.js app with React, Tailwind, Framer Motion, GSAP, Three.js, and Spline.

The current experience is not a static portfolio. It uses:

- A loader before the initial hero reveal.
- A particle-based hero field.
- Scroll-reactive text in the About section.
- Spline/visual treatment in the Work section.
- A scroll-driven creative projects image wall.
- A custom particle background for testimonials.
- Detailed case study pages driven from project content.

## Core Files

- `components/portfolio-experience.tsx`
  Main homepage experience. Contains loader, nav, hero, about, work cards, creative projects section, testimonials, and contact.

- `components/case-study.tsx`
  Dynamic case study layout for `/work/[id]`.

- `components/hero-interactive-field.tsx`
  Three.js/particle hero field.

- `components/spline-work-scene.tsx`
  Spline scene used in the work section. Current Spline asset is `public/Radiant Shift.spline`.

- `components/fluid-particles-background.tsx`
  Canvas-based fluid particle background used in testimonials.

- `lib/seed-content.ts`
  Main fallback project/content data. PrepMedico is project `01`.

- `lib/content-store.ts`
  Loads content, database fallback, and project accent mapping.

- `data/portfolio.sqlite`
  Local content database. PrepMedico content was also updated here previously.

- `app/globals.css`
  Global styling, smooth scroll, glass helpers, and some older testimonial thread CSS that may now be unused.

## Homepage Current State

### Hero

File: `components/portfolio-experience.tsx`

Current treatment:

- Loader reveals the hero.
- Hero uses `HeroInteractiveField`, a fixed particle field behind the text.
- Particles continue subtly as the page scrolls.
- Hero text reveals in stages through GSAP.
- The old "Live Build Signal" panel was removed.
- There is still an availability card near the lower right.

Notes:

- Particle movement and scroll-following are handled through custom events such as `hero-bubble-scroll`.
- The hero field should stay smooth and minimal. Avoid adding heavy panels back over it.

### About Section

File: `components/portfolio-experience.tsx`

Current treatment:

- Sticky section with scroll-based text reveal.
- First text starts with a few visible words, then reveals by opacity as the user scrolls.
- After the first text exits, the second text block reveals with a different line-based animation.
- Skills are shown as compact pill tags.
- Timeline cards sit below and were moved upward to reduce empty space.

Design intent:

- Keep it as one continuous section.
- Avoid making the text too large; earlier versions overflowed the viewport.
- Motion should feel smooth and restrained.

### Work Section

File: `components/portfolio-experience.tsx`

Current treatment:

- Uses `SplineWorkScene` with `Radiant Shift.spline`.
- The previous jellyfish visual was removed.
- The visual was adjusted to rotate automatically and respond to scroll glow rather than unreliable hover.
- Project filter pills were changed to a one-line horizontal row.
- Project cards have hover polish.
- Main card icons no longer fill on hover.
- Arrow buttons do fill on hover.

Notes:

- Keep the Spline visual blended into the background. Avoid adding a visible box around it.
- If the Spline looks pixelated, check asset quality, canvas sizing, DPR, and CSS scale.

### Creative Projects Section

File: `components/portfolio-experience.tsx`

Current treatment:

- Scroll-driven image wall inspired by vertical social/video collage references, but implemented as normal image cards, not video.
- Initial state has upper and lower image rows entering from top/bottom.
- Images move left-to-right.
- Center gap holds the heading text.
- As scroll progresses, the heading fades out and cards transition into a fuller grid/wall.
- Row spacing was increased, column spacing decreased.

Important tuning variables are near `CreativeProjectsSection`:

- `movingGap`
- `revealColGap`
- `revealRowGap`
- `initialX`
- `initialY`
- `finalX`
- `finalY`

Keep row spacing visible. The user specifically asked for more row spacing and slightly less column spacing.

### Testimonials

Files:

- `components/portfolio-experience.tsx`
- `components/fluid-particles-background.tsx`

Current treatment:

- Old ferro/thread-style testimonial background was removed from the active section.
- Testimonials now use `FluidParticlesBackground`.
- The particle canvas is scoped to the section, uses intersection/reduced-motion logic, and keeps density controlled.

Notes:

- Some old `.testimonial-thread-field` CSS remains in `app/globals.css`; it appears unused unless referenced later.

## PrepMedico Content

PrepMedico is now the primary case study/project.

Project ID:

```txt
prepmedico
```

Live site:

```txt
https://prepmedico.com/
```

Summary:

Custom WordPress and WooCommerce automation suite for medical course editions, registration tracking, CRM sync, WhatsApp campaigns, and performance optimization.

Key impact:

- Saved 70-80% manual effort.
- Reduced long-standing error states by roughly 80%.
- Improved homepage performance score from 18 to 87.
- Built 7 custom workflow plugins/features.

Major pieces included in content:

- Edition Management Plugin
- FluentCRM Contact by Editions Plugin
- AiSensy + FluentCRM Integration Plugin
- AiSensy Drip Campaign Plugin
- Hide Billing Fields Plugin
- PrepMedico Spotlight Carousel
- PrepMedico Performance Optimizer Plugin

## Case Study Page Current State

File: `components/case-study.tsx`

Current treatment:

- Full-screen dark hero.
- Project image is used as a large right-anchored background layer, blended left with gradients.
- Hero copy is bottom-aligned and full-width, with reveal animation.
- Tags and live-site CTA sit in the hero row.
- Duplicate hero metric cards were removed.
- The highlights row below the hero is the only place where metrics appear.
- Challenge/Solution, Process, Role/Impact, and navigation sections follow.

Recent direction:

- The user disliked repeated content between the left hero text and right "Project Snapshot" card.
- The current file has moved away from that repeated right-side card treatment.
- If adding a right-side treatment again, do not restate the same intro. Use visual storytelling, a workflow path, before/after transformation, or an operational diagram instead.

Current sections:

- Hero
- Highlights
- Challenge + Solution
- Process
- Role + Impact
- Project navigation

Design notes:

- Keep the hero image treated, not raw.
- Avoid cramped overlay cards on the image.
- Avoid repeating the same project summary in multiple places.
- Metrics should not appear both in hero and the highlights row.

## Performance And Motion Notes

- The user reported scroll lag earlier. Avoid adding heavy always-on animations.
- Prefer `requestAnimationFrame`, intersection checks, and reduced-motion handling for canvas/particle work.
- Homepage scroll container is internal: `h-screen overflow-y-auto`.
- Many scroll calculations depend on `containerRef`, not the window.
- Use `localhost:3000` for visual checks if the dev server is running. Previous checks against `127.0.0.1` had issues with Next dev/HMR.

## Build And Verification

Use:

```bash
cmd /c npm run build
```

Expected current build behavior:

- Build should pass.
- Next.js may warn that `middleware` file convention is deprecated and recommends `proxy`. This warning is existing and not caused by recent visual work.

## Design Preferences Captured From The User

- Minimal, aesthetic, premium, and slightly out-of-the-box.
- Avoid generic internet-looking sections.
- Motion should be smooth, not aggressive.
- Visuals should blend into the dark background.
- Avoid visible boxes around decorative visuals.
- Reduce repeated content.
- Prefer scroll-triggered effects over inaccurate hover interactions for large visuals.
- Keep cards polished, but not too crowded.
- Use real images/visual assets where possible.

## Things To Watch Next

- Case study hero may need continued treatment to avoid repeating content.
- If the current case study hero feels too plain, add a non-repetitive visual system:
  - workflow path
  - before/after operational states
  - plugin stack map
  - performance recovery graph
  - edition-to-CRM-to-WhatsApp pipeline
- Keep highlights as the single metrics section.
- If changing creative projects spacing, inspect at 1440px and 1536px widths.
- If changing particles/Spline, verify scroll performance before finalizing.

