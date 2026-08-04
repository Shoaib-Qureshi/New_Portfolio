'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/* Perspective constants, in arbitrary world units. */
const FOCAL = 520;
const CAM_Y = 62; // camera height above the ground plane
const NEAR = 40;
const FAR = 2600;
// Wide enough that the plane still reaches the screen edges at the far clip.
// Motes that project off-canvas are culled, so the surplus costs a bounds check.
const SPREAD = 4200; // half-width of the scattered ground
const ROAD_HALF = 92; // carved gap that reads as the road
const TRAIL_Z = 420; // long-exposure streak length, in depth
const TRAIL_STEPS = 18;

/* The road weaves as it recedes — two sines so the curve never looks periodic. */
const roadX = (z: number) => Math.sin(z * 0.0045) * 210 + Math.sin(z * 0.0017) * 360;

interface Mote {
  z: number;
  offset: number; // lateral distance from the road centre
  jitter: number; // per-mote height, keeps the plane from looking laser-flat
  twinkle: number;
}

interface Trail {
  z: number;
  lane: number;
  speed: number;
  dir: 1 | -1; // 1 recedes toward the horizon, -1 approaches the camera
  alpha: number;
}

/** A star the visitor made by clicking the hero. Screen-space, unlike Mote. */
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  twinkle: number;
}

const SPARKS_PER_CLICK = 16;
const MAX_SPARKS = 260;

