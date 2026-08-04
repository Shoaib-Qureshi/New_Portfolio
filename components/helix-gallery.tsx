'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Preload } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import Image from 'next/image';
import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/content-types';

gsap.registerPlugin(ScrollTrigger);

type HelixCardData = Pick<GalleryImage, 'src' | 'alt' | 'title' | 'link'>;

const CARD_COUNT = 9;
const HELIX_RADIUS = 8.9;
const CARD_WIDTH = 4.4;
const CARD_HEIGHT = 2.83;
const HELIX_CARD_STEP = 0.42;
// Cards render at this scale on the helix. STEP, RADIUS and SCALE are solved
// together: chord between neighbours (2R·sin(step/2) ≈ 3.71) must stay at or
// above CARD_WIDTH × HELIX_SCALE (≈ 3.70) or tangent neighbours intersect.
// Touch one, re-solve the others.
const HELIX_SCALE = 0.84;
// The band as a whole drifts this far up across the helix phase — the spiral
// alone never moves the front slot vertically, so without this the hero card
// would sit pinned at centre instead of entering low and exiting high.
const HELIX_RISE = 2.2;
// Camera distance chosen so the front card fills ~55% of the viewport width.
const CAMERA_Z = 18.3;
const HELIX_CENTER = Math.PI / 2;
const HELIX_PITCH = 0.55;
// Total rotation = exactly the angular span of the card chain, so the last
// card arrives at the front just as the helix hands off. Less than this and
// rear cards never reach the centre; more and they overshoot.
const HELIX_TURNS = (CARD_COUNT - 1) * HELIX_CARD_STEP;
const HELIX_BASE_ANGLE = HELIX_CENTER;
const HELIX_GUIDE_GAP = 0.24;
const GUIDE_POINTS = 96;
// Scroll fraction where the helix rotation completes; past it the canvas
// fades out and the DOM gallery grid below takes over as the finale.
const HELIX_END = 0.86;

type CardScratch = {
  helixPosition: THREE.Vector3;
  helixRotation: THREE.Euler;
  initialized: boolean;
};

