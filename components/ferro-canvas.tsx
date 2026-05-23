'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GRID = 48;

export function FerroCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, active: false, lastMove: 0 });

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({
      antialias: !prefersReduced,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
    renderer.setSize(el.clientWidth || 900, el.clientHeight || 640);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, (el.clientWidth || 900) / (el.clientHeight || 640), 0.1, 100);
    camera.position.set(0, -1.85, 2.85);
    camera.lookAt(0, 0.12, 0);

    const geo = new THREE.PlaneGeometry(6.4, 6.4, GRID - 1, GRID - 1);
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0.18, 0.105, 0.055),
      emissive: new THREE.Color(0.12, 0.045, 0.02),
      specular: new THREE.Color(1, 0.58, 0.34),
      shininess: 620,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -0.08;
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1, 0.48, 0.18),
      transparent: true,
      opacity: 0.2,
      wireframe: true,
      depthWrite: false,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    wire.rotation.copy(mesh.rotation);
    wire.position.z = 0.012;
    scene.add(wire);

    scene.add(new THREE.AmbientLight(0x1e2608, 4.8));

    const lime = new THREE.PointLight(0xff7a2f, 18, 9.4);
    lime.position.set(0.1, -0.4, 2.2);
    scene.add(lime);

    const key = new THREE.DirectionalLight(0xfff8c8, 2.8);
    key.position.set(2, 2, 5);
    scene.add(key);

    const rim = new THREE.PointLight(0x5b7cff, 2.8, 9);
    rim.position.set(-3, -3, 2);
    scene.add(rim);

    const fill = new THREE.PointLight(0xffffff, 0.9, 12);
    fill.position.set(0, 4, 4);
    scene.add(fill);

    const heights = new Float32Array(GRID * GRID);
    const velocities = new Float32Array(GRID * GRID);
    let currentPointer = { x: 0.5, y: 0.5 };

    const applyForce = (row: number, col: number, strength: number, radius: number) => {
      const radiusSq = 2 * radius * radius;
      const rr = Math.max(1, Math.min(GRID - 2, Math.round(row)));
      const cc = Math.max(1, Math.min(GRID - 2, Math.round(col)));
      for (let i = 0; i < GRID; i++) {
        for (let j = 0; j < GRID; j++) {
          const d = (i - rr) ** 2 + (j - cc) ** 2;
          velocities[i * GRID + j] += strength * Math.exp(-d / radiusSq);
        }
      }
    };

    const offsets: Array<[number, number, number, number]> = [[0, 0, 1, 3.4]];
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      offsets.push([9 * Math.sin(a), 9 * Math.cos(a), 0.42, 2.3]);
    }

    const step = () => {
      for (let i = 1; i < GRID - 1; i++) {
        for (let j = 1; j < GRID - 1; j++) {
          const k = i * GRID + j;
          const lap =
            heights[(i - 1) * GRID + j] +
            heights[(i + 1) * GRID + j] +
            heights[i * GRID + j - 1] +
            heights[i * GRID + j + 1] -
            4 * heights[k];
          velocities[k] = (velocities[k] + lap * 0.023) * 0.989;
          heights[k] += velocities[k];
        }
      }
      for (let k = 0; k < GRID; k++) {
        heights[k] = heights[(GRID - 1) * GRID + k] = heights[k * GRID] = heights[k * GRID + GRID - 1] = 0;
        velocities[k] = velocities[(GRID - 1) * GRID + k] = velocities[k * GRID] = velocities[k * GRID + GRID - 1] = 0;
      }
    };

    let raf = 0;
    let frame = 0;
    let previousRow = -99;
    let previousCol = -99;

    [
      [GRID * 0.5, GRID * 0.5, 0.32, 4.5],
      [GRID * 0.35, GRID * 0.42, 0.16, 3.2],
      [GRID * 0.62, GRID * 0.57, 0.14, 3.4],
    ].forEach(([row, col, strength, radius]) => applyForce(row, col, strength, radius));

    const upload = () => {
      const pos = geo.attributes.position;
      for (let i = 0; i < GRID; i++) {
        for (let j = 0; j < GRID; j++) {
          const x = j / (GRID - 1);
          const y = i / (GRID - 1);
          const dx = x - currentPointer.x;
          const dy = y - currentPointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const traveling = Math.sin(j * 0.34 + frame * 0.06) * 0.085 + Math.cos(i * 0.29 - frame * 0.052) * 0.07;
          const magneticLift = Math.max(0, 1 - dist * 4.4) ** 2 * 0.38;
          pos.setZ(i * GRID + j, heights[i * GRID + j] * 1.35 + traveling + magneticLift);
        }
      }
      pos.needsUpdate = true;
      if (frame % 2 === 0) geo.computeVertexNormals();
    };

    const animate = () => {
      raf = window.requestAnimationFrame(animate);
      if (!active || document.hidden) return;
      frame++;
      const now = performance.now();
      const useMouse = mouse.current.active && now - mouse.current.lastMove < 1400;
      const pointerX = useMouse ? mouse.current.x : 0.5 + Math.cos(frame * 0.018) * 0.18 + Math.sin(frame * 0.007) * 0.06;
      const pointerY = useMouse ? mouse.current.y : 0.5 + Math.sin(frame * 0.016) * 0.18;
      currentPointer = { x: pointerX, y: pointerY };

      const row = Math.round(pointerY * (GRID - 1));
      const col = Math.round(pointerX * (GRID - 1));
      if (Math.abs(row - previousRow) + Math.abs(col - previousCol) > 1) {
        offsets.forEach(([dr, dc, strength, radius]) => applyForce(row + dr, col + dc, strength * (useMouse ? 0.135 : 0.075), radius));
        previousRow = row;
        previousCol = col;
      }

      if (frame % 10 === 0) {
        const t = frame * 0.026;
        applyForce(GRID * (0.5 + Math.sin(t * 0.9) * 0.22), GRID * (0.5 + Math.cos(t * 1.13) * 0.24), 0.028, 3.1);
      }

      step();
      upload();
      mesh.rotation.z = Math.sin(frame * 0.004) * 0.025;
      wire.rotation.z = mesh.rotation.z;
      wireMat.opacity = 0.162 + Math.max(0, Math.sin(frame * 0.018)) * 0.072;
      lime.intensity = 15 + Math.sin(frame * 0.02) * 3;
      renderer.render(scene, camera);
    };
    let active = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '25% 0px 25% 0px' },
    );
    observer.observe(el);
    animate();

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = (event.clientX - rect.left) / rect.width;
      mouse.current.y = (event.clientY - rect.top) / rect.height;
      mouse.current.active = true;
      mouse.current.lastMove = performance.now();
    };
    const onLeave = () => {
      mouse.current.active = false;
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    const resizeObserver = new ResizeObserver(() => {
      const width = el.clientWidth || 900;
      const height = el.clientHeight || 640;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      resizeObserver.disconnect();
      geo.dispose();
      mat.dispose();
      wireMat.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
