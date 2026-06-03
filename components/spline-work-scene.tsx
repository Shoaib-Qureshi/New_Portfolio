'use client';

import { useEffect, useRef, useState } from 'react';

export function SplineWorkScene() {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let app: {
      start: (array: ArrayBuffer, options?: { interactive?: boolean }) => void;
      setBackgroundColor?: (color: string) => void;
      setZoom?: (zoom: number) => void;
      dispose: () => void;
    } | null = null;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loadScene = async () => {
      const { Application } = await import('@splinetool/runtime');
      if (disposed) return;

      app = new Application(canvas, {
        renderMode: 'auto',
      });
      const response = await fetch('/Radiant%20Shift.spline');
      const scene = await response.arrayBuffer();
      app.start(scene, { interactive: false });
      if (disposed) return;

      // Opaque black clear colour (no alpha) — THREE.Color ignores alpha and
      // warns on rgba(...,0). Under the canvas' `mix-blend-mode: lighten`, black
      // contributes nothing, so the scene still reads as transparent.
      app.setBackgroundColor?.('#000000');
      app.setZoom?.(prefersReduced ? 0.94 : 1.08);
      setReady(true);
    };

    loadScene().catch(() => {
      if (!disposed) setReady(false);
    });

    return () => {
      disposed = true;
      app?.dispose();
    };
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let scrollFrame = 0;
    let active = true;
    let targetProgress = 0;
    let progress = 0;
    let easeX = 0;
    let easeY = 0;
    let spin = 0;

    const setVars = () => {
      if (!active) {
        frame = 0;
        return;
      }

      progress += (targetProgress - progress) * 0.095;
      const rx = prefersReduced ? 0 : -10 + progress * 20;
      const ry = prefersReduced ? 0 : -24 + progress * 48;
      spin += prefersReduced ? 0 : 0.36;
      easeX += (rx - easeX) * 0.08;
      easeY += (ry - easeY) * 0.08;
      shell.style.setProperty('--spline-rx', `${easeX.toFixed(3)}deg`);
      shell.style.setProperty('--spline-ry', `${easeY.toFixed(3)}deg`);
      shell.style.setProperty('--spline-rz', `${spin.toFixed(3)}deg`);
      shell.style.setProperty('--spline-scale', `${(1.14 + progress * 0.08).toFixed(4)}`);
      shell.style.setProperty('--spline-glow', `${(0.05 + progress * 0.18).toFixed(4)}`);
      shell.style.setProperty('--spline-brightness', `${(0.72 + progress * 0.28).toFixed(4)}`);
      frame = requestAnimationFrame(setVars);
    };

    const updateScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const rect = shell.getBoundingClientRect();
        const viewport = window.innerHeight || 1;
        targetProgress = Math.min(1, Math.max(0, (viewport * 0.78 - rect.top) / (viewport * 0.86)));
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = Boolean(entry?.isIntersecting);
        if (active && !frame) {
          updateScroll();
          frame = requestAnimationFrame(setVars);
        }
      },
      { rootMargin: '35% 0px 35% 0px' },
    );

    updateScroll();
    observer.observe(shell);
    document.addEventListener('scroll', updateScroll, { passive: true, capture: true });
    window.addEventListener('resize', updateScroll);
    setVars();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      observer.disconnect();
      document.removeEventListener('scroll', updateScroll, { capture: true });
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="absolute inset-0 [--spline-brightness:0.82] [--spline-glow:0.08] [--spline-rx:0deg] [--spline-ry:0deg] [--spline-rz:0deg] [--spline-scale:1]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-[8%] rounded-full opacity-[var(--spline-glow)] blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16), rgba(255,122,47,0.08) 38%, transparent 68%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className={[
          'absolute inset-0 h-full w-full origin-center transition-[opacity,filter] duration-1000 ease-out will-change-transform',
          ready ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
        ].join(' ')}
        style={{
          background: 'transparent',
          filter: 'brightness(var(--spline-brightness)) contrast(1.18) saturate(0.94)',
          imageRendering: 'auto',
          mixBlendMode: 'lighten',
          transform:
            'perspective(1100px) rotateX(var(--spline-rx)) rotateY(var(--spline-ry)) rotateZ(var(--spline-rz)) scale(var(--spline-scale))',
          WebkitMaskImage:
            'radial-gradient(ellipse 43% 45% at 31% 50%, black 0%, black 56%, transparent 73%)',
          maskImage:
            'radial-gradient(ellipse 43% 45% at 31% 50%, black 0%, black 56%, transparent 73%)',
        }}
      />
    </div>
  );
}