export function HelixGallerySection({
  images,
  containerRef,
}: {
  images: GalleryImage[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(0);
  const [wideLayout, setWideLayout] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const cards = useMemo(() => images.slice(0, CARD_COUNT), [images]);

  useEffect(() => {
    const width = window.matchMedia('(min-width: 768px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setWideLayout(width.matches);
      setReducedMotion(motion.matches);
    };
    update();
    width.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      width.removeEventListener('change', update);
      motion.removeEventListener('change', update);
    };
  }, []);

  useLayoutEffect(() => {
    const scroller = containerRef.current;
    const section = sectionRef.current;
    if (!scroller || !section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      scroller,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.9,
      invalidateOnRefresh: true,
      onUpdate: (self) => setProgress(self.progress),
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('resize', refresh);
    refresh();
    return () => {
      window.removeEventListener('resize', refresh);
      trigger.kill();
    };
  }, [containerRef]);

  // The canvas hides as the helix finishes, and the DOM grid fades in on top
  // of the same pinned viewport — no second section. The grid waits until the
  // canvas is fully gone so the two never show at once.
  const canvasFade = 1 - clamp((progress - HELIX_END) / 0.05);
  const gridShown = progress > HELIX_END + 0.05;

  // Split headline converges over the first quarter of the scroll — left line
  // arrives from the left, right line from the right. Scrub-tied, so it eases
  // with the same inertia as the helix.
  const headlineSpread = reducedMotion ? 0 : 1 - clamp(progress / 0.22);

  // Paged instead of scrolled: a full-width page of tiles always fits the
  // pinned viewport (4×2 desktop, 2×2 mobile), so there is never an inner
  // scrollbar competing with the page's own.
  const pageSize = wideLayout ? 8 : 6;
  const pageCount = Math.max(1, Math.ceil(images.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const tiles = images.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const remainingCount = images.length - (currentPage + 1) * pageSize;
  const onLastPage = currentPage >= pageCount - 1;

  return (
    <>
      <section ref={sectionRef} id="more-work" className="relative h-[400svh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#08090d]">
          {/* Section-local backdrop: near-black wash over the global starfield
              with one soft, off-prominent blue glow behind the helix centre. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute left-1/2 top-1/2 size-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,104,215,0.14),rgba(76,104,215,0.05)_45%,transparent_70%)] blur-2xl" />
            <div className="absolute left-1/2 top-1/2 size-[26vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(132,156,255,0.08),transparent_70%)] blur-xl" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
            Screens from shipped work
            <br />
            clients, products, experiments.
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 select-none px-4 sm:px-8">
            {/* word-spacing offsets the negative tracking, which otherwise
                swallows the gaps ("MORETHINGS"); nowrap + a lower clamp floor
                keep each line single on phones. */}
            <div
              className="whitespace-nowrap text-[clamp(2.75rem,12vw,11rem)] font-light leading-[0.82] tracking-[-0.06em] text-white/[0.13] will-change-transform [word-spacing:0.18em]"
              style={{ transform: `translate3d(${(-headlineSpread * 14).toFixed(2)}vw,0,0)` }}
            >
              MORE THINGS
            </div>
            <div
              className="whitespace-nowrap text-right text-[clamp(2.75rem,12vw,11rem)] font-light leading-[0.82] tracking-[-0.06em] text-white/[0.13] will-change-transform [word-spacing:0.18em]"
              style={{ transform: `translate3d(${(headlineSpread * 14).toFixed(2)}vw,0,0)` }}
            >
              I&apos;VE BUILT
            </div>
          </div>
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.15, CAMERA_Z], fov: 34 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            className="absolute inset-0 z-20"
            style={{ opacity: canvasFade }}
            aria-label="Interactive three-dimensional gallery of project screens"
          >
            <HelixScene cards={cards} progress={progress} />
            <Preload all />
          </Canvas>
          {/* The finale, inside the same pinned viewport. Paged, not scrolled:
              each page of tiles fits the viewport whole, and View more flips
              to the next page — no inner scrollbar next to the page's own. */}
          <div
            className={`absolute inset-0 z-[25] flex items-center justify-center transition-opacity duration-500 ${
              gridShown ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* Mount-gated so the stagger replays every time the grid appears,
                not just once at page load. */}
            {gridShown && (
              <div className="w-[94vw]">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  {tiles.map((image, index) => (
                    <div
                      key={`${currentPage}-${image.src}-${index}`}
                      className="animate-[tile-in_0.55s_ease-out_both] will-change-transform motion-reduce:animate-none"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <GalleryTile image={image} />
                    </div>
                  ))}
                </div>
                {pageCount > 1 && (
                  <div
                    className="mt-5 flex animate-[tile-in_0.5s_ease-out_both] items-center justify-center gap-4 motion-reduce:animate-none"
                    style={{ animationDelay: `${tiles.length * 60 + 120}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => setPage(onLastPage ? 0 : currentPage + 1)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/[0.09] bg-[#0d0f14]/80 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65 backdrop-blur-xl transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      {onLastPage ? 'Back to first' : `View more (${remainingCount})`}
                      {onLastPage ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    </button>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      {currentPage + 1} / {pageCount}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-7 z-30 flex items-end justify-between gap-6 px-5 sm:px-10">
            <p className="max-w-[17rem] text-xs leading-5 text-white/50 sm:text-sm sm:leading-6">
              Dashboards, storefronts, and product sites — each taken from brief to production.
            </p>
            
          </div>
        </div>
      </section>
    </>
  );
}

function GalleryTile({ image }: { image: GalleryImage }) {
  const isExternal = image.link ? !image.link.startsWith('/') : false;
  const tileClass =
    'group relative block aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-[#0d0f14]';
  const content = (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 767px) 46vw, 23vw"
        className="object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      {image.link && (
        <span className="absolute right-2.5 top-2.5 z-10 inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition duration-300 md:opacity-0 md:group-hover:-translate-y-0.5 md:group-hover:translate-x-0.5 md:group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      )}
      {/* Bottom overlay: what the screen is. Always visible on touch layouts
          (no hover there), revealed on hover/focus for pointer users. */}
      {(image.title || image.sub) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-2.5 pt-8 transition duration-300 md:px-4 md:pb-3.5 md:pt-12 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          {image.title && (
            <p className="line-clamp-2 text-xs font-semibold leading-snug text-white md:text-base">{image.title}</p>
          )}
          {image.sub && (
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 md:mt-1 md:text-[11px]">
              {image.sub}
            </p>
          )}
        </div>
      )}
    </>
  );
  if (image.link) {
    return (
      <a
        href={image.link}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer' : undefined}
        aria-label={image.title || image.alt}
        className={`${tileClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40`}
      >
        {content}
      </a>
    );
  }
  return <div className={tileClass}>{content}</div>;
}

function HelixScene({ cards, progress }: { cards: HelixCardData[]; progress: number }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const { camera, gl, scene, size } = useThree();
  // The layout constants are tuned for landscape. On portrait viewports the
  // front card would be wider than the screen, so scale the whole helix
  // (cards, radius, pitch, guides together) so the front card spans ~80% of
  // the viewport width. Solved from: cardW·s = f·viewW(CAMERA_Z − R·s).
  const helixFit = useMemo(() => {
    const aspect = size.width / size.height;
    if (aspect >= 1) return 1;
    const f = 0.8;
    const k = 2 * Math.tan((34 * Math.PI) / 360) * aspect;
    const cardW = CARD_WIDTH * HELIX_SCALE;
    return Math.min(1, (f * k * CAMERA_Z) / (cardW + HELIX_RADIUS * f * k));
  }, [size.width, size.height]);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionProgress = reducedMotion ? 0 : progress;
  const helixProgress = clamp(motionProgress / HELIX_END);

  useEffect(() => {
    gl.compile(scene, camera);
  }, [camera, gl, scene]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    group.scale.setScalar(helixFit);

    // The band rises through the frame on its own; the exit only recedes it
    // slightly so the hand-off to the DOM grid reads as "moving away".
    const exit = smoothstep(clamp((progress - 0.62) / 0.38));
    // Linear with helixProgress so the drift speed matches the scrub easing —
    // band enters low, is centred mid-scroll, exits high.
    const rise = THREE.MathUtils.lerp(-HELIX_RISE, HELIX_RISE, helixProgress);
    const follow = Math.min(1, delta * 8);

    group.position.y += (rise - 0.9 * exit - group.position.y) * follow;
    group.position.z += (-2.6 * exit - group.position.z) * follow;
    group.rotation.z += (0.08 * exit - group.rotation.z) * follow;

    // Camera stays put apart from a barely-there forward ease — all the
    // motion comes from the helix itself.
    const cameraProgress = smoothstep(clamp(motionProgress / 0.9));
    const targetCameraZ = CAMERA_Z - cameraProgress * 0.7;
    camera.position.x += (0 - camera.position.x) * Math.min(1, delta * 4);
    camera.position.y += (0.15 - camera.position.y) * Math.min(1, delta * 4);
    camera.position.z += (targetCameraZ - camera.position.z) * Math.min(1, delta * 4);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <HelixGuides progress={motionProgress} />
      {cards.map((card, index) => (
        <HelixCard
          key={`${card.src}-${index}`}
          card={card}
          index={index}
          helixProgress={helixProgress}
          hovered={hovered === index}
          onHover={() => setHovered(index)}
          onLeave={() => setHovered(null)}
        />
      ))}
    </group>
  );
}

function HelixCard({
  card,
  index,
  helixProgress,
  hovered,
  onHover,
  onLeave,
}: {
  card: HelixCardData;
  index: number;
  helixProgress: number;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const texture = useMemo(() => {
    const loaded = new THREE.TextureLoader().load(card.src);
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.minFilter = THREE.LinearMipmapLinearFilter;
    loaded.magFilter = THREE.LinearFilter;
    return loaded;
  }, [card.src]);
  const scratch = useMemo<CardScratch>(() => ({
    helixPosition: new THREE.Vector3(),
    helixRotation: new THREE.Euler(),
    initialized: false,
  }), []);
  const reveal = 1;

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // + progress: angle grows, so cards travel right→left across the front
    // and climb (y follows angle), matching the reference. The angular step
    // between neighbours is constant, so spacing can never compress.
    const phase = HELIX_BASE_ANGLE - index * HELIX_CARD_STEP + helixProgress * HELIX_TURNS;
    writeHelixTransform(phase, scratch.helixPosition, scratch.helixRotation);

    const follow = Math.min(1, delta * 10);
    if (!scratch.initialized) {
      scratch.initialized = true;
      mesh.position.copy(scratch.helixPosition);
      mesh.rotation.copy(scratch.helixRotation);
      mesh.scale.setScalar(HELIX_SCALE);
    }
    mesh.position.lerp(scratch.helixPosition, follow);
    mesh.rotation.x += (scratch.helixRotation.x - mesh.rotation.x) * follow;
    mesh.rotation.y += (scratch.helixRotation.y - mesh.rotation.y) * follow;
    mesh.rotation.z += (scratch.helixRotation.z - mesh.rotation.z) * follow;

    // No artificial depth scale: perspective already shrinks far cards, and a
    // scale >1 at the front made cards wider than the chord to their
    // neighbour — that was the source of the intersections.
    const targetScale = HELIX_SCALE * (hovered ? 1.12 : 1);
    mesh.scale.x += (targetScale - mesh.scale.x) * 0.15;
    mesh.scale.y = mesh.scale.x;
    mesh.scale.z = mesh.scale.x;
  });

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh
      ref={meshRef}
      frustumCulled={false}
      userData={{ isHelixCard: true }}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover();
      }}
      onPointerOut={onLeave}
    >
      <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT, 32, 10]} />
      <BendingImageMaterial texture={texture} hovered={hovered} reveal={reveal} />
    </mesh>
  );
}

