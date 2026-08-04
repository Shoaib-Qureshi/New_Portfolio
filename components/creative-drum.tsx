'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface DrumImage {
  src: string;
  alt: string;
}

/**
 * Cards wrapped around a rotating drum, rendered in WebGL.
 *
 * The bend is the reason this isn't CSS: each card is a segmented plane whose
 * vertices are mapped onto the cylinder surface in the vertex shader, so the
 * card genuinely curves. CSS can only rotate a rigid flat rectangle.
 */
export function CreativeDrum({
  images,
  targetRef,
  className,
}: {
  images: DrumImage[];
  targetRef: React.RefObject<number>;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || images.length === 0) return;

    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl') && !probe.getContext('experimental-webgl')) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !narrow, alpha: true, powerPreference: narrow ? 'low-power' : 'high-performance' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const FOV = 45;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 20000);

    // Work in pixel units: put the camera where the z=0 plane spans exactly the
    // viewport height, so card sizes below are real CSS pixels.
    const camDistance = (h: number) => h / 2 / Math.tan((FOV / 2) * (Math.PI / 180));

    // The helix's own rise gives the band its diagonal; only a little extra tilt.
    const TILT = -0.2; // ~11 degrees of lean, as in the reference
    const drum = new THREE.Group();
    drum.rotation.z = TILT;
    scene.add(drum);

    const COUNT = Math.min(images.length, narrow ? 7 : 9);
    // STEP is NOT 2*PI/COUNT. Spreading nine cards over a full revolution puts
    // 40 degrees between them, which reads as scattered planes. The band is a
    // continuous ribbon spanning roughly a half turn, so the step is much finer.
    const STEP = narrow ? 0.28 : 0.2; // radians between neighbouring cards
    // Gap between neighbours. At 0.92 the cards abut and the band reads as one
    // continuous ribbon instead of nine separate cards.
    const SPAN = STEP * 0.78;
    // Centre the ribbon on the near point so the middle faces the camera and
    // both ends turn away, rather than the band starting square-on.
    const PHASE = Math.PI / 2 - ((COUNT - 1) / 2) * STEP;
    const SWEEP = 1.8; // radians of travel around the circle across the section

    // The shader places vertices from uSpan and uRadius, so a card's on-screen
    // width is radius * SPAN. Its height has to be derived from that arc, not
    // picked independently, or the aspect ratio drifts with viewport size.
    const RADIUS_FRAC = 0.75; // of viewport width
    const RADIUS = window.innerWidth * RADIUS_FRAC;
    const cardW = RADIUS * SPAN;
    const cardH = cardW * 0.72;

    const vertexShader = /* glsl */ `
      uniform float uAngle;
      uniform float uRadius;
      uniform float uSpan;
      uniform float uPitch;      // vertical rise per radian — this is the helix
      uniform float uCentre;     // band centre, so the group can hold it in frame
      uniform float uDipAmp;
      uniform float uDipWidth;
      uniform float uExpand;     // extra size at the focal point
      uniform float uFocus;      // how tightly that expansion falls off
      varying vec2 vUv;
      varying float vFacing;

      void main() {
        vUv = uv;
        // uv.x maps to the angular parameter, so the card is genuinely bent
        // along the curve rather than placed flat on it.
        // Cards swell as they reach the centre of the band and settle back as
        // they pass. Scaling the card about its own centre — angular span and
        // radial height together — grows it in place rather than sliding it.
        float fd = (uAngle - uCentre) / uFocus;
        float prox = exp(-fd * fd);
        float grow = 1.0 + uExpand * prox;

        float a = uAngle + (uv.x - 0.5) * uSpan * grow;

        // hPos: orbit in X-Z, climb in Y, centred on a quarter turn. There the
        // orbit spends its travel on X, which is what spreads the cards into a
        // wide band; centred on zero it spends it on Z instead and the cards
        // stack into a vertical column. Depth is then a gentle bulge — nearest
        // mid-band — and the spin slides which part of that bulge is on screen.
        float d = (a - uCentre) / uDipWidth;
        float dip = uDipAmp * exp(-d * d);

        // NOTE: x is NEGATED. With +cos, screen-x runs backwards against the
        // card's uv and every texture draws mirrored. If this sign changes, the
        // drum.position.x compensation must flip with it.
        vec3 p = vec3(
          -uRadius * cos(a),
          a * uPitch - dip + position.y,
          uRadius * sin(a)
        );

        // Camera sits on +Z, so sin(a) is how squarely a card faces it.
        vFacing = 0.35 + 0.65 * (0.5 + 0.5 * sin(a));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `;

    const fragmentShader = /* glsl */ `
      uniform sampler2D uMap;
      uniform float uHasMap;
      uniform vec2 uCover;   // uv scale for object-fit: cover
      uniform float uRadiusPx;
      uniform vec2 uSize;
      varying vec2 vUv;
      varying float vFacing;

      void main() {
        // Back of the drum faces away — discard rather than draw it mirrored.
        if (vFacing < 0.02) discard;


        vec2 uv = (vUv - 0.5) * uCover + 0.5;
        vec3 col = uHasMap > 0.5 ? texture2D(uMap, uv).rgb : vec3(0.05, 0.06, 0.08);
        if (uHasMap > 0.5 && (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)) col = vec3(0.05, 0.06, 0.08);

        // Rounded corners, in real pixels — full rounded-box SDF. The
        // min(max(q.x,q.y),0.0) term is what gives a correct negative distance
        // inside the shape; without it the interior reads as 0 and the edge
        // falloff is wrong.
        vec2 halfSize = uSize * 0.5;
        vec2 q = abs((vUv - 0.5) * uSize) - halfSize + uRadiusPx;
        float d = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - uRadiusPx;
        float alpha = 1.0 - smoothstep(-0.5, 0.5, d);
        if (alpha <= 0.001) discard;

        // Slight shading as a card turns away, so the drum reads as round.
        col *= 0.55 + 0.45 * clamp(vFacing, 0.0, 1.0);
        // Thin rim: against a dark page the card edges vanish and neighbours
        // blur together, so give each one its own boundary.
        float rim = smoothstep(-2.5, -0.5, d);
        col = mix(col, vec3(1.0), rim * 0.35);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    // Assigned after the loop; textures land asynchronously and each upload
    // needs the same pre-warm as the initial compile.
    let onTextureReady: (() => void) | null = null;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const geometry = new THREE.PlaneGeometry(cardW, cardH, 40, 1);
    const meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
    const textures: THREE.Texture[] = [];

    for (let i = 0; i < COUNT; i++) {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uAngle: { value: PHASE + i * STEP },
          uRadius: { value: RADIUS },
          uSpan: { value: SPAN },
          uMap: { value: null },
          uHasMap: { value: 0 },
          uCover: { value: new THREE.Vector2(1, 1) },
          uRadiusPx: { value: narrow ? 10 : 16 },
          uSize: { value: new THREE.Vector2(cardW, cardH) },
          uPitch: { value: 0 },
          uCentre: { value: 0 },
          uDipAmp: { value: 0 },
          uDipWidth: { value: 0.9 },
          // Cards already sit nearly edge to edge, so the swell has to stay
          // small and tightly focused or the band merges into one slab.
          uExpand: { value: 0.12 },
          uFocus: { value: 0.3 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      // The vertex shader displaces vertices onto the ring, up to R away from
      // the mesh origin. Three.js still culls against the ORIGINAL flat-plane
      // bounds at that origin, so with the origin off-screen every card gets
      // culled before it draws. Displacement in a shader always needs this off.
      mesh.frustumCulled = false;
      mesh.renderOrder = i;
      drum.add(mesh);
      meshes.push(mesh);

      // Route through Next's image optimizer so textures aren't full-size originals.
      const raw = images[i % images.length].src;
      const url = raw.startsWith('/') || raw.startsWith('http')
        ? `/_next/image?url=${encodeURIComponent(raw)}&w=750&q=70`
        : raw;

      loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          textures.push(tex);
          material.uniforms.uMap.value = tex;
          material.uniforms.uHasMap.value = 1;
          // object-fit: cover
          const texAspect = tex.image.width / tex.image.height;
          const planeAspect = cardW / cardH;
          if (texAspect > planeAspect) {
            material.uniforms.uCover.value.set(planeAspect / texAspect, 1);
          } else {
            material.uniforms.uCover.value.set(1, texAspect / planeAspect);
          }
          onTextureReady?.();
        },
        undefined,
        () => {
          /* leave the placeholder colour on failure */
        },
      );
    }

    /* Two guide lines tracing the same curve the cards ride. They sample hPos on
       the CPU with the identical formula the vertex shader uses — if one changes
       the other has to follow, or the lines drift off the band. */
    const GUIDE_PTS = 160;
    const guides = [1, -1].map((side) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(GUIDE_PTS * 3), 3));
      const line = new THREE.Line(
        g,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }),
      );
      line.frustumCulled = false; // same reason as the cards: CPU bounds are wrong
      line.userData.side = side;
      drum.add(line);
      return line;
    });

    const updateGuides = (centre: number, radius: number, pitch: number, dipAmp: number) => {
      const arc = (COUNT + 5) * STEP; // run past the cards at both ends
      for (const line of guides) {
        const side = line.userData.side as number;
        const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < GUIDE_PTS; i++) {
          const a = centre + (i / (GUIDE_PTS - 1) - 0.5) * arc;
          const d = (a - centre) / 0.9;
          const dip = dipAmp * Math.exp(-d * d);
          // Offset radially, so one line rides above the cards and one below.
          const r = radius + side * cardH * 0.78;
          attr.setXYZ(i, -r * Math.cos(a), a * pitch - dip, r * Math.sin(a));
        }
        attr.needsUpdate = true;
      }
    };

    let raf = 0;
    let eased = targetRef.current ?? 0;
    let visible = true;
    let viewH = 0;
    let ringR = 0;

    // The depth ramp supplies the gradient now, so the ring needs only a
    // slight tip to keep the band from reading as a flat arc.
    const TILT_X = 0.12;

    // The band doesn't just spin — it rises. It enters from below the fold,
    // sweeps through the middle at its largest, and exits across the top.
    const resize = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = camDistance(h);
      camera.updateProjectionMatrix();
      const radius = w * RADIUS_FRAC;
      for (let i = 0; i < meshes.length; i++) {
        const u = meshes[i].material.uniforms;
        u.uRadius.value = radius;
        u.uSpan.value = SPAN;
      }
      // Tip the ring so its top edge swings toward the camera. That single
      // rotation produces the whole size gradient: nearest at the top of the
      // arc, receding evenly to both ends.
      // Tilt is bounded, not chosen freely: rotating the ring swings its depth
      // by R*sin(tilt). Too steep and the far side of that swing crosses the
      // camera plane, at which point cards don't shrink — they disappear.
      drum.rotation.x = -TILT_X;
      viewH = h;
      ringR = radius;
    };

    const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
    const smooth = (t: number) => t * t * (3 - 2 * t);

    const render = () => {
      // Reduced motion: hold a representative frame instead of driving the
      // helix from scroll. Scroll-linked motion is exactly what that setting
      // asks us not to do.
      eased = prefersReduced ? 0.5 : (targetRef.current ?? 0);
      // Centred on zero, not a quarter turn — see the shader note.
      const centre = Math.PI / 2 + (eased - 0.5) * SWEEP;

      for (let i = 0; i < meshes.length; i++) {
        meshes[i].material.uniforms.uAngle.value = centre + (i - (COUNT - 1) / 2) * STEP;
      }

      // A card's x, y AND z are all functions of its angle, so spinning the ring
      // swings the entire band out of frame — it was only on screen near the
      // midpoint of the scroll. Cancel the centre's own motion on all three
      // axes: the band then holds its place while cards flow through it.
      // Rise must stay well under the orbit or the band tips vertical.
      const pitch = ringR * 0.22;
      // The band lives in the lower third and lifts only a little across the
      // whole section — it does not sweep the full height.
      const riseY = -viewH * 0.3 + eased * viewH * 0.24;

      for (let i = 0; i < meshes.length; i++) {
        const u = meshes[i].material.uniforms;
        u.uPitch.value = pitch;
        u.uCentre.value = centre;
        u.uDipAmp.value = ringR * 0.1;
        // The swelling card has to draw over its neighbours; with depthWrite
        // off, paint order is the only thing deciding that.
        const fd = (u.uAngle.value - centre) / u.uFocus.value;
        meshes[i].renderOrder = Math.round(Math.exp(-fd * fd) * 100);
      }

      // Cancel the band centre's own helix motion on all three axes, then apply
      // the deliberate rise. Without this the spin carries the whole band out
      // of frame — every coordinate is a function of the same angle.
      updateGuides(centre, ringR, pitch, ringR * 0.1);

      drum.position.x = ringR * Math.cos(centre); // paired with the shader's -cos
      drum.position.y = -centre * pitch + riseY;
      // Cards start small and far, then draw closer as the section plays. On
      // screen that is roughly 9% of viewport width rising to 14% — the
      // reference is nowhere near the 28% this sat at before.
      const camZ = camDistance(viewH);
      const push = -viewH * 0.57 + eased * viewH * 0.55;
      drum.position.z = -ringR * Math.sin(centre) + push;
      void camZ;

      renderer.render(scene, camera);
    };

    const tick = () => {
      // Under reduced motion there is nothing to animate — one frame, then stop.
      if (prefersReduced) {
        render();
        return;
      }
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      render();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    observer.observe(el);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (prefersReduced) render(); // no loop running to pick the change up
    });
    resizeObserver.observe(el);

    // Compile shaders and upload textures before the section is reached, so that
    // one-time cost doesn't land on the first visible frame as a scroll hitch.
    const warmUp = () => {
      renderer.compile(scene, camera);
      renderer.render(scene, camera);
      renderer.clear();
    };

    onTextureReady = () => {
      warmUp();
      // warmUp() ends in renderer.clear(). With the loop running the next frame
      // repaints immediately, but under reduced motion there is no next frame —
      // the cleared buffer is what stays on screen. So repaint explicitly, and
      // do it here because textures arrive after that single frame was drawn.
      if (prefersReduced) render();
    };

    resize();
    warmUp();
    tick();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      guides.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      geometry.dispose();
      meshes.forEach((m) => m.material.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [images, targetRef]);

  return (
    <>
      <div ref={mountRef} className={className} aria-hidden="true" />
      {/* The cards are WebGL textures, so their alt text reaches assistive tech
          nowhere. Without this the whole gallery is an empty region. */}
      <ul className="sr-only">
        {images.map((image, index) => (
          <li key={`${image.src}-${index}`}>{image.alt}</li>
        ))}
      </ul>
    </>
  );
}
