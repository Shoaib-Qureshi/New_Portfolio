'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/content-types';
import styles from './helix-gallery.module.css';

gsap.registerPlugin(ScrollTrigger);

const COUNT = 9;
const PAGE_SIZE = 6;
const RADIUS = 9;
const CARD_WIDTH = 4.6;
const CARD_HEIGHT = 3.22;
const STEP = 0.56;
const CAMERA_Z = 20;
// One fixed, rising track: a card enters on the lower rear turn, passes
// across the camera, then recedes along the upper turn. Scroll advances
// each card along that track; it never lifts or scales the whole ribbon.
const MID = Math.PI * 2.5;
const PATH_START = 4.1;
const PATH_END = Math.PI * 3.5;
const PITCH = 1.7;
const HELIX_END = 0.77;
const SEGMENTS = 40;
const GUIDE_POINTS = 240;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = THREE.MathUtils.lerp;

type Card = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  texture: THREE.Texture;
  hover: number;
  unfold: number;
  ripple: number;
  target: { x: number; y: number; width: number; height: number };
};

export function HelixGallerySection({ images, containerRef }: {
  images: GalleryImage[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const gridVisible = useRef(false);
  const [gridShown, setGridShown] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [page, setPage] = useState(0);
  const staticLayout = reducedMotion === true || unavailable;
  const pageCount = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const tiles = images.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // Keep the existing fixed navigation legible over this light section.
    const observer = new IntersectionObserver(([entry]) => {
      section.dataset.inView = String(entry.isIntersecting);
    }, { root: containerRef.current, rootMargin: '-3% 0px -90% 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    const scroller = containerRef.current;
    if (!section || !stage || !canvas || !grid || !scroller || reducedMotion === null || staticLayout || !images.length) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setUnavailable(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.z = CAMERA_Z;
    const pointer = new THREE.Vector2(-10, -10);
    const raycaster = new THREE.Raycaster();
    const loader = new THREE.TextureLoader();
    const cards: Card[] = [];
    let disposed = false;
    let active = false;
    let ticking = false;
    let dirty = true;
    let progress = 0;
    let hovered = -1;
    let lastTime = 0;
    let width = 1;
    let height = 1;
    let worldWidth = 1;
    let worldHeight = 1;
    let fit = 1;
    let pointerActive = false;
    let rippleTime = 0;

    const wake = () => {
      dirty = true;
      if (!ticking && active && !document.hidden && !disposed) {
        ticking = true;
        gsap.ticker.add(tick);
      }
    };

    images.slice(0, COUNT).forEach((image) => {
      const texture = loader.load(image.src, (loaded) => {
        if (disposed) { loaded.dispose(); return; }
        const card = cards.find((entry) => entry.texture === loaded);
        if (card) {
          const aspect = loaded.image.width / loaded.image.height;
          const frameAspect = CARD_WIDTH / CARD_HEIGHT;
          card.mesh.material.uniforms.uCrop.value.set(Math.min(1, frameAspect / aspect), Math.min(1, aspect / frameAspect));
        }
        renderer.initTexture(loaded);
        wake();
      }, undefined, () => { if (!disposed) setUnavailable(true); });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
          uMap: { value: texture },
          uCrop: { value: new THREE.Vector2(1, 1) },
          uOpacity: { value: 1 },
          uHover: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uMap;
          uniform vec2 uCrop;
          uniform float uOpacity;
          uniform float uHover;
          varying vec2 vUv;
          void main() {
            vec2 p = (vUv - 0.5) * vec2(1.428571, 1.0);
            vec2 q = abs(p) - vec2(0.7142855, 0.5) + 0.018;
            float d = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - 0.018;
            float alpha = (1.0 - smoothstep(-fwidth(d), fwidth(d), d)) * uOpacity;
            if (alpha < 0.01) discard;
            vec2 imageUv = vUv;
            if (!gl_FrontFacing) imageUv.x = 1.0 - imageUv.x;
            vec3 color = texture2D(uMap, (imageUv - 0.5) * uCrop + 0.5).rgb;
            gl_FragColor = vec4(color * (1.0 + uHover * 0.04), alpha);
            #include <colorspace_fragment>
          }
        `,
      });
      const geometry = new THREE.PlaneGeometry(1, 1, SEGMENTS, 8);
      (geometry.attributes.position as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);
      cards.push({ mesh, texture, hover: 1, unfold: 0, ripple: 0, target: { x: 0, y: 0, width: 1, height: 1 } });
    });

    const guides = [-1, 1].map((side) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(GUIDE_POINTS * 3), 3).setUsage(THREE.DynamicDrawUsage));
      const material = new THREE.LineBasicMaterial({ color: '#656560', transparent: true, opacity: 0.32, depthWrite: false });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      scene.add(line);
      return { line, side };
    });

    // Both rails and every card vertex use this same curve, so the ribbon
    // bends continuously. No per-frame vectors or independently eased cards.
    const helixPoint = (angle: number, vertical: number, out: THREE.BufferAttribute, index: number) => {
      const dip = 0.85 * Math.exp(-Math.pow((angle - MID) / 0.8, 2));
      const x = RADIUS * Math.cos(angle);
      const y = (angle - MID) * PITCH - dip + vertical;
      const tilt = -0.12;
      out.setXYZ(index,
        (x * Math.cos(tilt) - y * Math.sin(tilt)) * fit,
        (x * Math.sin(tilt) + y * Math.cos(tilt) + 0.4) * fit,
        RADIUS * Math.sin(angle) * fit,
      );
    };

    const paint = (dt: number) => {
      const travel = clamp(progress / HELIX_END);
      // Spend more of the scroll on the close pass. This smooth, monotonic
      // driver keeps the rear entry/exit brief without pausing or resetting.
      const advance = travel + 0.12 * Math.sin(travel * Math.PI * 2);
      const phase = advance * (PATH_END - PATH_START + (cards.length - 1) * STEP);
      const follow = 1 - Math.exp(-dt * 12);
      let settling = false;
      let rippling = false;
      rippleTime += dt;

      cards.forEach((card, index) => {
        const unfold = smooth((progress - 0.77 - (index % PAGE_SIZE) * 0.012) / 0.135);
        card.ripple = Math.min(0.16, card.ripple + Math.abs(unfold - card.unfold) * 0.5) * Math.exp(-dt * 8);
        card.unfold = unfold;
        if (card.ripple > 0.002 && index < PAGE_SIZE) { rippling = true; settling = true; }
        const hoverTarget = index === hovered && progress < 0.78 ? 1.12 : 1;
        card.hover = mix(card.hover, hoverTarget, follow);
        if (Math.abs(card.hover - hoverTarget) > 0.0005) settling = true;
        const positions = card.mesh.geometry.attributes.position as THREE.BufferAttribute;
        const uv = card.mesh.geometry.attributes.uv;
        const center = PATH_START - index * STEP + phase;
        for (let vertex = 0; vertex < positions.count; vertex++) {
          const u = uv.getX(vertex) - 0.5;
          const v = uv.getY(vertex) - 0.5;
          const angle = center - u * CARD_WIDTH * card.hover / RADIUS;
          helixPoint(angle, v * CARD_HEIGHT * card.hover, positions, vertex);
          if (index < PAGE_SIZE) {
            const ripple = Math.sin(u * 8 + v * 5 - rippleTime * 12 + index * 0.7) * card.ripple * Math.cos(v * Math.PI);
            positions.setXYZ(vertex,
              mix(positions.getX(vertex), card.target.x + u * card.target.width, unfold),
              mix(positions.getY(vertex), card.target.y + v * card.target.height, unfold),
              mix(positions.getZ(vertex), 0, unfold) + ripple,
            );
          }
        }
        positions.needsUpdate = true;
        card.mesh.geometry.computeBoundingSphere();
        card.mesh.material.uniforms.uHover.value = (card.hover - 1) / 0.12;
        card.mesh.material.uniforms.uOpacity.value = index < PAGE_SIZE ? 1 : 1 - smooth((progress - 0.77) / 0.1);
        card.mesh.visible = card.mesh.material.uniforms.uOpacity.value > 0.001;
      });

      guides.forEach(({ line, side }) => {
        const positions = line.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < GUIDE_POINTS; i++) {
          const angle = PATH_START + STEP * 0.6 - (i / (GUIDE_POINTS - 1)) * (cards.length * STEP + 0.65) + phase;
          helixPoint(angle, side * (CARD_HEIGHT / 2 + 0.16), positions, i);
        }
        positions.needsUpdate = true;
        line.material.opacity = 0.3 * (1 - smooth((progress - 0.73) / 0.12));
      });

      if (pointerActive && progress < 0.92) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(cards.filter(c => c.mesh.visible).map(c => c.mesh), false)[0];
        const next = hit ? cards.findIndex(c => c.mesh === hit.object) : -1;
        if (next !== hovered) { hovered = next; settling = true; }
      } else if (hovered !== -1) { hovered = -1; settling = true; }
      canvas.style.cursor = hovered >= 0 && images[hovered]?.link ? 'pointer' : 'default';

      const spread = smooth((progress - 0.59) / 0.22);
      const headline = headlineRef.current;
      if (headline) {
        (headline.children[0] as HTMLElement).style.transform = `translate3d(${-spread * width * 0.68}px,0,0)`;
        (headline.children[1] as HTMLElement).style.transform = `translate3d(${spread * width * 0.68}px,0,0)`;
        headline.style.opacity = String(1 - smooth((progress - 0.72) / 0.1));
      }
      if (kickerRef.current) kickerRef.current.style.opacity = String(1 - smooth((progress - 0.73) / 0.09));
      const showGrid = progress >= 0.98 && !rippling;
      if (gridVisible.current !== showGrid) {
        gridVisible.current = showGrid;
        // The DOM tiles occupy the exact projected mesh bounds. Swap only
        // after every vertex has arrived; scrolling back restores the mesh.
        if (!showGrid) setPage(0);
        setGridShown(showGrid);
      }
      stage.dataset.phase = showGrid ? 'grid' : progress >= 0.77 ? 'unfold' : 'helix';
      renderer.render(scene, camera);
      return settling;
    };

    function tick(time: number) {
      if (!active || document.hidden || disposed) {
        gsap.ticker.remove(tick);
        ticking = false;
        return;
      }
      const dt = Math.min(0.05, Math.max(1 / 120, time - lastTime));
      lastTime = time;
      const settling = paint(dt);
      if (!settling && !dirty) {
        gsap.ticker.remove(tick);
        ticking = false;
      }
      dirty = false;
    }

    const resize = () => {
      width = stage.clientWidth;
      height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(17)) * CAMERA_Z;
      worldWidth = worldHeight * camera.aspect;
      const k = 2 * Math.tan(THREE.MathUtils.degToRad(17)) * camera.aspect;
      fit = Math.min(1, (0.85 * k * CAMERA_Z) / (CARD_WIDTH + RADIUS * 0.85 * k));
      const stageBounds = stage.getBoundingClientRect();
      const targets = grid.querySelectorAll<HTMLElement>('[data-gallery-tile]');
      cards.forEach((card, index) => {
        const bounds = targets[index % PAGE_SIZE]?.getBoundingClientRect();
        if (!bounds) return;
        card.target = {
          x: ((bounds.left - stageBounds.left + bounds.width / 2) / width - 0.5) * worldWidth,
          y: (0.5 - (bounds.top - stageBounds.top + bounds.height / 2) / height) * worldHeight,
          width: bounds.width / width * worldWidth,
          height: bounds.height / height * worldHeight,
        };
      });
      wake();
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      scroller,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: self => { progress = self.progress; wake(); },
      onRefresh: self => { progress = self.progress; resize(); },
    });
    triggerRef.current = trigger;
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) wake();
    }, { root: scroller, rootMargin: '100% 0px' });
    observer.observe(section);
    const resizer = new ResizeObserver(() => { resize(); trigger.refresh(); });
    resizer.observe(stage);
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / width) * 2 - 1, 1 - ((event.clientY - rect.top) / height) * 2);
      pointerActive = true;
      wake();
    };
    const onPointerLeave = () => { pointerActive = false; wake(); };
    const onClick = () => {
      const link = images[hovered]?.link;
      if (!link || progress >= 0.98) return;
      if (link.startsWith('/')) window.location.assign(link);
      else if (/^https?:\/\//i.test(link)) window.open(link, '_blank', 'noopener,noreferrer');
    };
    const onVisibility = () => { if (!document.hidden) wake(); };
    const onContextLost = (event: Event) => { event.preventDefault(); setUnavailable(true); };
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', onVisibility);
    resize();
    renderer.compile(scene, camera);
    paint(1 / 60);
    ScrollTrigger.refresh();

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      trigger.kill();
      triggerRef.current = null;
      observer.disconnect();
      resizer.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      cards.forEach(({ mesh, texture }) => { mesh.geometry.dispose(); mesh.material.dispose(); texture.dispose(); });
      guides.forEach(({ line }) => { line.geometry.dispose(); line.material.dispose(); });
      renderer.dispose();
    };
  }, [images, containerRef, reducedMotion, staticLayout]);

  const browse = () => {
    const trigger = triggerRef.current;
    if (!trigger || !containerRef.current) return;
    containerRef.current.scrollTop = trigger.end - 1;
    ScrollTrigger.update();
  };

  if (!images.length) return null;
  const visible = staticLayout || gridShown;
  return (
    <section ref={sectionRef} id="more-work" aria-label="More things I've built" className={`${styles.section} ${staticLayout ? styles.static : ''}`}>
      <div ref={stageRef} className={styles.stage} data-phase={visible ? 'grid' : 'helix'}>
        <h2 ref={headlineRef} className={styles.headline}>
          <span>MORE THINGS</span>
          <span>I&apos;VE BUILT</span>
        </h2>
        <p ref={kickerRef} className={styles.kicker}>EXPLORING IDEAS THROUGH<br />CRAFT AND CODE.</p>
        {!staticLayout && <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" style={{ visibility: gridShown ? 'hidden' : 'visible' }} />}
        <div ref={gridRef} className={styles.grid} aria-hidden={!visible} inert={!visible} style={{ visibility: visible ? 'visible' : 'hidden' }}>
          {tiles.map((image, index) => <GalleryTile key={`${currentPage}-${index}-${image.src}`} image={image} />)}
        </div>
        <div className={styles.footer}>
          <p>Dashboards, storefronts, and product sites.<br />Ideas taken from brief to production.</p>
          {visible ? (
            <div className={styles.pagination}>
              {pageCount > 1 && <>
                <button type="button" onClick={() => setPage((currentPage - 1 + pageCount) % pageCount)} aria-label="Previous gallery page"><ArrowLeft size={16} /></button>
                <span aria-live="polite">{String(currentPage + 1).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}</span>
                <button type="button" onClick={() => setPage((currentPage + 1) % pageCount)} aria-label="Next gallery page"><ArrowRight size={16} /></button>
              </>}
            </div>
          ) : <button type="button" className={styles.browse} onClick={browse}>VIEW ALL WORK <ArrowUpRight size={17} /></button>}
        </div>
        {!visible && <div className={styles.scrollHint} aria-hidden="true"><ArrowDown size={13} /> SCROLL TO EXPLORE</div>}
      </div>
    </section>
  );
}

function GalleryTile({ image }: { image: GalleryImage }) {
  const content = <>
    {/* Native images share the canvas texture URL and crop, avoiding a visible
        texture change when the final 3D frame becomes keyboard-accessible. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
    <div className={styles.caption}><span>{image.title || image.alt}</span>{image.link && <ArrowUpRight size={19} />}</div>
  </>;
  return image.link ? <a data-gallery-tile href={image.link} target={image.link.startsWith('/') ? undefined : '_blank'} rel={image.link.startsWith('/') ? undefined : 'noreferrer'} className={styles.tile}>{content}</a>
    : <div data-gallery-tile className={styles.tile}>{content}</div>;
}
