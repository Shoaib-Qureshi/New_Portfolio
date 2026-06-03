'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroInteractiveField() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef({ x: 0, y: 0, scroll: 0, active: false });

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Bail out if WebGL is unavailable (older Android, some mobile browsers)
    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl') && !probe.getContext('experimental-webgl')) return;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 800 : 3600;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !prefersReduced && !isMobile,
        alpha: true,
        powerPreference: isMobile ? 'low-power' : 'high-performance',
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(el.clientWidth || 1200, el.clientHeight || 760);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.03);

    const camera = new THREE.PerspectiveCamera(
      36,
      (el.clientWidth || 1200) / (el.clientHeight || 760),
      0.1,
      100,
    );
    camera.position.set(0, 0, 9);

    const rig = new THREE.Group();
    scene.add(rig);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targets = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT * 4);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color();
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ratio = i / (PARTICLE_COUNT - 1);
      const shell = i % 5;
      const signed = ratio * 2 - 1;
      const angle = i * golden + Math.sin(ratio * Math.PI * 8) * 0.18;
      const band = Math.sin(ratio * Math.PI * 2.8);
      const fold = Math.sign(signed) * Math.pow(Math.abs(signed), 0.58);
      const radius = 0.68 + Math.pow(Math.sin(ratio * Math.PI), 0.22) * 3.1 + shell * 0.052;
      const pinch = 1 - Math.abs(fold) * 0.28;

      const x = Math.cos(angle) * radius * pinch + fold * 1.86;
      const y = Math.sin(angle) * radius * 0.42 + band * 1.15;
      const z = Math.sin(angle * 1.8 + ratio * 11) * 0.58 + shell * 0.085 - 0.22;

      targets[i * 3] = x;
      targets[i * 3 + 1] = y;
      targets[i * 3 + 2] = z;
      positions[i * 3] = x + (Math.random() - 0.5) * 0.18;
      positions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.18;
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * 0.42;

      seeds[i * 4] = ratio;
      seeds[i * 4 + 1] = angle;
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = shell;

      const warmBias = Math.max(0, Math.sin(ratio * Math.PI * 7 + shell) * 0.5 + 0.5);
      color.setHSL(0.095 + warmBias * 0.018, 0.04 + warmBias * 0.12, 0.54 + warmBias * 0.24);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('target', new THREE.BufferAttribute(targets, 3));
    geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
    geometry.setAttribute('particleColor', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intro: { value: 0 },
        pointer: { value: new THREE.Vector2(0, 0) },
        scroll: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute vec3 target;
        attribute vec4 seed;
        attribute vec3 particleColor;
        uniform float time;
        uniform float intro;
        uniform vec2 pointer;
        uniform float scroll;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float r = seed.x;
          float a = seed.y;
          float rnd = seed.z;
          float shell = seed.w;
          float reveal = smoothstep(0.0, 1.0, intro - r * 0.18 + rnd * 0.08);

          vec3 p = mix(position, target, reveal);
          float axisA = sin(time * 0.52 + a) * 0.085;
          float axisB = cos(time * 0.43 + r * 6.283) * 0.066;
          float axisC = sin(time * 0.34 + shell * 1.7) * 0.052;
          float axisD = cos(time * 0.28 + rnd * 6.283) * 0.042;
          float axisE = sin(time * 0.24 + a * 0.45) * 0.036;
          p.x += axisA + axisD + pointer.x * 0.02;
          p.y += axisB + axisE - pointer.y * 0.018;
          p.z += axisC + sin(time * 0.32 + rnd * 6.283) * 0.048;

          float pointerField = exp(-dot(p.xy - pointer * vec2(1.2, -0.8), p.xy - pointer * vec2(1.2, -0.8)) * 0.22);
          p.x += pointer.x * pointerField * 0.12 - scroll * 0.2;
          p.y -= pointer.y * pointerField * 0.09 + scroll * 0.46;
          p.z += pointerField * 0.12 - scroll * (0.14 + r * 0.12);

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          float depth = clamp(1.0 - abs(p.z) * 0.16, 0.18, 1.0);
          float shimmer = 0.7 + 0.3 * sin(time * 0.46 + a * 0.8 + rnd * 3.0);
          gl_PointSize = (0.2 + shimmer * 0.31 + pointerField * 0.2) * (285.0 / -mvPosition.z);
          vColor = particleColor;
          float scrollFade = pow(max(0.0, 1.0 - scroll), 5.0);
          vAlpha = reveal * depth * (0.11 + shimmer * 0.095 + pointerField * 0.035) * scrollFade;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.36) discard;
          float core = smoothstep(0.36, 0.0, d);
          float edge = smoothstep(0.36, 0.24, d);
          gl_FragColor = vec4(vColor * (0.82 + core * 0.36), vAlpha * edge);
        }
      `,
    });

    const particles = new THREE.Points(geometry, material);
    rig.add(particles);

    let raf = 0;
    const startedAt = performance.now();
    let easedX = 0;
    let easedY = 0;
    let easedScroll = 0;
    let intro = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      pointer.current.active = true;
    };
    const onPointerLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);

    const onScrollProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;
      pointer.current.scroll = Math.min(1, Math.max(0, detail?.progress ?? 0));
    };
    window.addEventListener('hero-bubble-scroll', onScrollProgress as EventListener);

    const animate = () => {
      raf = window.requestAnimationFrame(animate);
      const elapsed = (performance.now() - startedAt) / 1000;
      const time = prefersReduced ? 1.2 : elapsed;
      const targetX = pointer.current.active ? pointer.current.x : Math.sin(time * 0.24) * 0.2;
      const targetY = pointer.current.active ? pointer.current.y : Math.cos(time * 0.2) * 0.16;
      easedX += (targetX - easedX) * 0.045;
      easedY += (targetY - easedY) * 0.045;
      easedScroll += (pointer.current.scroll - easedScroll) * 0.075;
      intro += ((prefersReduced ? 1 : Math.min(1, elapsed / 2.1)) - intro) * 0.035;

      const isNarrow = el.clientWidth < 768;
      const scale = isNarrow ? 0.54 : 0.94;
      rig.scale.setScalar(scale);
      rig.position.x = (isNarrow ? 0.26 : 2.08) + easedX * 0.08 - easedScroll * 0.22;
      rig.position.y = (isNarrow ? 1.36 : 0.28) - easedY * 0.065 - easedScroll * 0.92;
      rig.rotation.x = -easedY * 0.028;
      rig.rotation.y = easedX * 0.045 + Math.sin(time * 0.075) * 0.02;
      rig.rotation.z = -0.1 + Math.sin(time * 0.065) * 0.014;

      material.uniforms.time.value = time;
      material.uniforms.intro.value = intro;
      material.uniforms.pointer.value.set(easedX, easedY);
      material.uniforms.scroll.value = easedScroll;

      const shouldRender = !document.hidden && easedScroll < 0.985;
      renderer.domElement.style.visibility = shouldRender ? 'visible' : 'hidden';
      if (shouldRender) renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      const width = el.clientWidth || 1200;
      const height = el.clientHeight || 760;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('hero-bubble-scroll', onScrollProgress as EventListener);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
