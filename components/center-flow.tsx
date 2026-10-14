'use client';

import { motion } from 'framer-motion';
import { Gauge, Layers, MessageCircle, ShoppingCart, Table2, Users, Workflow, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

type FlowNode = { label: string; icon: LucideIcon };
export type Flow = { hub: string; hubIcon: LucideIcon; nodes: FlowNode[] };

// Case studies that get a hub-and-spoke diagram, keyed by project id. Only
// projects with a real hub architecture belong here; the rest render nothing.
// Six nodes max: three per side.
export const FLOWS: Record<string, Flow> = {
  prepmedico: {
    hub: 'WordPress · WooCommerce',
    hubIcon: Layers,
    nodes: [
      { label: 'FluentCRM', icon: Users },
      { label: 'AiSensy WhatsApp', icon: MessageCircle },
      { label: 'Make', icon: Workflow },
      { label: 'Google Sheets', icon: Table2 },
      { label: 'Checkout rules', icon: ShoppingCart },
      { label: 'Optimizer', icon: Gauge },
    ],
  },
};

/* viewBox units; the SVG scales to its container. Tiles and hub keep their size
   in both layouts; "wide" only stretches the connectors across a landscape box. */
const LAYOUT = {
  compact: { w: 800, cols: [100, 700] },
  wide: { w: 1200, cols: [150, 1050] },
};
const H = 600;
const CY = H / 2;
const HUB = 150;
const NODE = 84;
const ROW_Y = [120, 300, 480];
const PULSE_DUR = 2.6;
const EASE = [0.16, 1, 0.3, 1] as const;

type Props = Flow & { layout?: keyof typeof LAYOUT; className?: string };

export function CenterFlow({ hub, hubIcon: HubIcon, nodes, layout = 'compact', className = '' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [reduced, setReduced] = useState(false);
  const uid = useId();
  const { w: W, cols } = LAYOUT[layout];
  const CX = W / 2;

  // SMIL keeps ticking off-screen; pause it there. Reduced motion: no pulses.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations(),
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  // Left column fills first, top to bottom; then the right column.
  const spokes = nodes.slice(0, 6).map((node, i) => {
    const side = i < 3 ? -1 : 1;
    const x = cols[side < 0 ? 0 : 1];
    const y = ROW_Y[i % 3];
    // Leave the hub fanned (upper spokes exit higher) and arrive level at the node.
    const sx = CX + side * (HUB / 2);
    const sy = CY + (y - CY) * 0.16;
    const ex = x - side * (NODE / 2);
    const mx = (sx + ex) / 2;
    return { ...node, x, y, path: `M ${sx} ${sy.toFixed(1)} C ${mx} ${sy.toFixed(1)}, ${mx} ${y}, ${ex} ${y}` };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`relative ${className}`}
    >
      <svg
        ref={svgRef}
        data-center-flow
        // Cropped to the tiles and their captions; the rest of H is empty margin.
        viewBox={`0 60 ${W} ${H - 100}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${hub} hub connected to ${nodes.map((n) => n.label).join(', ')}`}
      >
        <defs>
          <radialGradient id={`${uid}-halo`}>
            <stop offset="0" stopColor="#f5f5f5" stopOpacity="0.14" />
            <stop offset="0.45" stopColor="#f5f5f5" stopOpacity="0.04" />
            <stop offset="1" stopColor="#f5f5f5" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Halo behind the hub: the one soft glow on the diagram. */}
        <circle cx={CX} cy={CY} r="250" fill={`url(#${uid}-halo)`} />

        {/* Connectors. */}
        {spokes.map((s) => (
          <path key={s.label} d={s.path} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.25" />
        ))}

        {/* Travelling segments, hub → node: a blurred wide stroke under a thin bright one,
            both dashed along a normalised path length. Negative begin staggers them from frame one. */}
        {!reduced &&
          spokes.map((s, i) => (
            <g key={s.label} fill="none" style={{ stroke: 'var(--accent)' }} strokeLinecap="round">
              {[
                { w: 6, o: 0.35, f: `url(#${uid}-blur)` },
                { w: 1.5, o: 1, f: undefined },
              ].map(({ w, o, f }) => (
                <path key={w} d={s.path} pathLength={100} strokeWidth={w} strokeOpacity={o} filter={f} strokeDasharray="14 100" strokeDashoffset="114">
                  <animate attributeName="stroke-dashoffset" from="114" to="14" dur={`${PULSE_DUR}s`} begin={`${-i * 0.5}s`} repeatCount="indefinite" />
                </path>
              ))}
            </g>
          ))}

        {/* Nodes: icon tile plus a caption underneath (icons carry it on mobile). */}
        {spokes.map(({ label, icon: Icon, x, y }) => (
          <g key={label}>
            <rect x={x - NODE / 2} y={y - NODE / 2} width={NODE} height={NODE} rx="22" fill="#0a0d13" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <Icon x={x - 13} y={y - 13} width={26} height={26} strokeWidth={1.5} className="text-white/70" aria-hidden="true" />
            <text x={x} y={y + NODE / 2 + 16} textAnchor="middle" dominantBaseline="hanging" className="hidden fill-white/45 text-[11px] font-semibold uppercase tracking-[0.16em] sm:block">
              {label}
            </text>
          </g>
        ))}

        {/* Hub card, last so it covers the spoke origins. */}
        <rect x={CX - HUB / 2} y={CY - HUB / 2} width={HUB} height={HUB} rx="36" fill="#0b0e15" stroke="rgba(245,245,245,0.4)" strokeWidth="1" />
        <HubIcon x={CX - 22} y={CY - 22} width={44} height={44} strokeWidth={1.5} className="text-white/50" filter={`url(#${uid}-blur)`} aria-hidden="true" />
        <HubIcon x={CX - 22} y={CY - 22} width={44} height={44} strokeWidth={1.5} className="text-white" aria-hidden="true" />
        <text x={CX} y={CY + HUB / 2 + 18} textAnchor="middle" dominantBaseline="hanging" className="hidden fill-white/55 text-[11px] font-semibold uppercase tracking-[0.18em] sm:block">
          {hub}
        </text>
      </svg>
    </motion.div>
  );
}