function BendingImageMaterial({
  texture,
  hovered,
  reveal,
}: {
  texture: THREE.Texture;
  hovered: boolean;
  reveal: number;
}) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    // FrontSide: far-side cards face away and cull themselves — otherwise
    // their backs show through the gaps with mirrored content.
    side: THREE.FrontSide,
    depthWrite: true,
    uniforms: {
      uMap: { value: texture },
      uRadius: { value: 0.03 },
      uBend: { value: 0.12 },
      uCardWidth: { value: CARD_WIDTH },
      uHover: { value: 0 },
      uReveal: { value: 0 },
    },
    vertexShader: `
      uniform float uBend;
      uniform float uCardWidth;
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vec3 transformed = position;
        float normalizedX = position.x / uCardWidth;
        transformed.z += normalizedX * normalizedX * uBend;
        transformed.y += sin(normalizedX * 3.14159) * uBend * 0.035;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uRadius;
      uniform float uHover;
      uniform float uReveal;
      varying vec2 vUv;
      float roundedBox(vec2 p, vec2 b, float r){
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }
      void main(){
        float distanceToEdge = roundedBox(vUv - 0.5, vec2(0.5 - uRadius), uRadius);
        float antiAlias = max(fwidth(distanceToEdge), 0.0001);
        float roundedAlpha = 1.0 - smoothstep(0.0, antiAlias, distanceToEdge);
        float revealAlpha = smoothstep(0.35, 0.86, uReveal);
        if (roundedAlpha <= 0.001 || revealAlpha <= 0.001) discard;
        vec4 color = texture2D(uMap, vUv);
        color.rgb += uHover * 0.07;
        color.a *= roundedAlpha * revealAlpha * 0.985;
        gl_FragColor = color;
      }
    `,
  }), [texture]);

  useFrame((_, delta) => {
    material.uniforms.uHover.value += (Number(hovered) - material.uniforms.uHover.value) * Math.min(1, delta * 10);
    material.uniforms.uReveal.value += (reveal - material.uniforms.uReveal.value) * Math.min(1, delta * 12);
  });

  return <primitive object={material} attach="material" />;
}

