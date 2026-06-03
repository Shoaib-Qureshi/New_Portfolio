'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hoveringRef = useRef(false);
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const smoothX = useSpring(x, { stiffness: 420, damping: 36, mass: 0.7 });
  const smoothY = useSpring(y, { stiffness: 420, damping: 36, mass: 0.7 });

  useEffect(() => {
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const desktopWidthQuery = window.matchMedia('(min-width: 768px)');
    const updateEnabled = () => {
      const shouldEnable = finePointerQuery.matches && desktopWidthQuery.matches;
      setEnabled(shouldEnable);
      return shouldEnable;
    };

    if (!updateEnabled()) return;

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as HTMLElement | null;
      const nextHovering = Boolean(target?.closest('a, button, input, textarea, [data-cursor="interactive"]'));
      if (nextHovering !== hoveringRef.current) {
        hoveringRef.current = nextHovering;
        setHovering(nextHovering);
      }
    };
    finePointerQuery.addEventListener('change', updateEnabled);
    desktopWidthQuery.addEventListener('change', updateEnabled);
    window.addEventListener('mousemove', onMove);
    return () => {
      finePointerQuery.removeEventListener('change', updateEnabled);
      desktopWidthQuery.removeEventListener('change', updateEnabled);
      window.removeEventListener('mousemove', onMove);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        data-visual-ignore="true"
        className="pointer-events-none fixed left-0 top-0 z-[120] size-2 rounded-full bg-[var(--accent)] shadow-[0_0_14px_rgba(var(--accent-rgb),0.28)]"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        data-visual-ignore="true"
        className="pointer-events-none fixed left-0 top-0 z-[119] rounded-full border border-[var(--border)] bg-[var(--accent-soft)] backdrop-blur-[1px]"
        animate={{ width: hovering ? 58 : 38, height: hovering ? 58 : 38, opacity: hovering ? 0.9 : 0.55 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
      />
    </>
  );
}
