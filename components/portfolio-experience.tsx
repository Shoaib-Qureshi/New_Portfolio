'use client';

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronRight, Code2, Filter, GitBranch, Mail, Menu, Send, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryImage, Plugin, PortfolioContent, Project } from '@/lib/content-types';
import { getIcon } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CustomCursor } from '@/components/custom-cursor';
import { Button } from '@/components/ui/button';
import { AnimatedShine, SectionLabel } from '@/components/magic/animated-shine';

const sections = ['hero', 'about', 'work', 'plugins', 'testimonials', 'contact'] as const;
type SectionId = (typeof sections)[number];

const HeroInteractiveField = dynamic(
  () => import('@/components/hero-interactive-field').then((mod) => mod.HeroInteractiveField),
  { ssr: false },
);

const SplineWorkScene = dynamic(
  () => import('@/components/spline-work-scene').then((mod) => mod.SplineWorkScene),
  { ssr: false },
);

// Decorative below-the-fold canvas — load its JS (canvas + noise lib) on demand
// rather than bundling it into the initial payload.
const FluidParticlesBackground = dynamic(
  () => import('@/components/fluid-particles-background').then((mod) => mod.FluidParticlesBackground),
  { ssr: false },
);

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};

/* ─── spring config for mouse tracking ─── */
const MOUSE_SPRING = { stiffness: 80, damping: 22 };

export function PortfolioExperience({ content }: { content: PortfolioContent }) {
  const [active, setActive] = useState<SectionId>('hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderValue, setLoaderValue] = useState(0);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const duration = 900;
    const startedAt = performance.now();
    let frame = 0;
    let timeout = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setLoaderValue(Math.round(eased * 100));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setIntroComplete(true);
        timeout = window.setTimeout(() => setLoaderVisible(false), 80);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    let frame = 0;

    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewportAnchor = root.scrollTop + root.clientHeight * 0.46;
        let current: SectionId = sections[0];

        for (const id of sections) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (viewportAnchor >= el.offsetTop - 24) current = id;
        }

        setActive(current);
      });
    };

    updateActiveSection();
    root.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const scrollTo = (id: SectionId) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06080d] text-[#f5f5f5]">
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-black focus:outline-none"
      >
        Skip to content
      </a>
      <div className="noise" />
      <IntroLoader value={loaderValue} visible={loaderVisible} />
      <CustomCursor />
      <FloatingNav active={active} onNavigate={scrollTo} menuOpen={menuOpen} setMenuOpen={setMenuOpen} hiddenSections={content.siteSettings.hiddenSections} />
      <div
        ref={containerRef}
        className="h-screen overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth"
        style={{ scrollbarGutter: 'stable' }}
      >
        <HeroSection onNavigate={scrollTo} containerRef={containerRef} introComplete={introComplete} />
        <MarqueeStrip marquee={content.marquee} />
        {!content.siteSettings.hiddenSections.includes('about') && (
          <AboutSection skills={content.skills} timeline={content.timeline} containerRef={containerRef} />
        )}
        {!content.siteSettings.hiddenSections.includes('work') && (
          <ProjectsSection projects={content.projects.filter(p => !content.siteSettings.hiddenProjects.includes(p.id))} />
        )}
        <CreativeProjectsSection
          projects={content.projects.filter(p => !content.siteSettings.hiddenProjects.includes(p.id))}
          galleryImages={content.galleryImages}
          containerRef={containerRef}
        />
        {!content.siteSettings.hiddenSections.includes('plugins') && (
          <PluginBuildsSection plugins={content.plugins} />
        )}
        {!content.siteSettings.hiddenSections.includes('testimonials') && (
          <StickyTestimonialsSection testimonials={content.testimonials} containerRef={containerRef} />
        )}
        {!content.siteSettings.hiddenSections.includes('contact') && <ContactSection />}
        <Footer />
      </div>
    </main>
  );
}