export function HorizonField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let width = 0;
    let height = 0;
    let motes: Mote[] = [];
    // `fy` is a fraction of the sky, not a pixel — so the field stays full
    // regardless of where the horizon has drifted to.
    let stars: { x: number; fy: number; r: number; twinkle: number }[] = [];
    let trails: Trail[] = [];
    let sparks: Spark[] = [];
    let ripples: { x: number; y: number; age: number }[] = [];

    const pointer = { x: 0, y: 0 };
    let easedX = 0;
    let easedY = 0;
    let scrollPx = 0;
    let easedScroll = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const narrow = width < 768;
      const moteCount = narrow ? 900 : 2600;
      const starCount = narrow ? 260 : 620;

      motes = Array.from({ length: moteCount }, () => ({
        z: NEAR + Math.random() * (FAR - NEAR),
        offset: (ROAD_HALF + Math.random() * SPREAD) * (Math.random() < 0.5 ? -1 : 1),
        jitter: Math.random() * 26 - 6,
        twinkle: Math.random() * Math.PI * 2,
      }));

      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        // Squared so stars bunch toward the horizon rather than spreading evenly.
        fy: Math.random() ** 0.6,
        r: Math.random() * 0.9 + 0.25,
        twinkle: Math.random() * Math.PI * 2,
      }));

      trails = Array.from({ length: narrow ? 4 : 7 }, (_, i) => {
        const dir: 1 | -1 = i % 2 === 0 ? -1 : 1;
        return {
          z: NEAR + Math.random() * (FAR - NEAR),
          lane: dir === -1 ? -46 - Math.random() * 26 : 46 + Math.random() * 26,
          speed: 4.5 + Math.random() * 4,
          dir,
          alpha: 0.34 + Math.random() * 0.4,
        };
      });
    };

    /* Ground plane projection. Returns null when the point lands off-canvas. */
    const project = (worldX: number, worldY: number, z: number, cx: number, horizon: number) => {
      const s = FOCAL / z;
      const sx = cx + worldX * s;
      if (sx < -80 || sx > width + 80) return null;
      return { sx, sy: horizon + (CAM_Y + worldY) * s, s };
    };

    const spawnStars = (x: number, y: number) => {
      for (let i = 0; i < SPARKS_PER_CLICK; i++) {
        const angle = (i / SPARKS_PER_CLICK) * Math.PI * 2 + Math.random() * 0.7;
        // Reduced motion still gets its stars — they simply arrive in place.
        const speed = prefersReduced ? 0 : 1.4 + Math.random() * 4.2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 0.4 + Math.random() * 1.1,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
      if (!prefersReduced) ripples.push({ x, y, age: 0 });
      // Oldest stars retire once the sky is full, so a long session can't grow
      // the draw loop without bound.
      if (sparks.length > MAX_SPARKS) sparks.splice(0, sparks.length - MAX_SPARKS);
    };

    let last = performance.now();

    const draw = (now: number) => {
      const dt = prefersReduced ? 0 : Math.min(2.5, (now - last) / 16.67);
      last = now;

      easedX += (pointer.x - easedX) * 0.04;
      easedY += (pointer.y - easedY) * 0.04;
      easedScroll += (scrollPx - easedScroll) * 0.06;

      // The camera rises over the first couple of screens, lifting the horizon
      // so lower sections get the ground plane instead of empty sky. Bounded,
      // so it settles rather than flying off past the fold.
      const lift = Math.min(1, easedScroll / (height * 2.2));
      const cx = width * 0.5 + easedX * 46;
      const horizon = height * (0.56 - lift * 0.2) + easedY * 20;

      ctx.clearRect(0, 0, width, height);

      /* Stars — the deepest layer, barely moving. */
      for (const star of stars) {
        star.twinkle += 0.012 * dt;
        const a = 0.2 + Math.sin(star.twinkle) * 0.13;
        if (a <= 0) continue;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(star.x - easedX * 8, star.fy * horizon - easedY * 6, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Ground motes rushing past the camera. */
      for (const mote of motes) {
        mote.z -= (2.1 + lift * 1.5) * dt;
        if (mote.z < NEAR) {
          mote.z = FAR;
          mote.offset = (ROAD_HALF + Math.random() * SPREAD) * (Math.random() < 0.5 ? -1 : 1);
        }
        const p = project(roadX(mote.z) + mote.offset, mote.jitter, mote.z, cx, horizon);
        if (!p) continue;

        mote.twinkle += 0.03 * dt;
        // Bright and dense toward the far clip — that ridge is what reads as a horizon.
        // Only the last stretch fades, so the band never ends in a hard line.
        const ridge = 0.13 + 0.3 * (mote.z / FAR) ** 2;
        const a =
          Math.min(1, (mote.z - NEAR) / 220) *
          Math.min(1, (FAR - mote.z) / 240) *
          ridge *
          (0.72 + Math.sin(mote.twinkle) * 0.28);
        if (a <= 0.004) continue;

        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.min(2.1, Math.max(0.55, p.s * 1.6)), 0, Math.PI * 2);
        ctx.fill();
      }

      /* Long-exposure light trails riding the road. */
      ctx.lineCap = 'round';
      for (const trail of trails) {
        trail.z += trail.speed * trail.dir * dt;
        if (trail.z > FAR) trail.z = NEAR;
        if (trail.z < NEAR) trail.z = FAR;

        let prev = null as { sx: number; sy: number; s: number } | null;
        for (let i = 0; i <= TRAIL_STEPS; i++) {
          const t = i / TRAIL_STEPS;
          const z = trail.z - trail.dir * TRAIL_Z * t;
          if (z < NEAR || z > FAR) {
            prev = null;
            continue;
          }
          const p = project(roadX(z) + trail.lane, 0, z, cx, horizon);
          if (!p) {
            prev = null;
            continue;
          }
          if (prev) {
            const fade = (1 - t) ** 1.6 * Math.min(1, (FAR - z) / 700);
            ctx.strokeStyle = `rgba(255,255,255,${trail.alpha * fade})`;
            ctx.lineWidth = Math.min(3.2, Math.max(0.8, p.s * 1.9)) * (1 - t * 0.5);
            ctx.beginPath();
            ctx.moveTo(prev.sx, prev.sy);
            ctx.lineTo(p.sx, p.sy);
            ctx.stroke();
          }
          prev = p;
        }

        /* Head glow. */
        const head = project(roadX(trail.z) + trail.lane, 0, trail.z, cx, horizon);
        if (head) {
          const r = Math.min(26, Math.max(2, head.s * 12));
          const glow = ctx.createRadialGradient(head.sx, head.sy, 0, head.sx, head.sy, r);
          glow.addColorStop(0, `rgba(255,255,255,${trail.alpha * 0.5})`);
          glow.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(head.sx, head.sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* Stars the visitor clicked into being — drawn last so they read clearly. */
      for (const s of sparks) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // ease-out: the burst decays into the same slow drift as the sky.
        s.vx *= 0.94 ** dt;
        s.vy *= 0.94 ** dt;
        s.twinkle += 0.03 * dt;
        // Speed doubles as heat: they ignite bright on the burst, then cool into
        // the ambient sky as the velocity decays. No extra state to track.
        const heat = Math.min(1, Math.hypot(s.vx, s.vy) / 3);
        ctx.fillStyle = `rgba(255,255,255,${0.32 + Math.sin(s.twinkle) * 0.22 + heat * 0.45})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + heat * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Expanding ring — the press feedback, ~0.5s. */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.age += dt;
        const t = rp.age / 34;
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.22 * (1 - t) ** 2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 6 + t * 74, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!prefersReduced && !document.hidden) raf = requestAnimationFrame(draw);
    };

    // The page scrolls in an inner container, not the window — capture-phase
    // catches whichever element actually scrolled.
    const onScroll = (e: Event) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.scrollHeight > t.clientHeight) scrollPx = t.scrollTop;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      // Hero only — and never hijack a press meant for a control.
      if (!e.target.closest('#hero')) return;
      if (e.target.closest('a, button, input, textarea, select, [role="button"]')) return;
      spawnStars(e.clientX, e.clientY);
      // The loop is idle under reduced motion; paint the new stars once.
      if (prefersReduced) requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    // Pause off-tab, resume on return — a hidden tab should not burn a RAF loop.
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !prefersReduced) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className={cn('pointer-events-none fixed inset-0 z-0', className)} aria-hidden="true">
      <canvas ref={canvasRef} className="size-full animate-[horizon-in_1.6s_ease-out_both]" />
      {/* Horizon haze + legibility scrims — CSS does these better than the canvas. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_38%_14%_at_50%_56%,rgba(255,255,255,0.13),transparent_72%),radial-gradient(ellipse_70%_34%_at_50%_57%,rgba(255,255,255,0.05),transparent_75%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#06080d_0%,rgba(6,8,13,0.55)_22%,rgba(6,8,13,0)_46%,rgba(6,8,13,0.35)_78%,rgba(6,8,13,0.8)_100%)]" />
    </div>
  );
}