function HelixGuides({ progress }: { progress: number }) {
  const drawProgress = smoothstep(clamp(progress / HELIX_END));
  // Same sign and clamp as the cards — the guides are welded to the helix.
  const phase = clamp(progress / HELIX_END) * HELIX_TURNS;
  const guidePoints = useMemo(() => {
    const totalSpan = (CARD_COUNT - 1) * HELIX_CARD_STEP;
    const pointCount = Math.max(2, Math.floor((0.12 + drawProgress * 0.88) * GUIDE_POINTS));
    return [-1, 1].map((side) => Array.from({ length: pointCount }, (_, index) => {
      const t = index / Math.max(1, pointCount - 1);
      const angle = HELIX_BASE_ANGLE - t * totalSpan + phase;
      const radius = HELIX_RADIUS + side * HELIX_GUIDE_GAP;
      const position = new THREE.Vector3(
        radius * Math.cos(angle),
        (angle - HELIX_CENTER) * HELIX_PITCH,
        radius * Math.sin(angle),
      );
      return [position.x, position.y, position.z] as [number, number, number];
    }));
  }, [drawProgress, phase]);

  return (
    <group>
      {guidePoints.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#c9c9d2"
          transparent
          opacity={0.24}
          lineWidth={0.7}
          dashed
          dashSize={0.18}
          gapSize={0.16}
          dashOffset={progress * 3.5}
        />
      ))}
    </group>
  );
}

function writeHelixTransform(angle: number, position: THREE.Vector3, rotation: THREE.Euler) {
  position.set(
    HELIX_RADIUS * Math.cos(angle),
    (angle - HELIX_CENTER) * HELIX_PITCH,
    HELIX_RADIUS * Math.sin(angle),
  );
  rotation.set(0, Math.PI / 2 - angle, -0.08);
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}