function IntroLoader({
  value,
  visible,
}: {
  value: number;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100%', transition: { duration: 0.56, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[120] flex items-end justify-start bg-[#06080d] px-6 py-7 text-[#f5f5f5] sm:px-10 sm:py-9"
        >
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="mb-5 flex items-end justify-between gap-6">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                  Loading portfolio
                </div>
                <div className="mt-3 text-6xl font-light leading-none tracking-[-0.06em] text-white sm:text-8xl">
                  {String(value).padStart(3, '0')}
                </div>
              </div>
              <div className="pb-2 font-mono text-xs text-white/34">100</div>
            </div>
            <div className="h-px overflow-hidden bg-white/10">
              <motion.div
                className="h-full origin-left bg-[var(--accent)]"
                animate={{ scaleX: value / 100 }}
                transition={{ duration: 0.18, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   FLOATING NAV
───────────────────────────────────────────────────────── */
function FloatingNav({
  active,
  onNavigate,
  menuOpen,
  setMenuOpen,
  hiddenSections,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  hiddenSections: string[];
}) {
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-5 pt-4 sm:px-8 lg:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <button
          className="group inline-flex size-11 items-center justify-center rounded-full text-lg font-black tracking-[-0.08em] text-white transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          onClick={() => onNavigate('hero')}
          aria-label="Go to hero"
        >
          SQ
        </button>
        <div className="glass hidden items-center rounded-full p-1 md:flex">
          {sections.slice(1).filter((id) => !hiddenSections.includes(id)).map((id) => (
            <button
              key={id}
              className={cn(
                'relative rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                active === id ? 'text-black' : 'text-white/48 hover:text-white',
              )}
              onClick={() => onNavigate(id)}
            >
              {active === id && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-full bg-[var(--accent)]"
                  transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                />
              )}
              <span className="relative z-10">{id}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="glass hidden cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65 transition hover:text-white md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Let&apos;s connect
          <ArrowUpRight className="size-3.5" />
        </button>
        <button
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass mx-4 mt-3 grid rounded-3xl p-2 md:hidden"
          >
            {sections.filter((id) => !hiddenSections.includes(id)).map((id) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex items-center justify-between rounded-2xl px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30"
              >
                {id}
                <ChevronRight className="size-4 text-[var(--accent)]" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO — heading + cards that rise sequentially from below
───────────────────────────────────────────────────────── */
function HeroSection({
  onNavigate,
  containerRef,
  introComplete,
}: {
  onNavigate: (id: SectionId) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  introComplete: boolean;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const subcopyRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const availabilityCardRef = useRef<HTMLDivElement | null>(null);
  const meshLayerRef = useRef<HTMLDivElement | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, MOUSE_SPRING);
  const springY = useSpring(mouseY, MOUSE_SPRING);
  const textX = useTransform(springX, [-0.5, 0.5], [24, -24]);
  const textY = useTransform(springY, [-0.5, 0.5], [14, -14]);
  const spotX = useTransform(springX, [-0.5, 0.5], [15, 85]);
  const spotY = useTransform(springY, [-0.5, 0.5], [15, 85]);
  const spotlight = useMotionTemplate`radial-gradient(circle 700px at ${spotX}% ${spotY}%, rgba(var(--accent-rgb),0.07), transparent 65%)`;

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((event.clientY - rect.top - rect.height / 2) / rect.height);
  };
  const onPointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  /* GSAP timeline — autoplays once the hero enters the viewport */
  useEffect(() => {
    if (!introComplete) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scroller = containerRef.current ?? undefined;

    const ctx = gsap.context(() => {
      /* set initial states */
      gsap.set([line1Ref.current, line2Ref.current], {
        yPercent: 100,
        opacity: 0,
        clipPath: 'inset(0 0 100% 0)',
      });
      gsap.set([subcopyRef.current, ctaRef.current, badgeRef.current], { opacity: 0, y: 28 });
      gsap.set(availabilityCardRef.current, { opacity: 0, y: 28 });
      if (!prefersReduced) gsap.set(meshLayerRef.current, { scale: 0.92, opacity: 0.6 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onUpdate: () => {
          window.dispatchEvent(
            new CustomEvent('hero-bubble-scroll', {
              detail: { progress: prefersReduced ? 0 : tl.progress() * 0.35 },
            }),
          );
        },
      });

      /* Stage 1 — heading + supporting copy reveal */
      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0)
        .to(line1Ref.current, { yPercent: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.out' }, 0.1)
        .to(line2Ref.current, { yPercent: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.out' }, 0.22)
        .to(subcopyRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0.85);

      /* Stage 2 — mesh blooms into place */
      if (!prefersReduced) {
        tl.to(meshLayerRef.current, { scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.15);
      } else {
        tl.set(meshLayerRef.current, { scale: 1, opacity: 1 }, 0);
      }

      /* Stage 3 — floating cards arrive */
      tl.to(availabilityCardRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.05);

      /* Trigger when the hero enters the viewport (autoplay once) */
      ScrollTrigger.create({
        trigger: section,
        scroller,
        start: 'top 85%',
        once: true,
        onEnter: () => tl.play(),
      });
    }, section);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 60);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [introComplete, containerRef]);

  useEffect(() => {
    if (!introComplete) return;
    const scroller = containerRef.current;
    const section = sectionRef.current;
    if (!scroller || !section) return;

    let frame = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    const updateHeroScroll = () => {
      const travel = Math.max(1, section.offsetHeight * 0.72);
      targetProgress = Math.min(1, Math.max(0, (scroller.scrollTop - section.offsetTop) / travel)) ** 0.72;
    };

    const tickHeroScroll = () => {
      currentProgress += (targetProgress - currentProgress) * 0.12;
      window.dispatchEvent(new CustomEvent('hero-bubble-scroll', { detail: { progress: currentProgress } }));
      frame = requestAnimationFrame(tickHeroScroll);
    };

    updateHeroScroll();
    tickHeroScroll();
    scroller.addEventListener('scroll', updateHeroScroll, { passive: true });
    window.addEventListener('resize', updateHeroScroll);

    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', updateHeroScroll);
      window.removeEventListener('resize', updateHeroScroll);
    };
  }, [introComplete, containerRef]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative h-[100svh] overflow-visible bg-[#06080d]"
    >
      <div ref={meshLayerRef} className="pointer-events-none fixed inset-0 z-[1] will-change-transform">
        <motion.div
          className="pointer-events-none absolute -inset-x-[22vw] -inset-y-[10vh] translate-x-[9vw] translate-y-[7vh] blur-[1.2px] md:inset-0 md:translate-x-0 md:translate-y-0 md:blur-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: introComplete ? 1 : 0.42 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroInteractiveField />
        </motion.div>
      </div>

      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]" style={{ background: spotlight }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_62%_54%_at_62%_43%,rgba(var(--accent-rgb),0.035)_0%,transparent_68%),radial-gradient(ellipse_72%_62%_at_50%_45%,transparent_42%,rgba(6,8,13,0.78)_90%),linear-gradient(to_bottom,#06080d_0%,transparent_16%,transparent_62%,#06080d_100%)]" />

      {/* Floating cards */}
      <div
        ref={availabilityCardRef}
        className="pointer-events-none absolute bottom-24 right-5 z-[5] hidden w-[210px] sm:right-8 md:block lg:right-12 lg:bottom-28 lg:w-[230px]"
      >
        <AvailabilityHeroCard />
      </div>

      {/* Heading */}
      <div
        ref={contentRef}
        className="absolute inset-x-0 top-0 z-[4] mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-20"
      >
        <motion.div style={{ x: textX, y: textY }} className="max-w-5xl">
          <div ref={badgeRef} className="mb-6 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/44">
            <span className="rounded-full border border-[rgba(var(--accent-rgb),0.38)] px-3 py-1.5 text-[var(--accent)]">Available for select builds</span>
            <span>Bengaluru, India</span>
          </div>
          <h1 className="text-balance text-[clamp(4.2rem,15vw,12rem)] font-light leading-[0.92] tracking-[-0.075em] text-white md:leading-[0.88]">
            <span ref={line1Ref} className="inline-block overflow-visible pb-[0.04em] pt-[0.08em] align-bottom will-change-transform md:pt-0">Shoaib</span>
            <br />
            <span ref={line2Ref} className="inline-block overflow-visible pb-[0.04em] pt-[0.08em] align-bottom will-change-transform md:pt-0">
              Qureshi<span className="text-[var(--accent)]">.</span>
            </span>
          </h1>
          <div className="mt-7 grid max-w-3xl gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <p ref={subcopyRef} className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              Senior frontend developer crafting cinematic interfaces, React and Laravel applications, and AI-powered tools across Next.js, WordPress, and WooCommerce.
            </p>
            <div ref={ctaRef}>
              <Button onClick={() => onNavigate('work')} className="w-max">
                View work <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function HeroFloatingCard({
  introComplete,
  delay,
  restRotate,
  className,
  children,
}: {
  introComplete: boolean;
  delay: number;
  restRotate: number;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ y: 460, opacity: 0, scale: 0.9, rotate: restRotate * 2 }}
      animate={introComplete ? { y: 0, opacity: 1, scale: 1, rotate: restRotate } : undefined}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn('pointer-events-auto', className)}
    >
      {children}
    </motion.div>
  );
}

/* Shared glass shell for all hero cards */
function GlassCard({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl backdrop-blur-2xl',
        'shadow-[0_16px_56px_rgba(0,0,0,0.80),inset_0_0_0_0.5px_rgba(255,255,255,0.07)]',
        'bg-[#0d0f14]/93',
        accent ? 'border border-[rgba(var(--accent-rgb),0.26)]' : 'border border-white/[0.09]',
      )}
    >
      {/* top-edge shimmer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      {/* inner glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: accent
            ? 'radial-gradient(ellipse 90% 55% at 50% -8%, rgba(var(--accent-rgb),0.12), transparent 70%)'
            : 'radial-gradient(ellipse 80% 45% at 20% 0%, rgba(255,255,255,0.055), transparent 65%)',
        }}
      />
      <div className="relative p-4">{children}</div>
    </div>
  );
}

function MetricHeroCard() {
  const bars = [32, 48, 38, 66, 54, 82, 75];
  return (
    <GlassCard>
      <div className="mb-1 flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_5px_var(--accent)]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/36">Experience</span>
      </div>
      <div className="mt-3 text-[2.6rem] font-light leading-none tracking-[-0.07em] text-white">4<span className="text-[var(--accent)]">+</span></div>
      <div className="mt-1 text-[10px] text-white/36">yrs building products</div>
      {/* mini bar chart */}
      <div className="mt-4 flex h-6 items-end gap-[3px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{
              height: `${h}%`,
              background: i === bars.length - 1
                ? 'var(--accent)'
                : `rgba(var(--accent-rgb),${0.10 + i * 0.02})`,
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}

function TechStackHeroCard() {
  const tags = ['React', 'Next.js', 'TypeScript', 'Laravel', 'WordPress', 'WooCommerce'];
  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/36">Core Stack</span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          <span className="text-[8px] text-[var(--accent)]">active</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/[0.09] bg-white/[0.04] px-2.5 py-[5px] text-[8px] font-medium tracking-wide text-white/52"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3.5 border-t border-white/[0.06] pt-3 text-[9px] text-white/28">
        Frontend · 4 yrs · 25+ projects
      </div>
    </GlassCard>
  );
}

function ProjectsHeroCard() {
  return (
    <GlassCard>
      <div className="mb-1 flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_5px_var(--accent)]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/36">Shipped</span>
      </div>
      <div className="mt-3 text-[2.6rem] font-light leading-none tracking-[-0.07em] text-white">
        25<span className="text-[var(--accent)]">+</span>
      </div>
      <div className="mt-1 text-[10px] text-white/36">projects delivered</div>
      {/* sparkline */}
      <svg className="mt-4 w-full" viewBox="0 0 96 22" fill="none">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(var(--accent-rgb),0.2)" />
            <stop offset="100%" stopColor="rgba(var(--accent-rgb),0)" />
          </linearGradient>
        </defs>
        <polyline
          points="0,19 14,14 28,16 42,8 56,11 70,4 84,6 96,1"
          stroke="rgba(var(--accent-rgb),0.58)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="96" cy="1" r="2.5" fill="var(--accent)" />
      </svg>
    </GlassCard>
  );
}

function AvailabilityHeroCard() {
  return (
    <GlassCard accent>
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-50" />
          <span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" />
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Available now</span>
      </div>
      <div className="text-[13px] font-light leading-[1.6] text-white/85">
        Open to remote &amp;<br />hybrid projects
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <svg viewBox="0 0 8 8" className="size-2 text-white/30" fill="currentColor">
          <circle cx="4" cy="4" r="3" />
        </svg>
        <span className="text-[9px] text-white/32">Bengaluru, India</span>
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────────────────── */
function MarqueeStrip({ marquee }: { marquee: PortfolioContent['marquee'] }) {
  const controls = useAnimationControls();
  const items = [...marquee, ...marquee, ...marquee];

  useEffect(() => {
    controls.start({ x: ['0%', '-33.333%'], transition: { duration: 28, ease: 'linear', repeat: Infinity } });
  }, [controls]);

  const pause = () => controls.stop();
  const resume = () =>
    controls.start({ x: ['0%', '-33.333%'], transition: { duration: 28, ease: 'linear', repeat: Infinity } });

  return (
    <div
      className="relative z-20 overflow-hidden border-y border-white/10 bg-[#06080d]/95 py-4"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      aria-label="Technology stack, pauses on hover"
    >
      <motion.div
        data-visual-ignore="true"
        className="flex w-max gap-12 whitespace-nowrap"
        animate={controls}
        initial={{ x: '0%' }}
      >
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.22em]',
              index % 4 === 0 ? 'text-[var(--accent)]' : 'text-white/36',
            )}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ABOUT
───────────────────────────────────────────────────────── */
function AboutSection({
  skills,
  timeline,
  containerRef,
}: {
  skills: PortfolioContent['skills'];
  timeline: PortfolioContent['timeline'];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [textProgress, setTextProgress] = useState(0);

  useEffect(() => {
    const scroller = containerRef.current;
    const section = sectionRef.current;
    if (!scroller || !section) return;

    let raf = 0;
    let settling = false;
    let targetProgress = 0;
    let currentProgress = 0;
    let lastCommitted = -1;

    const commitProgress = (value: number) => {
      if (Math.abs(value - lastCommitted) < 0.003) return;
      lastCommitted = value;
      setTextProgress(value);
    };

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.16;
      commitProgress(currentProgress);

      if (Math.abs(targetProgress - currentProgress) < 0.002) {
        currentProgress = targetProgress;
        commitProgress(currentProgress);
        settling = false;
        raf = 0;
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    const startSettling = () => {
      if (settling) return;
      settling = true;
      raf = requestAnimationFrame(tick);
    };

    const updateProgress = () => {
      const start = section.offsetTop;
      const travel = Math.max(1, section.offsetHeight - scroller.clientHeight);
      const raw = (scroller.scrollTop - start) / travel;
      targetProgress = Math.min(1, Math.max(0, raw));
      startSettling();
    };

    updateProgress();
    scroller.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [containerRef]);

  const firstText =
    'I design and build React and Laravel applications, AI-powered tools, WordPress systems, and WooCommerce stores. Products that feel considered without becoming ornamental.';
  const secondText =
    'My work spans frontend engineering, CMS architecture, and AI workflows, from automated markdown and documentation pipelines to editorial tooling, always with an eye for performance, structure, and usability.';

  return (
    <section ref={sectionRef} id="about" className="relative scroll-mt-20 bg-[#06080d]">
      <div className="relative h-[330svh] md:h-[190svh]">
        <div className="sticky top-0 flex h-[100svh] items-start overflow-hidden pt-28 md:items-center md:pt-0">
          <div aria-hidden="true" className="absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_38%_at_52%_42%,rgba(255,255,255,0.055),transparent_72%),linear-gradient(to_bottom,#06080d_0%,rgba(6,8,13,0.76)_18%,rgba(6,8,13,0.45)_52%,#06080d_100%)]" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_2px,transparent_20px)] opacity-[0.055] blur-[0.3px]" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:items-center">
              <div>
                <div className="mb-5 md:mb-8">
                  <SectionLabel>About</SectionLabel>
                </div>
                <h2 className="text-balance text-[2.25rem] font-light leading-[0.96] tracking-[-0.055em] sm:text-6xl">
                  Where interface craft meets engineering depth.
                </h2>
                <div className="mt-5 grid max-w-md grid-cols-2 gap-3 md:mt-10 md:gap-4">
                  {[
                    ['4+', 'Years experience'],
                    ['25+', 'Projects shipped'],
                  ].map(([value, label]) => (
                    <div key={label} className="glass rounded-3xl p-3.5 md:p-5 [isolation:isolate] [will-change:transform]" style={{ transform: 'translateZ(0)' }}>
                      <div className="text-3xl font-light tracking-[-0.06em] text-white md:text-4xl">{value}</div>
                      <div className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-white/42 md:mt-2 md:text-[10px]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative max-w-xl lg:ml-auto">
                <div className="relative min-h-[8.4rem] md:min-h-[13rem]">
                <ScrollRevealText
                  text={firstText}
                  progress={textProgress}
                  revealStart={0.03}
                  revealEnd={0.2}
                  exitStart={0.34}
                  exitEnd={0.44}
                  initialWords={4}
                />
                <LineRevealText
                  text={secondText}
                  progress={textProgress}
                  revealStart={0.44}
                  revealEnd={0.68}
                  exitStart={1.2}
                  exitEnd={1.3}
                  className="absolute inset-x-0 top-0"
                />
                </div>
                <motion.div
                  className="mt-2 flex max-h-[7.4rem] flex-wrap gap-2 overflow-hidden md:mt-8 md:max-h-none"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } } }}
                >
                  {skills.map((skill) => (
                    <motion.span
                      key={skill}
                      variants={{
                        hidden: { opacity: 0, scale: 0.82, y: 10 },
                        show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/46"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pb-20 md:pt-0 lg:px-10 lg:pb-32 overflow-hidden lg:overflow-visible">
      <div className="flex snap-x snap-mandatory touch-auto gap-4 overflow-x-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mt-20 lg:-mt-28 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {timeline.map((item, index) => {
          const Icon = getIcon(item.iconKey);
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
              className="group relative w-[80%] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:w-[56%] lg:w-auto"
            >
              <AnimatedShine />
              <Icon className="mb-8 size-5 text-[var(--accent)]" />
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/36">{item.period}</div>
              <h3 className="mt-3 text-xl font-light tracking-[-0.03em] text-white">{item.title}</h3>
              <div className="mt-1 text-sm text-[var(--accent)]">{item.place}</div>
              <p className="mt-5 text-sm leading-7 text-white/48">{item.detail}</p>
            </motion.div>
          );
        })}
        {/* Trailing spacer — WebKit clips right padding inside overflow scroll; a flex child is not */}
        <span className="w-1 shrink-0 lg:hidden" aria-hidden="true" />
      </div>
      </div>
    </section>
  );
}

function ScrollRevealText({
  text,
  progress,
  revealStart,
  revealEnd,
  exitStart,
  exitEnd,
  initialWords = 0,
  className,
}: {
  text: string;
  progress: number;
  revealStart: number;
  revealEnd: number;
  exitStart: number;
  exitEnd: number;
  initialWords?: number;
  className?: string;
}) {
  const words = text.split(' ');
  const revealRange = Math.max(0.001, revealEnd - revealStart);
  const exitRange = Math.max(0.001, exitEnd - exitStart);
  const enterRaw = Math.min(1, Math.max(0, (progress - revealStart) / Math.min(0.08, revealRange)));
  const enter = enterRaw * enterRaw * (3 - 2 * enterRaw);
  const exitRaw = Math.min(1, Math.max(0, (progress - exitStart) / exitRange));
  const exit = exitRaw * exitRaw * (3 - 2 * exitRaw);
  const hasInitialWords = initialWords > 0;

  return (
    <p
      className={cn(
        'max-w-xl text-balance text-[clamp(1.05rem,1.58vw,1.93rem)] font-light leading-[1.25] tracking-[-0.035em]',
        className,
      )}
      style={{
        opacity: (hasInitialWords ? 1 : enter) * (1 - exit),
        transform: `translate3d(0, ${((1 - enter) * 14 - 24 * exit).toFixed(2)}px, 0)`,
      }}
    >
      {words.map((word, index) => {
        const wordStart =
          index < initialWords
            ? 0
            : revealStart + ((index - initialWords) / Math.max(1, words.length - initialWords)) * revealRange * 0.78;
        const wordEnd = wordStart + revealRange * 0.18;
        const wordReveal =
          index < initialWords ? 1 : Math.min(1, Math.max(0, (progress - wordStart) / Math.max(0.001, wordEnd - wordStart)));
        const eased = wordReveal * wordReveal * (3 - 2 * wordReveal);
        return (
          <span
            key={`${word}-${index}`}
            className="inline-block pr-[0.22em] will-change-[opacity]"
            style={{ opacity: index < initialWords ? 1 : 0.1 + eased * 0.9 }}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}

function LineRevealText({
  text,
  progress,
  revealStart,
  revealEnd,
  exitStart,
  exitEnd,
  className,
}: {
  text: string;
  progress: number;
  revealStart: number;
  revealEnd: number;
  exitStart: number;
  exitEnd: number;
  className?: string;
}) {
  // Break text into ~38-char lines at word boundaries for the per-line reveal animation.
  // Kept short so each chunk fits the column at the large heading size without re-wrapping.
  const lines = (() => {
    const words = text.split(' ');
    const result: string[] = [];
    let line = '';
    for (const word of words) {
      if (line.length + word.length + 1 > 38 && line) {
        result.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) result.push(line);
    return result;
  })();
  const revealRange = Math.max(0.001, revealEnd - revealStart);
  const exitRange = Math.max(0.001, exitEnd - exitStart);
  const enterRaw = Math.min(1, Math.max(0, (progress - revealStart) / Math.min(0.08, revealRange)));
  const enter = enterRaw * enterRaw * (3 - 2 * enterRaw);
  const exitRaw = Math.min(1, Math.max(0, (progress - exitStart) / exitRange));
  const exit = exitRaw * exitRaw * (3 - 2 * exitRaw);

  return (
    <p
      aria-label={text}
      className={cn(
        'max-w-xl text-balance text-[clamp(1.05rem,1.58vw,1.93rem)] font-light leading-[1.25] tracking-[-0.035em]',
        className,
      )}
      style={{
        opacity: enter * (1 - exit),
        transform: `translate3d(0, ${((1 - enter) * 18 - 22 * exit).toFixed(2)}px, 0)`,
      }}
    >
      {lines.map((line, index) => {
        const lineStart = revealStart + (index / Math.max(1, lines.length)) * revealRange * 0.64;
        const lineEnd = lineStart + revealRange * 0.28;
        const lineReveal = Math.min(1, Math.max(0, (progress - lineStart) / Math.max(0.001, lineEnd - lineStart)));
        const eased = lineReveal * lineReveal * (3 - 2 * lineReveal);
        return (
          <span key={line} className="block overflow-hidden">
            <span
              className="block will-change-transform"
              style={{
                opacity: eased,
                transform: `translate3d(0, ${(18 - eased * 18).toFixed(2)}px, 0)`,
                clipPath: `inset(0 ${((1 - eased) * 100).toFixed(2)}% 0 0)`,
              }}
            >
              {line}
            </span>
          </span>
        );
      })}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────
   PROJECTS — scroll-triggered reveals + case study links
───────────────────────────────────────────────────────── */
function ProjectsSection({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.category)))], []);
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  const [showSpline, setShowSpline] = useState(false);
  useEffect(() => {
    // Only load the heavy Spline 3D runtime on capable desktops. Mobile/touch
    // devices and reduced-motion users get the gradient fallback instead, saving
    // a large WebGL context + scene download.
    const capable = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (capable && !reduce) setShowSpline(true);
  }, []);

  return (
    <section id="work" className="relative mx-auto max-w-7xl scroll-mt-20 overflow-hidden px-5 pb-4 pt-4 sm:px-8 sm:pt-24 lg:px-10 lg:py-32">
      <div className="pointer-events-none absolute inset-x-[-46%] top-[-2rem] z-0 h-[38rem] opacity-[0.62] sm:inset-x-[-22%] sm:top-[-16rem] sm:h-[68rem] lg:inset-x-[-16%] lg:h-[72rem]">
        <div className="absolute inset-0 origin-[52%_38%] scale-[1.1] sm:origin-[58%_38%] sm:scale-[1.16] lg:scale-[1.08]">
          {showSpline && <SplineWorkScene />}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-16%] top-[-4rem] z-[1] h-[54rem] bg-[radial-gradient(ellipse_32%_28%_at_34%_38%,rgba(var(--accent-rgb),0.04),transparent_74%),radial-gradient(ellipse_24%_22%_at_32%_44%,rgba(255,122,47,0.036),transparent_78%),linear-gradient(to_right,#06080d_0%,rgba(6,8,13,0.18)_20%,rgba(6,8,13,0)_38%,rgba(6,8,13,0)_54%,#06080d_78%,#06080d_100%),linear-gradient(to_bottom,#06080d_0%,rgba(6,8,13,0)_24%,rgba(6,8,13,0)_42%,#06080d_76%)]"
      />
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"
      >
        <div className="max-w-4xl">
          <SectionLabel>Selected Work</SectionLabel>
          <h2 className="text-balance text-5xl font-light leading-none tracking-[-0.055em] sm:text-7xl">
            Built to ship.
            <br />
            Engineered to last.
          </h2>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex max-w-full flex-nowrap gap-2 overflow-hidden pb-1 lg:justify-end"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={cn(
                'inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition duration-300',
                filter === category
                  ? 'border-white/80 bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.10)]'
                  : 'border-white/10 bg-white/[0.035] text-white/48 hover:border-white/20 hover:bg-white/[0.07] hover:text-white',
              )}
            >
              {category === 'All' && <Filter className="size-3" />}
              {category}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* Mobile: snap-scroll carousel / Desktop: auto-reflow grid */}
      {/* Full-bleed breakout so the carousel spans edge-to-edge; vignette lives in the same
          breakout box so it aligns to the true right edge (no white strip). */}
      <div className="relative z-10 -mx-5 sm:-mx-8 lg:mx-0">
        {/* Right vignette — hints at more cards on mobile */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-[var(--background)] to-transparent lg:hidden" />
        <div
          className="flex snap-x snap-mandatory touch-auto gap-4 overflow-x-auto overflow-y-hidden scroll-pl-5 px-5 sm:scroll-pl-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </AnimatePresence>
          {/* Trailing spacer — right padding inside overflow scroll is clipped in WebKit; a flex child is not */}
          <span className="w-1 shrink-0 lg:hidden" aria-hidden="true" />
        </div>
      </div>

    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const Icon = getIcon(project.iconKey);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 56, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.09 }}
      viewport={{ once: true, margin: '-80px' }}
      data-cursor="interactive"
      className="group relative w-[70vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0d0f14] transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-[#11141b] hover:shadow-[0_30px_110px_rgba(0,0,0,0.48),0_0_44px_rgba(var(--accent-rgb),0.055)] sm:max-w-[360px] lg:w-auto lg:max-w-none lg:shrink"
    >
      <Link
        href={`/work/${project.id}`}
        className="flex h-full flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] sm:p-6"
        aria-label={`Read case study for ${project.title}`}
      >
        <AnimatedShine />

        {/* Color glow */}
        <div
          className="absolute inset-0 opacity-45 transition duration-700 group-hover:opacity-78"
          style={{
            background: 'radial-gradient(circle at 72% 18%, rgba(var(--accent-rgb),0.08), transparent 34rem)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-end">
            {project.showYear !== false && project.year && (
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/48">
                {project.year}
              </span>
            )}
          </div>

          <div className="mt-3 sm:mt-6">
            <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/72 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-white/18 group-hover:bg-white/[0.055] group-hover:text-white sm:mb-5 sm:size-11">
              {project.customIcon ? (
                <span
                  className="flex size-5 items-center justify-center sm:size-6 [&_svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: project.customIcon }}
                />
              ) : (
                <Icon className="size-5 sm:size-6" />
              )}
            </div>
            <h3 className="text-2xl font-light tracking-[-0.055em] text-white sm:text-4xl">{project.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/52 sm:mt-4 sm:line-clamp-none">{project.desc}</p>
          </div>

          <div className="mt-auto pt-4 sm:pt-8">
            <div className="mb-4 flex flex-wrap gap-1.5 sm:mb-6 sm:gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-white/44 sm:px-3 sm:py-1.5"
                >
                  {tag}
                </span>
              ))}
            </div>

            <span
              aria-hidden="true"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/60 transition duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_34px_rgba(255,255,255,0.16)] sm:size-12"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}


/* ─────────────────────────────────────────────────────────
   CINEMATIC MORE PROJECTS
───────────────────────────────────────────────────────── */
function CinematicProjectsSection({
  projects,
  containerRef,
}: {
  projects: Project[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);
  const centerTextRef = useRef<HTMLDivElement | null>(null);
  const cardsWrapRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const topTileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bottomTileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStack, setActiveStack] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Build film strip arrays — interleave image + processImage for variety, tile to 9 each
  const { topStrip, bottomStrip } = useMemo(() => {
    const pool = projects.flatMap((p) => [
      { src: p.image.src, alt: p.image.alt, title: p.title, sub: p.category },
      { src: p.processImage.src, alt: p.processImage.alt, title: p.category, sub: p.tags[0] ?? '' },
    ]);
    const tile = (arr: typeof pool, count: number) =>
      Array.from({ length: count }, (_, i) => arr[i % arr.length]);
    return { topStrip: tile(pool, 9), bottomStrip: tile([...pool].reverse(), 9) };
  }, [projects]);

  const tileRotations = [-2, 1.5, -1, 2.5, 0, -1.5, 2, -2.5, 1];

  useEffect(() => {
    if (prefersReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    const scroller = containerRef.current;
    if (!scroller || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          pin: '.cinematic-sticky',
        },
      });

      // Scene 1 — Entry: bars sweep in from top/bottom
      tl.from(topBarRef.current, { y: '-100vh', duration: 0.25 }, 0)
        .from(bottomBarRef.current, { y: '100vh', duration: 0.25 }, 0);

      // Image tiles stagger in as bars arrive — top slides from left, bottom from right
      tl.from(topTileRefs.current.filter(Boolean), {
        x: -90, opacity: 0, scale: 0.85,
        stagger: 0.015, duration: 0.20,
      }, 0.06);
      tl.from(bottomTileRefs.current.filter(Boolean), {
        x: 90, opacity: 0, scale: 0.85,
        stagger: { amount: 0.18, from: 'end' }, duration: 0.20,
      }, 0.06);

      // Center text fades in after bars settle
      tl.from(centerTextRef.current, { opacity: 0, y: 30, duration: 0.12 }, 0.22);

      // Scene 2 — Reveal: bars retreat, project cards expand
      tl.to(centerTextRef.current, { opacity: 0, y: -30, duration: 0.08 }, 0.25)
        .to(topBarRef.current, { y: '-100vh', duration: 0.12 }, 0.25)
        .to(bottomBarRef.current, { y: '100vh', duration: 0.12 }, 0.25)
        .from(cardsWrapRef.current, { opacity: 0, duration: 0.04 }, 0.30);

      cardRefs.current.forEach((card, i) => {
        tl.from(card, { scale: 0.6, opacity: 0, y: 60, duration: 0.12 }, 0.30 + i * 0.04);
      });

      // Scene 3 — Cinematic scroll: cards peel off one by one
      cardRefs.current.forEach((card, i) => {
        tl.to(card, { y: '-110vh', scale: 0.88, opacity: 0, duration: 0.14 }, 0.45 + i * 0.11);
      });

      // Scene 4 — Stack collapse
      tl.to(cardsWrapRef.current, { opacity: 0, duration: 0.04 }, 0.78)
        .from(stackRef.current, { opacity: 0, scale: 0.92, duration: 0.18 }, 0.80);
    }, sectionRef);

    return () => ctx.revert();
  }, [containerRef, prefersReducedMotion]);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStack((prev) => (prev + 1) % projects.length);
    }, 2200);
    return () => clearInterval(id);
  }, [projects.length]);

  if (prefersReducedMotion) {
    return (
      <section id="more-work" className="bg-[#06080d] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionLabel>Creative Work</SectionLabel>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">More Creative Projects</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="relative h-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117]">
                {project.image.src && (
                  <Image src={project.image.src} alt={project.image.alt} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover opacity-40" />
                )}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <p className="mt-1 text-sm text-white/55 line-clamp-2">{project.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="more-work" style={{ height: '500vh' }}>
      <div className="cinematic-sticky sticky top-0 h-screen w-full overflow-hidden bg-[#06080d] flex items-center justify-center">

        {/* Scene 1: TOP image film strip bar */}
        <div
          ref={topBarRef}
          className="absolute inset-x-0 top-0 h-[42%] overflow-hidden z-20"
          style={{ background: 'linear-gradient(to bottom, #06080d 0%, #0c0f18 100%)' }}
        >
          <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
          <div className="absolute inset-0 flex items-center gap-3 px-4">
            {topStrip.map((img, i) => (
              <div
                key={i}
                ref={(el) => { topTileRefs.current[i] = el; }}
                className="shrink-0 relative rounded-xl overflow-hidden border border-white/10 bg-[#0f1117]"
                style={{
                  width: 'clamp(130px, 13vw, 188px)',
                  height: '80%',
                  transform: `rotate(${tileRotations[i % tileRotations.length]}deg)`,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 45vw, 240px"
                  className="object-cover"
                  style={{ opacity: 0.75 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
                <div className="absolute bottom-0 inset-x-0 p-2.5">
                  <p className="text-[11px] font-medium text-white/85 leading-tight line-clamp-1">{img.title}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">{img.sub}</p>
                </div>
              </div>
            ))}
          </div>
          {/* edge vignettes to fade off-screen tiles */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#06080d] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#06080d] to-transparent z-10" />
        </div>

        {/* Scene 1: BOTTOM image film strip bar */}
        <div
          ref={bottomBarRef}
          className="absolute inset-x-0 bottom-0 h-[42%] overflow-hidden z-20"
          style={{ background: 'linear-gradient(to top, #06080d 0%, #0c0f18 100%)' }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/10" />
          <div className="absolute inset-0 flex items-center gap-3 px-4">
            {bottomStrip.map((img, i) => (
              <div
                key={i}
                ref={(el) => { bottomTileRefs.current[i] = el; }}
                className="shrink-0 relative rounded-xl overflow-hidden border border-white/10 bg-[#0f1117]"
                style={{
                  width: 'clamp(130px, 13vw, 188px)',
                  height: '80%',
                  transform: `rotate(${-tileRotations[i % tileRotations.length]}deg)`,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 45vw, 240px"
                  className="object-cover"
                  style={{ opacity: 0.75 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
                <div className="absolute bottom-0 inset-x-0 p-2.5">
                  <p className="text-[11px] font-medium text-white/85 leading-tight line-clamp-1">{img.title}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">{img.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#06080d] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#06080d] to-transparent z-10" />
        </div>

        {/* Scene 1: center text */}
        <div ref={centerTextRef} className="absolute z-30 text-center pointer-events-none select-none">
          <SectionLabel>Creative Work</SectionLabel>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            More Creative Projects
          </h2>
        </div>

        {/* Scenes 2–3: expanding project cards */}
        <div ref={cardsWrapRef} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute w-[85vw] max-w-[680px] rounded-2xl overflow-hidden border border-white/10 bg-[#0f1117]"
              style={{ height: 'clamp(320px, 72vh, 600px)', zIndex: projects.length - i }}
            >
              {project.image.src && (
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  sizes="(max-width: 1024px) 90vw, 33vw"
                  className="object-cover opacity-40"
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <span className="text-xs text-white/40 mb-2 tracking-widest uppercase">{project.category}</span>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed max-w-md line-clamp-2">{project.desc}</p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[11px] border border-white/15 text-white/55 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scene 4: stacked deck with auto-cycle */}
        <div ref={stackRef} className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="relative w-[85vw] max-w-[680px]" style={{ height: 'clamp(320px, 72vh, 600px)' }}>
            {projects.map((project, i) => {
              const offset = i - activeStack;
              const isActive = i === activeStack;
              return (
                <motion.div
                  key={project.id}
                  animate={{
                    y: isActive ? 0 : offset * 10 + 12,
                    scale: isActive ? 1 : 1 - Math.abs(offset) * 0.04,
                    opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.55,
                    zIndex: projects.length - Math.abs(offset),
                  }}
                  transition={{ type: 'spring', stiffness: 160, damping: 28 }}
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0f1117]"
                >
                  {project.image.src && (
                    <Image
                      src={project.image.src}
                      alt={project.image.alt}
                      fill
                      sizes="(max-width: 1024px) 90vw, 33vw"
                      className="object-cover opacity-40"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <span className="text-xs text-white/40 mb-2 tracking-widest uppercase">{project.category}</span>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed max-w-md line-clamp-2">{project.desc}</p>
                  </div>
                </motion.div>
              );
            })}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              {projects.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    i === activeStack ? 'w-5 bg-white' : 'w-1.5 bg-white/30',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────────────────── */
const testimonialLayouts = [
  {
    width: 'w-[82vw] md:w-[20rem] lg:w-[23rem]',
    position: 'left-[5%] top-[45%] md:left-[9%] md:top-[43%]',
    input: [0.02, 0.12, 0.26, 0.36],
    x: [0, -8, -18, -34],
    y: [80, 80, -170, -660],
    scale: [0.9, 1, 1.02, 0.94],
    rotate: [-6, -2, 1, 4],
    opacity: [1, 1, 1, 0],
  },
  {
    width: 'w-[84vw] md:w-[24rem] lg:w-[28rem]',
    position: 'left-[8%] top-[44%] md:left-[32%] md:top-[42%]',
    input: [0.24, 0.34, 0.48, 0.58],
    x: [0, 10, 20, 34],
    y: [92, 76, -175, -680],
    scale: [0.9, 1.04, 1.02, 0.94],
    rotate: [7, 1, -3, -7],
    opacity: [1, 1, 1, 0],
  },
  {
    width: 'w-[82vw] md:w-[21rem] lg:w-[25rem]',
    position: 'left-[6%] top-[45%] md:left-auto md:right-[9%] md:top-[43%]',
    input: [0.46, 0.56, 0.7, 0.8],
    x: [0, -8, -22, -44],
    y: [112, 78, -170, -670],
    scale: [0.9, 1.03, 1.05, 0.95],
    rotate: [8, 2, -2, 5],
    opacity: [1, 1, 1, 0],
  },
  {
    width: 'w-[80vw] md:w-[19rem] lg:w-[23rem]',
    position: 'left-[10%] top-[47%] md:left-[41%] md:top-[48%]',
    input: [0.68, 0.76, 0.9, 1],
    x: [0, 12, -14, -38],
    y: [116, 80, -165, -650],
    scale: [0.88, 1, 1.04, 0.94],
    rotate: [-7, 2, 7, 10],
    opacity: [1, 1, 1, 0],
  },
] as const;

function interpolateTimeline(
  progress: number,
  input: readonly number[],
  output: readonly number[],
) {
  if (progress <= input[0]) return output[0];

  for (let index = 1; index < input.length; index += 1) {
    if (progress <= input[index]) {
      const start = input[index - 1];
      const end = input[index];
      const amount = (progress - start) / Math.max(0.0001, end - start);
      return output[index - 1] + (output[index] - output[index - 1]) * amount;
    }
  }

  return output[output.length - 1];
}

function CreativeProjectsSection({
  projects,
  galleryImages,
  containerRef,
}: {
  projects: Project[];
  galleryImages: GalleryImage[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const expandedSectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const galleryPool = useMemo(() => {
    const fallbackPool = projects.flatMap((p) => [
      { src: p.image.src, alt: p.image.alt, title: p.title, sub: p.category },
      { src: p.processImage.src, alt: p.processImage.alt, title: p.category, sub: p.tags[0] ?? '' },
    ]);
    return galleryImages.length > 0 ? galleryImages : fallbackPool;
  }, [galleryImages, projects]);

  const initialGalleryCount = isMobileLayout ? 8 : 12;
  const remainingGallery = galleryPool.slice(initialGalleryCount);

  const posterPairs = useMemo(() => {
    const visiblePool = galleryPool.slice(0, initialGalleryCount);
    if (visiblePool.length === 0) return [];
    const initialCount = isMobileLayout ? 8 : 12;
    const paddedPool = visiblePool.length < initialCount
      ? Array.from({ length: initialCount }, (_, index) => visiblePool[index % visiblePool.length])
      : visiblePool;
    const shifted = [...paddedPool.slice(2), ...paddedPool.slice(0, 2)];
    const itemCount = paddedPool.length;
    return Array.from({ length: itemCount }, (_, index) => ({
      initial: shifted[index % shifted.length],
      final: shifted[(index + 5) % shifted.length],
    }));
  }, [galleryPool, initialGalleryCount, isMobileLayout]);

  useEffect(() => {
    const scroller = containerRef.current;
    const section = sectionRef.current;
    if (!scroller || !section) return;

    let frame = 0;
    let latest = 0;
    const update = () => {
      const travel = Math.max(1, section.offsetHeight - scroller.clientHeight);
      latest = Math.min(1, Math.max(0, (scroller.scrollTop - section.offsetTop) / travel));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setProgress(prefersReducedMotion ? 0.45 : latest);
      });
    };

    update();
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [containerRef, prefersReducedMotion]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileLayout(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!showAllGallery || !isMobileLayout) return;
    const scroller = containerRef.current;
    const expandedSection = expandedSectionRef.current;
    if (!scroller || !expandedSection) return;

    const frame = requestAnimationFrame(() => {
      const revealOffset = Math.min(100, scroller.clientHeight * 0.13);
      const targetTop = expandedSection.offsetTop - revealOffset;
      scroller.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(frame);
  }, [containerRef, isMobileLayout, showAllGallery]);

  const ease = progress * progress * (3 - 2 * progress);
  const entranceRaw = Math.min(1, Math.max(0, (ease + 0.16) / 0.3));
  const entrance = entranceRaw * entranceRaw * (3 - 2 * entranceRaw);
  const fillRaw = Math.min(1, Math.max(0, (ease - 0.18) / 0.58));
  const fill = fillRaw * fillRaw * (3 - 2 * fillRaw);
  const headingOpacity = Math.max(0, 1 - fill * 1.25);
  const horizontalDrift = -24 + entrance * 24 + ease * 20;
  const mobileWallPanRaw = Math.min(1, Math.max(0, (fill - 0.72) / 0.28));
  const mobileWallPan = mobileWallPanRaw * mobileWallPanRaw * (3 - 2 * mobileWallPanRaw) * 38;
  const galleryCount = galleryPool.length;
  const canToggleGallery = galleryCount > initialGalleryCount;

  return (
    <>
    <section ref={sectionRef} id="more-work" className="relative h-[200svh] bg-[#06080d] md:h-[218svh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_45%_30%_at_50%_50%,rgba(255,255,255,0.06),transparent_74%)]" />

        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center justify-center px-5 text-center"
          style={{
            opacity: headingOpacity,
            willChange: 'transform, opacity',
            transform: `translate3d(0, calc(-50% + ${(-fill * 28).toFixed(2)}px), 0)`,
          }}
        >
          <CreativeHeadingReveal />
        </div>

        <div className="absolute inset-0 z-10">
          {/* On mobile cap at 6 tiles — reduces layout/composite work per frame */}
          {(isMobileLayout ? posterPairs.slice(0, 6) : posterPairs).map((pair, index) => {
            const activePairs = isMobileLayout ? Math.min(6, posterPairs.length) : posterPairs.length;
            const bandSize = isMobileLayout ? Math.ceil(activePairs / 2) : 6;
            const isTopBand = index < bandSize;
            const bandIndex = index % bandSize;
            const finalColumns = isMobileLayout ? 2 : 4;
            const finalRows = Math.ceil(activePairs / finalColumns);
            const finalCol = index % finalColumns;
            const finalRow = Math.floor(index / finalColumns);
            const rowTravel = isMobileLayout ? 22 : 34;
            const rowEnter = (isTopBand ? -rowTravel : rowTravel) * (1 - entrance);
            const movingGap = 0.42 * (1 - fill);
            const revealColGap = 0.12 * fill;
            const revealRowGap = finalRows > 3 ? 1.6 * fill : 4.1 * fill;
            const initialX = isMobileLayout
              ? -8 + bandIndex * (46 + movingGap * 8) + horizontalDrift * 0.42 + (isTopBand ? 0 : -10)
              : -9 + bandIndex * (19.7 + movingGap) + horizontalDrift + (isTopBand ? 0 : -7);
            const initialY = (isTopBand ? (isMobileLayout ? 24 : 10) : (isMobileLayout ? 54 : 56)) + rowEnter;
            const finalX = isMobileLayout ? 2.2 + finalCol * 50.25 : 4.5 + finalCol * (23.05 + revealColGap);
            const mobileWallPanDistance = isMobileLayout && finalRows > 4 ? mobileWallPan : 0;
            const finalY = isMobileLayout
              ? 7 + finalRow * (finalRows > 2 ? 20 : 42) - mobileWallPanDistance
              : 3.8 + finalRow * ((88 / finalRows) + revealRowGap);
            const positionFill = isMobileLayout ? Math.min(1, fill * 1.08) : fill;
            const x = initialX + (finalX - initialX) * positionFill;
            const y = initialY + (finalY - initialY) * positionFill;
            const scale = isMobileLayout ? 1 : 0.98 + fill * 0.08;
            const opacity = isMobileLayout ? 0.34 + entrance * 0.42 + fill * 0.2 : 0.08 + entrance * 0.66 + fill * 0.26;
            const tileWidth = isMobileLayout ? 'calc((94vw - 1rem) / 2)' : 'clamp(12rem, 20vw, 23rem)';
            const tileHeight = isMobileLayout
              ? 'clamp(7.25rem, 17vh, 9.4rem)'
              : finalRows > 3 ? 'clamp(9.6rem, 22vh, 16.5rem)' : 'clamp(10rem, 24vh, 14rem)';
            return (
              <div
                key={`${pair.initial.title}-${index}`}
                style={{
                  position: 'absolute',
                  left: `${x.toFixed(3)}%`,
                  top: `${y.toFixed(3)}%`,
                  width: tileWidth,
                  height: tileHeight,
                  opacity,
                  willChange: 'transform, opacity',
                  transform: `translate3d(0,0,0) scale(${scale.toFixed(4)})`,
                }}
              >
                <CreativeMorphPoster initial={pair.initial} final={pair.final} index={index} progress={fill} />
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-32 bg-gradient-to-b from-[#06080d] via-black/78 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-32 bg-gradient-to-t from-[#06080d] via-black/78 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-40 w-28 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-40 w-28 bg-gradient-to-l from-black to-transparent" />
        {canToggleGallery && !showAllGallery && (
          <button
            type="button"
            onClick={() => setShowAllGallery(true)}
            className="absolute bottom-[clamp(7rem,17vh,9rem)] left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.09] bg-[#0d0f14]/80 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_0_0_0.5px_rgba(255,255,255,0.07)] backdrop-blur-xl transition hover:border-white/20 hover:text-white md:bottom-7"
            style={{ opacity: Math.max(0.3, fill) }}
          >
            Show more ({galleryCount - initialGalleryCount})
            <ArrowDown className="size-3" />
          </button>
        )}
      </div>
    </section>
    {showAllGallery && remainingGallery.length > 0 && (
      <section ref={expandedSectionRef} className="relative z-20 -mt-[clamp(5rem,17vh,8.5rem)] bg-[#06080d] pb-20 pt-0 md:mt-0 md:pb-24">
        <div className="mx-auto w-[94vw] pt-0 md:w-[92vw] md:pt-5 lg:w-[92.2vw]">
          <div
            className="grid grid-cols-2 gap-4 sm:gap-3 md:gap-4"
            style={{
              gridTemplateColumns: isMobileLayout ? undefined : 'repeat(4, minmax(0, 1fr))',
            }}
          >
            {remainingGallery.map((image, index) => (
              <ExpandedGalleryTile key={`${image.src}-${index}`} image={image} />
            ))}
          </div>
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllGallery(false)}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-[#0d0f14]/80 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_0_0_0.5px_rgba(255,255,255,0.07)] backdrop-blur-xl transition hover:border-white/20 hover:text-white"
            >
              Show less
              <ArrowUp className="size-3" />
            </button>
          </div>
        </div>
      </section>
    )}
    </>
  );
}

function ExpandedGalleryTile({ image }: { image: GalleryImage }) {
  return (
    <div className="h-[clamp(7.25rem,17vh,9.4rem)] md:h-[clamp(10rem,25.5vh,14.4rem)]">
      <CreativeMorphPoster initial={image} final={image} index={0} progress={0} />
    </div>
  );
}

function CreativeMorphPoster({
  initial,
  final,
  index,
  progress,
}: {
  initial: GalleryImage;
  final: GalleryImage;
  index: number;
  progress: number;
}) {
  const active = progress > 0.5 ? final : initial;
  const isExternalLink = active.link ? !active.link.startsWith('/') : false;
  const content = (
    <>
      {active.link && (
        <span className="absolute right-1.5 top-1.5 z-20 inline-flex size-6 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-100 backdrop-blur-md transition duration-300 md:right-3 md:top-3 md:size-9 md:opacity-0 md:group-hover:translate-x-0.5 md:group-hover:-translate-y-0.5 md:group-hover:opacity-100">
          <ArrowUpRight className="size-3 md:size-4" />
        </span>
      )}
      <Image
        src={initial.src}
        alt={initial.alt}
        fill
        sizes="(max-width: 768px) 45vw, 190px"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
        className="object-cover text-[0px] text-transparent transition duration-300 group-hover:scale-[1.035]"
        style={{ opacity: 1 - progress }}
      />
      <Image
        src={final.src}
        alt={final.alt}
        fill
        sizes="(max-width: 768px) 45vw, 190px"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
        className="object-cover text-[0px] text-transparent transition duration-300 group-hover:scale-[1.035]"
        style={{ opacity: progress }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/54 via-black/0 to-black/4 md:from-black/70 md:via-black/8 md:to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="line-clamp-1 text-xs font-semibold tracking-[-0.02em] text-white/88">
          {active.title}
        </div>
        <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/42">
          {active.sub}
        </div>
      </div>
    </>
  );

  const className =
    'group relative block size-full overflow-hidden rounded-2xl bg-[#0e1118] shadow-[0_24px_80px_rgba(0,0,0,0.42)]';

  if (active.link) {
    return (
      <a
        href={active.link}
        target={isExternalLink ? '_blank' : undefined}
        rel={isExternalLink ? 'noreferrer' : undefined}
        className={className}
        style={{ transform: `translateY(${(index % 2) * 5}px)` }}
        aria-label={`Open ${active.title}`}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={className}
      style={{ transform: `translateY(${(index % 2) * 5}px)` }}
    >
      {content}
    </div>
  );
}

function CreativeHeadingReveal() {
  const words = ['Crafted', 'with', 'real', 'intent'];

  return (
    <motion.h2
      aria-label="Crafted with real intent"
      className="text-balance text-5xl font-light leading-[0.92] tracking-[-0.06em] text-white sm:text-7xl"
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.78 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.09,
            delayChildren: 0.04,
          },
        },
      }}
    >
      {words.map((word, index) => {
        return (
          <span key={word} className="inline-block overflow-hidden pr-[0.12em] pb-[0.04em] align-bottom">
            <motion.span
              className="inline-block will-change-[opacity,transform,filter]"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 54,
                  filter: 'blur(14px)',
                  color: 'rgba(255,255,255,0.42)',
                },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  color: 'rgba(255,255,255,1)',
                  transition: {
                    duration: 0.82,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </motion.h2>
  );
}

function CreativeStrip({
  items,
  className,
  direction,
  progress,
  y,
  opacity,
}: {
  items: Array<{ src: string; alt: string; title: string; sub: string }>;
  className: string;
  direction: 1 | -1;
  progress: number;
  y: number;
  opacity: number;
}) {
  return (
    <div className={cn('pointer-events-none absolute inset-x-0 z-30 overflow-hidden', className)}>
      <div
        className="flex h-full min-w-max items-center gap-3 px-3 sm:gap-4 sm:px-5"
        style={{
          opacity,
          transform: `translate3d(${(direction * progress * 9).toFixed(2)}vw, ${y.toFixed(2)}px, 0)`,
        }}
      >
        {items.map((item, index) => (
          <CreativeTile key={`${item.title}-${index}`} item={item} index={index} compact />
        ))}
      </div>
    </div>
  );
}

function CreativeStripRow({
  items,
  progress,
  direction,
  dim,
}: {
  items: Array<{ src: string; alt: string; title: string; sub: string }>;
  progress: number;
  direction: 1 | -1;
  dim?: boolean;
}) {
  return (
    <div
      className={cn('flex min-w-max gap-3 sm:gap-4', dim && 'opacity-70')}
      style={{ transform: `translate3d(${(direction * (progress * 14 - 7)).toFixed(2)}vw, 0, 0)` }}
    >
      {items.map((item, index) => (
        <CreativeTile key={`${item.title}-wall-${index}`} item={item} index={index} />
      ))}
    </div>
  );
}

function CreativeTile({
  item,
  index,
  compact,
  grid,
}: {
  item: { src: string; alt: string; title: string; sub: string };
  index: number;
  compact?: boolean;
  grid?: boolean;
}) {
  const rotations = [-1.6, 1.2, -0.8, 1.8, 0.4, -1.1];
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0e1118] shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
      style={{
        width: grid ? '100%' : compact ? 'clamp(132px,12vw,190px)' : 'clamp(112px,10vw,168px)',
        height: grid ? '100%' : compact ? '78%' : 'clamp(170px,28vh,270px)',
        transform: grid ? 'none' : `rotate(${rotations[index % rotations.length]}deg)`,
      }}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(max-width: 768px) 45vw, 220px"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
        className="object-cover text-[0px] text-transparent opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-black/18" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="line-clamp-1 text-xs font-medium tracking-[-0.02em] text-white/85">{item.title}</div>
        <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/36">{item.sub}</div>
      </div>
    </div>
  );
}

function TestimonialsSection({
  testimonials,
  containerRef,
}: {
  testimonials: PortfolioContent['testimonials'];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    container: containerRef as React.RefObject<HTMLElement>,
    target: sectionRef as React.RefObject<HTMLElement>,
    offset: ['start start', 'end end'],
  });
  return (
    <section className="relative overflow-hidden bg-[#06080d] py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 62% 42% at 58% 42%, rgba(var(--accent-rgb),0.13) 0%, rgba(var(--accent-rgb),0.055) 38%, transparent 72%)',
        }}
      />
      {/* Vignette — fade edges into page bg */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(to bottom, #06080d 0%, rgba(6,8,13,0.18) 10%, transparent 28%, transparent 76%, #06080d 100%), linear-gradient(to right, rgba(6,8,13,0.48) 0%, transparent 18%, transparent 82%, rgba(6,8,13,0.48) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--accent)]">
            <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_currentColor]" />
            Testimonials
          </div>
          <h2 className="text-balance text-5xl font-light tracking-[-0.055em] text-white lg:text-6xl">
            <span className="font-serif italic text-white/55">Hear from clients</span>
            <br />
            I&apos;ve worked with
          </h2>
        </motion.div>

        {/* Staggered 2-col — column 2 offset down for scattered feel */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Col 1 */}
          <div className="space-y-5">
            {[testimonials[0], testimonials[2]].filter(Boolean).map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: -36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="rounded-[22px] border border-white/10 bg-[#06080d]/65 p-6 backdrop-blur-md"
              >
                <p className="mb-6 text-base font-light leading-8 text-white/65">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-bold tracking-wide text-white/70">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-[11px] text-white/38">{t.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Col 2 — pushed down */}
          <div className="space-y-5 md:pt-14">
            {[testimonials[1], testimonials[3]].filter(Boolean).map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: 36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1], delay: 0.06 + i * 0.1 }}
                className="rounded-[22px] border border-white/10 bg-[#06080d]/65 p-6 backdrop-blur-md"
              >
                <p className="mb-6 text-base font-light leading-8 text-white/65">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-bold tracking-wide text-white/70">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-[11px] text-white/38">{t.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PLUGIN BUILDS
───────────────────────────────────────────────────────── */
function PluginBuildsSection({ plugins }: { plugins: Plugin[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="plugins" className="relative px-5 py-24 md:px-10 lg:px-16">
      {/* Top separator line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Header — matches site's thin cinematic heading style */}
        <motion.div
          className="mb-16 md:mb-20"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionLabel>Custom Builds</SectionLabel>
          <h2 className="mt-5 text-5xl font-light leading-[1.08] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Custom plugin<br />builds.
          </h2>
        </motion.div>

        {/* Rows */}
        <div className="border-t border-white/8">
          {plugins.map((plugin, i) => (
            <motion.a
              key={plugin.id}
              href={plugin.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${plugin.name} source on GitHub`}
              className="group relative flex cursor-pointer items-start gap-5 border-b border-white/8 py-8 transition-colors duration-300 md:items-center md:py-10"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.09 }}
            >
              {/* Title + desc reveal — flex-1 so tags stay pinned right */}
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-light tracking-[-0.04em] text-white/70 transition-colors duration-300 group-hover:text-white md:text-3xl lg:text-[2.5rem] lg:leading-tight">
                  {plugin.name}
                </p>
                {/* Desc slides in under title on hover */}
                <div className="grid transition-all duration-300 ease-out [grid-template-rows:0fr] group-hover:[grid-template-rows:1fr]">
                  <div className="overflow-hidden">
                    <p className="w-[90%] pt-2.5 text-[13px] leading-relaxed text-white/40">{plugin.desc}</p>
                  </div>
                </div>
              </div>

              {/* Tags — right-aligned, rectangular, matching projects section */}
              <div className="hidden shrink-0 flex-wrap justify-end gap-1.5 md:flex md:max-w-[38%] lg:max-w-[44%]">
                {plugin.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-white/14 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/46"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Mobile tags */}
              <div className="flex shrink-0 flex-wrap gap-1 md:hidden">
                {plugin.tags.slice(0, 2).map((t) => (
                  <span key={t} className="rounded border border-white/14 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-white/40">
                    {t}
                  </span>
                ))}
              </div>

              {/* Git icon — always visible */}
              <GitBranch className="ml-3 size-[18px] shrink-0 text-white/45" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   CONTACT — with entrance scroll animations
───────────────────────────────────────────────────────── */
function StickyTestimonialsSection({
  testimonials,
  containerRef,
}: {
  testimonials: PortfolioContent['testimonials'];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    let frame = 0;
    let cleanup: (() => void) | undefined;

    const bindScrollProgress = () => {
      const container = containerRef.current;
      const section = sectionRef.current;
      if (!container || !section) {
        frame = requestAnimationFrame(bindScrollProgress);
        return;
      }

      const updateProgress = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const travel = Math.max(1, section.offsetHeight - container.clientHeight);
          const raw = (container.scrollTop - section.offsetTop) / travel;
          if (mounted) setScrollProgress(Math.min(1, Math.max(0, raw)));
        });
      };

      updateProgress();
      container.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      cleanup = () => {
        container.removeEventListener('scroll', updateProgress);
        window.removeEventListener('resize', updateProgress);
      };
    };

    bindScrollProgress();

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [containerRef]);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="testimonial-stage relative h-[320svh] bg-[#06080d]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
          <FluidParticlesBackground particleCount={1500} noiseIntensity={0.0028} particleSize={{ min: 0.45, max: 1.45 }} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{
            background:
              'linear-gradient(to bottom, #06080d 0%, rgba(6,8,13,0.28) 14%, transparent 34%, transparent 68%, #06080d 100%), linear-gradient(to right, rgba(6,8,13,0.72) 0%, transparent 22%, transparent 78%, rgba(6,8,13,0.72) 100%)',
          }}
        />

        <div className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center px-5 text-center">
          <div>
            <div className="text-[clamp(4.8rem,16vw,17rem)] font-light leading-[0.78] tracking-[-0.08em] text-white/[0.09]">
              Testimonials
            </div>
            <div className="-mt-2 font-serif text-[clamp(3.6rem,10vw,11rem)] italic leading-none tracking-[-0.06em] text-[rgba(var(--accent-rgb),0.13)] md:-mt-8">
              Real words
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="relative mx-auto h-screen max-w-7xl px-5 sm:px-8 lg:px-10">
            {testimonials.map((testimonial, index) => (
              <FloatingTestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
                layout={testimonialLayouts[index % testimonialLayouts.length]}
                progress={scrollProgress}
                reduceMotion={Boolean(prefersReducedMotion)}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

function FloatingTestimonialCard({
  testimonial,
  layout,
  progress,
  reduceMotion,
}: {
  testimonial: PortfolioContent['testimonials'][number];
  layout: (typeof testimonialLayouts)[number];
  progress: number;
  reduceMotion: boolean;
}) {
  const x = reduceMotion ? 0 : interpolateTimeline(progress, layout.input, layout.x);
  const y = reduceMotion ? 0 : interpolateTimeline(progress, layout.input, layout.y);
  const scale = reduceMotion ? 1 : interpolateTimeline(progress, layout.input, layout.scale);
  const rotate = reduceMotion ? 0 : interpolateTimeline(progress, layout.input, layout.rotate);
  const opacity = reduceMotion ? 1 : interpolateTimeline(progress, layout.input, layout.opacity);

  return (
    <motion.div className={cn('absolute', layout.position, layout.width)} style={{ x, y, scale, rotate, opacity }}>
      <TestimonialCard testimonial={testimonial} />
    </motion.div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: PortfolioContent['testimonials'][number] }) {
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(circle 260px at ${glowX}% ${glowY}%, rgba(var(--accent-rgb),0.25), rgba(var(--cool-rgb),0.12) 34%, transparent 70%)`;

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    glowX.set(x * 100);
    glowY.set(y * 100);
    rotateX.set((0.5 - y) * 5);
    rotateY.set((x - 0.5) * 5);
  };

  const handlePointerLeave = () => {
    glowX.set(50);
    glowY.set(50);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      data-cursor="interactive"
      className="testimonial-card group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.12] bg-[#0d0f14]/86 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.64),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[rgba(var(--accent-rgb),0.42)] hover:shadow-[0_34px_120px_rgba(0,0,0,0.74),0_0_54px_rgba(var(--accent-rgb),0.12),inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.026)_34%,transparent_72%),radial-gradient(circle_at_86%_12%,rgba(var(--accent-rgb),0.18),transparent_13rem),radial-gradient(circle_at_12%_100%,rgba(var(--cool-rgb),0.095),transparent_15rem),radial-gradient(circle_at_56%_118%,rgba(var(--cool-soft-rgb),0.10),transparent_14rem)]" />
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glow }} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 group-hover:[background:radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(145deg,rgba(var(--accent-rgb),0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 before:absolute before:inset-y-[-40%] before:left-[-55%] before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-white/16 before:to-transparent before:blur-sm before:transition-transform before:duration-1000 group-hover:before:translate-x-[310%]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--accent-rgb),0.38)] to-transparent opacity-70" />
      <div className="pointer-events-none absolute -right-7 -top-10 font-serif text-[8rem] italic leading-none text-white/[0.035] transition duration-500 group-hover:text-white/[0.055]">
        &ldquo;
      </div>
      <div className="relative">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-full border border-[rgba(var(--accent-rgb),0.28)] bg-[rgba(var(--accent-rgb),0.09)] text-[11px] font-bold tracking-wide text-[var(--accent)] shadow-[0_0_34px_rgba(var(--accent-rgb),0.16),inset_0_1px_0_rgba(255,255,255,0.10)] transition duration-300 group-hover:scale-105 group-hover:border-[rgba(var(--accent-rgb),0.5)] group-hover:bg-[rgba(var(--accent-rgb),0.14)]">
            {testimonial.initials}
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-white/12 via-white/5 to-transparent" />
          <div className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/34">
            Client
          </div>
        </div>
        <p className="text-[1.02rem] font-light leading-8 tracking-[-0.015em] text-white/82 lg:text-lg">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <div className="mt-8 flex items-end justify-between gap-5 border-t border-white/10 pt-5">
          <div>
            <div className="text-sm font-semibold tracking-[-0.01em] text-white">{testimonial.name}</div>
            <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">{testimonial.title}</div>
          </div>
          <div className="mb-1 size-2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)] transition duration-300 group-hover:scale-[1.8] group-hover:shadow-[0_0_28px_var(--accent)]" />
        </div>
      </div>
    </motion.article>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const isValid =
    form.name.trim().length > 1 &&
    form.email.trim().includes('@') &&
    form.email.trim().includes('.') &&
    form.message.trim().length > 3;

  const submit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError('Something went wrong. Please try again or email me directly.');
      }
    } catch {
      setError('Network error. Please try again or email me directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="grid gap-12 rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10"
      >
        {/* Left — info */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <SectionLabel>Contact</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-5xl font-light leading-[0.95] tracking-[-0.055em] sm:text-7xl"
          >
            Let&apos;s build something precise.
          </motion.h2>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 space-y-5 text-sm text-white/54"
          >
            <a className="flex items-center gap-3 transition hover:text-white" href="mailto:shoaib.saq@gmail.com">
              <Mail className="size-4 text-[var(--accent)]" /> shoaib.saq@gmail.com
            </a>
            <a
              className="flex items-center gap-3 transition hover:text-white"
              href="https://www.linkedin.com/in/shoaib-alam-qureshi/"
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight className="size-4 text-[var(--accent)]" /> LinkedIn
            </a>
            <a
              className="flex items-center gap-3 transition hover:text-white"
              href="https://github.com/Shoaib-Qureshi"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 className="size-4 text-[var(--accent)]" /> GitHub
            </a>
          </motion.div>
        </motion.div>

        {/* Right — form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="grid gap-5"
        >
          <div aria-live="polite" aria-atomic="true" className="grid gap-5">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[360px] flex-col items-start justify-center rounded-[28px] border border-[rgba(var(--accent-rgb),0.28)] bg-[rgba(var(--accent-rgb),0.09)] p-8"
              >
                <Check className="mb-6 size-10 text-[var(--accent)]" />
                <h3 className="text-4xl font-light tracking-[-0.05em]">Message sent.</h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                  Thanks. I&apos;ll get back to you within 24 hours with next steps.
                </p>
              </motion.div>
            ) : (
              <>
                <ContactInput
                  label="Full name"
                  value={form.name}
                  onChange={(v) => setForm((c) => ({ ...c, name: v }))}
                />
                <ContactInput
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((c) => ({ ...c, email: v }))}
                />
                <label className="grid gap-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">Project notes</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((c) => ({ ...c, message: e.target.value }))}
                    rows={5}
                    className="min-h-36 resize-y rounded-3xl border border-white/10 bg-black/20 px-6 py-5 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[rgba(var(--accent-rgb),0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-rgb),0.55)]"
                    placeholder="Tell me about the build, timeline, goals, and constraints."
                  />
                </label>
                {error && (
                  <p className="text-sm text-red-400/90" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={!isValid || sending} className="mt-2 w-full sm:w-max">
                  {sending ? 'Sending…' : 'Send message'}
                  {!sending && <Send className="size-4" />}
                </Button>
              </>
            )}
          </div>
        </motion.form>
      </motion.div>
    </section>
  );
}

function ContactInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 rounded-full border border-white/10 bg-black/20 px-7 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[rgba(var(--accent-rgb),0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-rgb),0.55)]"
        placeholder={label}
      />
    </label>
  );
}

/* ─────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-5 py-8 text-[10px] uppercase tracking-[0.18em] text-white/32 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <span>© {new Date().getFullYear()} Shoaib Qureshi / Bengaluru, India</span>
      <span>Designed and built with cinematic restraint</span>
    </footer>
  );
}
