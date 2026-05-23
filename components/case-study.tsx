'use client';

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import type { Project } from '@/lib/content-types';
import { AnimatedShine } from '@/components/magic/animated-shine';
import { CustomCursor } from '@/components/custom-cursor';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const stagger = (delay = 0) => ({
  show: { transition: { staggerChildren: 0.1, delayChildren: delay } },
});

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden${className ? ` ${className}` : ''}`}>
      <motion.div
        initial={{ y: '108%', clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
        whileInView={{ y: '0%', clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
        viewport={{ once: true, margin: '-48px' }}
        transition={{ duration: 0.88, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}


export function CaseStudy({ project, projects }: { project: Project | null; projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* Reading progress bar */
  const { scrollYProgress } = useScroll({ container: containerRef as React.RefObject<HTMLElement> });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 32, restDelta: 0.001 });

  /* Mouse parallax on hero */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 70, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 70, damping: 22 });
  const blobX = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const blobY = useTransform(springY, [-0.5, 0.5], [-28, 28]);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06080d] px-5 text-[#f5f5f5]">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--accent)]">
            Case study
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-[-0.05em] text-white">Project not found</h1>
          <p className="mt-4 text-sm leading-7 text-white/56">
            This case study is not available anymore.
          </p>
          <Link
            href="/#work"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 transition hover:border-white/28 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back to work
          </Link>
        </div>
      </main>
    );
  }

  const idx = projects.findIndex((p) => p.id === project.id);
  const prev = idx > 0 ? projects[idx - 1] : null;
  const next = idx < projects.length - 1 ? projects[idx + 1] : null;

  return (
    <>
      <CustomCursor />

      {/* Reading progress bar */}
      <motion.div
        className="fixed left-0 top-0 z-[100] h-[2px] w-full origin-left bg-[var(--accent)]"
        style={{ scaleX }}
      />

      {/* Back button */}
      <Link
        href="/"
        className="fixed left-5 top-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#06080d]/80 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/56 backdrop-blur-xl transition hover:border-white/24 hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </Link>

      <div
        ref={containerRef}
        className="h-screen overflow-y-auto overflow-x-hidden bg-[#06080d] text-[#f5f5f5]"
        style={{ scrollbarGutter: 'stable' }}
      >
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen overflow-hidden"
          onPointerMove={onPointerMove}
          onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}
        >
          {/* Project image — right-anchored, blends left */}
          <div aria-hidden="true" className="absolute inset-0 z-[0]">
            <div
              role="img"
              aria-label={project.image.alt}
              className="absolute inset-0 size-full bg-cover bg-right opacity-[0.48] saturate-[0.52]"
              style={{ backgroundImage: `url(${project.image.src})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, #06080d 28%, rgba(6,8,13,0.88) 48%, rgba(6,8,13,0.44) 68%, rgba(6,8,13,0.12) 100%), linear-gradient(to top, #06080d 0%, rgba(6,8,13,0.6) 24%, transparent 52%)',
              }}
            />
          </div>

          {/* Parallax glows */}
          <motion.div
            aria-hidden="true"
            className="absolute right-[10%] top-[12%] z-[1] size-[min(52vw,580px)] rounded-full bg-white opacity-[0.055] blur-[120px]"
            style={{ x: blobX, y: blobY }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute left-[-6%] bottom-[18%] z-[1] size-[min(38vw,420px)] rounded-full bg-white opacity-[0.032] blur-[100px]"
            style={{ x: blobX, y: blobY }}
          />

          <div className="relative z-[3] mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-5 pb-20 pt-36 sm:px-8 lg:px-10 lg:pb-24">
            {/* Eyebrow */}
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: '108%', clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
                animate={{ y: '0%', clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                transition={{ duration: 0.88, ease: EASE, delay: 0.1 }}
              >
                <div className="mb-7 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/50">
                  <span className="size-1.5 rounded-full bg-white/50" />
                  {project.category} · {project.year}
                </div>
              </motion.div>
            </div>

            {/* Title — full width */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '108%', clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
                animate={{ y: '0%', clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                transition={{ duration: 0.88, ease: EASE, delay: 0.22 }}
                className="text-[clamp(3.8rem,9.5vw,9rem)] font-light leading-[0.85] tracking-[-0.072em] text-white"
              >
                {project.title}
              </motion.h1>
            </div>

            {/* Description + tags row */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.48 }}
              className="mt-10 flex flex-col gap-6 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-start sm:justify-between"
            >
              <p className="max-w-lg text-base font-light leading-8 text-white/52">
                {project.desc}
              </p>

              <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:max-w-xs sm:justify-end">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/44"
                  >
                    {tag}
                  </span>
                ))}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/16 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 transition hover:border-white/32 hover:text-white"
                  >
                    Live site <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── HIGHLIGHTS ────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 pb-14 pt-6 sm:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger()}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {project.highlights.map(({ metric, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
              >
                <AnimatedShine />
                <div className="text-4xl font-light tracking-[-0.06em] text-white">
                  {metric}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl border-t border-white/8 px-5 sm:px-8 lg:px-10" />

        {/* ── CHALLENGE + SOLUTION ──────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            {[
              { eyebrow: 'The Challenge', heading: 'What needed solving', body: project.challenge },
              { eyebrow: 'The Approach', heading: 'How we got there', body: project.solution },
            ].map(({ eyebrow, heading, body }, i) => (
              <div key={eyebrow}>
                <Reveal delay={i * 0.08}>
                  <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-white">
                    {eyebrow}
                  </div>
                </Reveal>
                <Reveal delay={i * 0.08 + 0.1}>
                  <h2 className="mb-6 text-3xl font-light tracking-[-0.04em] text-white lg:text-4xl">
                    {heading}
                  </h2>
                </Reveal>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-48px' }}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 + 0.22 }}
                  className="text-base font-light leading-8 text-white/58"
                >
                  {body}
                </motion.p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROCESS ───────────────────────────────────────────── */}
        <section className="relative mt-8 overflow-hidden pb-24 pt-44 sm:pt-52 lg:pt-60">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-[560px] opacity-50">
            <img
              src={project.processImage.src}
              alt=""
              aria-hidden="true"
              className="size-full object-cover object-center saturate-[0.7]"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #06080d 0%, rgba(6,8,13,0.55) 18%, rgba(6,8,13,0.28) 45%, #06080d 100%), radial-gradient(circle at 28% 24%, rgba(var(--accent-rgb),0.07), transparent 32rem)',
              }}
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-12">
            <Reveal>
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-white">
                Process
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-5xl font-light tracking-[-0.055em] text-white lg:text-6xl">
                How it was built
              </h2>
            </Reveal>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {project.process.map(({ phase, title, detail }, i) => (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 44, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.09 }}
                className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
              >
                <AnimatedShine />
                <div className="mb-8 font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">
                  Phase {phase}
                </div>
                <h3 className="mb-4 text-lg font-light tracking-[-0.03em] text-white">{title}</h3>
                <p className="text-sm leading-7 text-white/50">{detail}</p>
              </motion.div>
            ))}
          </div>
          </div>
        </section>

        {/* ── ROLE + IMPACT ─────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { label: 'Role', value: project.role },
              { label: 'Impact', value: project.impact },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-7"
              >
                <AnimatedShine />
                <Reveal delay={i * 0.08}>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                    {label}
                  </div>
                </Reveal>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, ease: EASE, delay: i * 0.08 + 0.14 }}
                  className="text-base font-light leading-7 text-white/68"
                >
                  {value}
                </motion.p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROJECT NAVIGATION ────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-12">
            {/* Previous */}
            {prev ? (
              <Link href={`/work/${prev.id}`} className="group flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full border border-white/10 transition group-hover:border-white/30">
                  <ArrowLeft className="size-4 text-white/40 transition group-hover:text-white" />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-white/28">Previous</div>
                  <div className="mt-0.5 text-sm font-light text-white/60 transition group-hover:text-white">
                    {prev.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/#work"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/28 transition hover:text-white/60"
            >
              All projects
            </Link>

            {/* Next */}
            {next ? (
              <Link href={`/work/${next.id}`} className="group flex items-center gap-4 text-right">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-white/28">Next</div>
                  <div className="mt-0.5 text-sm font-light text-white/60 transition group-hover:text-white">
                    {next.title}
                  </div>
                </div>
                <div className="flex size-12 items-center justify-center rounded-full border border-white/10 transition group-hover:border-white/30">
                  <ArrowRight className="size-4 text-white/40 transition group-hover:text-white" />
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/10 px-5 py-7 text-[10px] uppercase tracking-[0.18em] text-white/24 sm:px-8 lg:px-10">
          <span>© 2026 Shoaib Qureshi</span>
          <Link href="/" className="transition hover:text-white/50">
            Portfolio
          </Link>
        </footer>
      </div>
    </>
  );
}
