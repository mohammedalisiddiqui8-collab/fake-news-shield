import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

/* ─── HERO CUBE FIELD + QUOTE TRANSFORMATION ────────────────────────────
   A cinematic environment for the title page: a suspended field of very
   small luminous blue cubes drifting through genuine 3D space, and the
   crimson quote beneath VERITAS that periodically dissolves into particles,
   disperses into the cube field, and reforms as the next line.

   Everything is original to Veritas — the reference point is the *principle*
   of a digital identity breaking apart and reconstructing, not any scene.

   Performance: two InstancedMeshes (ambient field + quote particles), no
   postprocessing — glow is additive halo sprites. Counts are device-classed,
   the loop pauses when the tab is hidden, and prefers-reduced-motion gets a
   static field with a plain crossfading quote. ─────────────────────────── */

/* The lines live with the page — the scene only transforms whatever it is given. */

/* Crimson — the examined claim. Deep, restrained, never neon. */
const RED = { core: "#A84742", bright: "#C4574F", halo: "#7E2E2A" };
/* Blue — the digital environment. Electric toward deep, on the ivory-dark canvas. */
const FIELD_BG = 0x151618;

const EASE_OUT = (p: number) => 1 - Math.pow(1 - p, 3);
const EASE_IN = (p: number) => p * p;
const clamp01 = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p);

function makeHaloTexture(hex: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, hex + "AA");
  g.addColorStop(0.45, hex + "33");
  g.addColorStop(1, hex + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface QuoteSample {
  points: Float32Array; // x,y per point, in offscreen-canvas px, origin at text centre
  count: number;
  tex: THREE.CanvasTexture | null;
  aspect: number; // width / height of the drawn text box
  widthPx: number;
  heightPx: number;
}

export default function HeroScene({
  anchorRef,
  quotes,
  onUnavailable,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
  quotes: string[];
  onUnavailable?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ── Device class ── */
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isSmall =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)").matches;
    const FIELD_COUNT = reduceMotion ? 220 : isSmall ? 380 : 920;
    const QUOTE_CAP = reduceMotion ? 0 : isSmall ? 360 : 620;

    /* ── WebGL guard ── */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isSmall, alpha: true, powerPreference: "high-performance" });
    } catch {
      onUnavailable?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.75 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(FIELD_BG, 0.062);

    const vw = () => container.clientWidth || 1;
    const vh = () => container.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(42, vw() / vh(), 0.1, 60);
    camera.position.set(0, 0, 7.2);

    /* ── The ambient cube field — suspended in real depth, never a plane.
          A central corridor stays clear so VERITAS and the quote breathe. ── */
    const fieldGeo = new THREE.BoxGeometry(1, 1, 1);
    const fieldMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const field = new THREE.InstancedMesh(fieldGeo, fieldMat, FIELD_COUNT);
    field.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    field.renderOrder = 1;
    scene.add(field);

    interface Cube {
      x: number; y: number; z: number;
      size: number;
      ax: number; ay: number; az: number;   // drift amplitudes
      wx: number; wy: number; wz: number;   // drift speeds
      px: number; py: number; pz: number;   // drift phases
      rz: number; rSpeed: number;           // slow tumble
      breatheA: number; breatheW: number;   // occasional toward/away camera
      base: THREE.Color;
    }
    const cubes: Cube[] = [];
    {
      const color = new THREE.Color();
      let guard = 0;
      while (cubes.length < FIELD_COUNT && guard++ < FIELD_COUNT * 40) {
        // Spherical shell around the composition, biased outward
        const r = 2.1 + Math.pow(Math.random(), 0.62) * 7.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta) * 0.72; // gently flattened, not a plane
        const z = r * Math.cos(phi) * 0.62 + (Math.random() - 0.4) * 1.6;
        if (z > 2.6) continue;
        // Keep the central typography corridor clean
        if (Math.abs(z) < 1.3 && Math.abs(x) < 2.5 && Math.abs(y) < 1.75) continue;

        const depth = clamp01((9.5 - r) / 9.5);
        color.setHSL(0.585 + Math.random() * 0.05, 0.65 + Math.random() * 0.3, 0.34 + depth * 0.34);
        cubes.push({
          x, y, z,
          size: 0.024 + Math.pow(Math.random(), 2.2) * 0.062 + (Math.random() < 0.04 ? 0.03 : 0),
          ax: 0.06 + Math.random() * 0.38,
          ay: 0.05 + Math.random() * 0.3,
          az: 0.04 + Math.random() * 0.26,
          wx: 0.05 + Math.random() * 0.3,
          wy: 0.05 + Math.random() * 0.3,
          wz: 0.05 + Math.random() * 0.28,
          px: Math.random() * Math.PI * 2,
          py: Math.random() * Math.PI * 2,
          pz: Math.random() * Math.PI * 2,
          rz: Math.random() * Math.PI,
          rSpeed: (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.5),
          breatheA: Math.random() < 0.14 ? 0.1 + Math.random() * 0.22 : 0,
          breatheW: 0.06 + Math.random() * 0.12,
          base: color.clone(),
        });
        field.setColorAt(cubes.length - 1, color);
      }
      field.count = cubes.length;
      if (field.instanceColor) field.instanceColor.needsUpdate = true;
    }

    /* ── Quote particles — one instanced pool reused for dissolve + formation ── */
    const quoteGeo = new THREE.BoxGeometry(1, 1, 1);
    const quoteMat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.95, depthWrite: false });
    const quoteMesh = new THREE.InstancedMesh(quoteGeo, quoteMat, Math.max(QUOTE_CAP, 1));
    quoteMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    quoteMesh.renderOrder = 2;
    quoteMesh.count = 0;
    scene.add(quoteMesh);

    interface QP {
      sx: number; sy: number; sz: number;  // start
      tx: number; ty: number; tz: number;  // target
      delay: number; dur: number; size: number;
      cx: number; cy: number; cz: number;  // curl, keeps paths off straight lines
      seed: number;
      rx: number; ry: number; spin: number;
      col: THREE.Color;
    }
    const quoteParticles: QP[] = [];

    /* ── Sparks — the dissolved quote absorbed into the blue field ── */
    const SPARKS = isSmall ? 8 : 16;
    const sparkMesh = new THREE.InstancedMesh(quoteGeo, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.9, depthWrite: false }), SPARKS);
    sparkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sparkMesh.renderOrder = 2;
    sparkMesh.count = 0;
    scene.add(sparkMesh);
    const sparks = Array.from({ length: SPARKS }, () => ({
      sx: 0, sy: 0, sz: 0, tx: 0, ty: 0, tz: 0, t: 1, dur: 1.4, size: 0.03,
    }));

    /* ── Halos — restrained additive glow, no postprocessing ── */
    const blueHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeHaloTexture("#2E4C78"), transparent: true, opacity: 0.05,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    }));
    blueHalo.scale.set(9, 9, 1);
    blueHalo.renderOrder = 0;
    scene.add(blueHalo);

    const redHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeHaloTexture(RED.halo), transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    }));
    redHalo.renderOrder = 0;
    scene.add(redHalo);

    /* ── The quote itself — drawn crisp on a canvas texture, aligned to the
          layout slot measured from the DOM anchor. ── */
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true })!;
    const textMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), textMat);
    textPlane.renderOrder = 3;
    scene.add(textPlane);

    let sample: QuoteSample = { points: new Float32Array(0), count: 0, tex: null, aspect: 1, widthPx: 1, heightPx: 1 };
    let quoteIndex = 0;

    function drawQuote(text: string): QuoteSample {
      const fontPx = 32;
      off.width = 8;
      off.height = 52; // reset also clears state
      octx.font = `italic 400 ${fontPx}px "Source Serif 4", Georgia, serif`;
      type LS = { letterSpacing?: string };
      try { (octx as unknown as LS).letterSpacing = "0.06em"; } catch { /* older canvas */ }
      const w = Math.min(1400, Math.ceil(octx.measureText(text).width) + 12);
      off.width = w;
      octx.font = `italic 400 ${fontPx}px "Source Serif 4", Georgia, serif`;
      try { (octx as unknown as LS).letterSpacing = "0.06em"; } catch { /* older canvas */ }
      octx.textBaseline = "middle";
      octx.fillStyle = RED.core;
      octx.fillText(text, 6, off.height / 2);

      const tex = new THREE.CanvasTexture(off);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;

      const pts: number[] = [];
      if (QUOTE_CAP > 0) {
        const img = octx.getImageData(0, 0, w, off.height).data;
        const step = 2;
        for (let y = 0; y < off.height; y += step) {
          for (let x = 0; x < w; x += step) {
            if (img[(y * w + x) * 4 + 3] > 120) pts.push(x - w / 2, y - off.height / 2);
          }
        }
      }
      // Thin to the cap if the line sampled dense
      let points = new Float32Array(pts);
      if (points.length / 2 > QUOTE_CAP) {
        const stride = Math.ceil(points.length / 2 / QUOTE_CAP);
        const thinned: number[] = [];
        for (let i = 0; i < points.length / 2; i += stride) thinned.push(points[i * 2], points[i * 2 + 1]);
        points = new Float32Array(thinned);
      }
      return { points, count: points.length / 2, tex, aspect: w / off.height, widthPx: w, heightPx: off.height };
    }

    /* ── Anchor mapping — screen slot → world coordinates at z = 0 ── */
    let anchorRect: DOMRect | null = null;
    let worldPerPx = 0.01;
    const refreshAnchor = () => {
      const el = anchorRef.current;
      anchorRect = el && el.getBoundingClientRect().width > 0 ? el.getBoundingClientRect() : null;
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      worldPerPx = (2 * halfH) / vh();
    };
    const textWorldSize = () => {
      if (!anchorRect) return { w: 0, h: 0, k: 0.3 };
      const desiredPx = Math.max(11, Math.min(16, Math.round(anchorRect.height * 0.58)));
      const k = desiredPx / 32;
      return { w: sample.widthPx * k * worldPerPx, h: sample.heightPx * k * worldPerPx, k };
    };

    /* ── Phase machine: HOLD → dissolve → absorb gap → form → HOLD ── */
    const T_HOLD = reduceMotion ? 4.6 : 3.2;
    const T_OUT = reduceMotion ? 0.55 : 0.85;
    const T_GAP = reduceMotion ? 0 : 0.35;
    const T_IN = reduceMotion ? 0.55 : 1.35;
    type Phase = "hold" | "out" | "gap" | "in";
    let phase: Phase = "hold";
    let phaseT = 0;

    function spawnDissolve() {
      quoteParticles.length = 0;
      if (!anchorRect || sample.count === 0) return;
      const { w, h, k } = textWorldSize();
      const s0 = Math.max(0.012, 2.1 * worldPerPx * (k / 0.3));
      for (let i = 0; i < sample.count; i++) {
        const px = sample.points[i * 2] * k * worldPerPx;
        const py = -sample.points[i * 2 + 1] * k * worldPerPx;
        const dx = px / (w * 0.5 || 1) + (Math.random() - 0.5) * 0.9;
        const dy = py / (h * 0.5 || 1) + (Math.random() - 0.5) * 0.9;
        const len = Math.hypot(dx, dy) || 1;
        const spread = 0.9 + Math.random() * 1.7;
        const sweep = (px / (w * 0.5 || 1) + 1) / 2;
        quoteParticles.push({
          sx: px, sy: py, sz: 0,
          tx: px + (dx / len) * spread,
          ty: py + (dy / len) * spread,
          tz: (Math.random() - 0.5) * 2.4,
          delay: (1 - sweep) * 0.4 + Math.random() * 0.28,
          dur: 0.55 + Math.random() * 0.4,
          size: s0 * (0.7 + Math.random() * 0.6),
          cx: (Math.random() - 0.5) * 0.5,
          cy: (Math.random() - 0.5) * 0.5,
          cz: (Math.random() - 0.5) * 0.4,
          seed: Math.random() * Math.PI * 2,
          rx: Math.random() * Math.PI,
          ry: Math.random() * Math.PI,
          spin: 2 + Math.random() * 4,
          col: new THREE.Color(RED.core).lerp(new THREE.Color(RED.bright), Math.random() * 0.7),
        });
      }
      quoteMesh.count = Math.min(quoteParticles.length, QUOTE_CAP);
      for (let i = 0; i < quoteMesh.count; i++) quoteMesh.setColorAt(i, quoteParticles[i].col);
      if (quoteMesh.instanceColor) quoteMesh.instanceColor.needsUpdate = true;
    }

    function spawnFormation() {
      quoteParticles.length = 0;
      if (!anchorRect || sample.count === 0) return;
      const { w, h, k } = textWorldSize();
      const s0 = Math.max(0.012, 2.1 * worldPerPx * (k / 0.3));
      let minX = Infinity, maxX = -Infinity;
      for (let i = 0; i < sample.count; i++) {
        const px = sample.points[i * 2] * k * worldPerPx;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
      }
      for (let i = 0; i < sample.count; i++) {
        const px = sample.points[i * 2] * k * worldPerPx;
        const py = -sample.points[i * 2 + 1] * k * worldPerPx;
        // Converge from the surrounding space — a quarter arrive from the cube field itself
        let ox: number, oy: number, oz: number;
        if (Math.random() < 0.25) {
          const c = cubes[(Math.random() * cubes.length) | 0];
          ox = c.x * 0.55; oy = c.y * 0.55; oz = c.z * 0.55;
        } else {
          const a = Math.random() * Math.PI * 2;
          const r = 0.9 + Math.random() * 1.7;
          ox = Math.cos(a) * r;
          oy = Math.sin(a) * r * 0.6;
          oz = (Math.random() - 0.35) * 2.6;
        }
        const sweep = (px - minX) / (maxX - minX || 1);
        quoteParticles.push({
          sx: ox, sy: oy, sz: oz,
          tx: px, ty: py, tz: 0,
          delay: sweep * 0.5 + Math.random() * 0.24,
          dur: 0.7 + Math.random() * 0.5,
          size: s0 * (0.7 + Math.random() * 0.6),
          cx: (Math.random() - 0.5) * 0.7,
          cy: (Math.random() - 0.5) * 0.5,
          cz: (Math.random() - 0.5) * 0.5,
          seed: Math.random() * Math.PI * 2,
          rx: Math.random() * Math.PI,
          ry: Math.random() * Math.PI,
          spin: 2 + Math.random() * 4,
          col: new THREE.Color(RED.bright).lerp(new THREE.Color(RED.core), Math.random() * 0.6),
        });
      }
      quoteMesh.count = Math.min(quoteParticles.length, QUOTE_CAP);
      for (let i = 0; i < quoteMesh.count; i++) quoteMesh.setColorAt(i, quoteParticles[i].col);
      if (quoteMesh.instanceColor) quoteMesh.instanceColor.needsUpdate = true;
    }

    function spawnSparks() {
      if (!anchorRect) return;
      const { w } = textWorldSize();
      for (const s of sparks) {
        s.sx = (Math.random() - 0.5) * w;
        s.sy = (Math.random() - 0.5) * 0.18;
        s.sz = (Math.random() - 0.5) * 0.4;
        const a = Math.random() * Math.PI * 2;
        const r = 2.4 + Math.random() * 3.4;
        s.tx = Math.cos(a) * r;
        s.ty = Math.sin(a) * r * 0.6;
        s.tz = -1.2 - Math.random() * 3.4;
        s.t = 0;
        s.dur = 1.1 + Math.random() * 0.6;
        s.size = 0.018 + Math.random() * 0.02;
      }
      sparkMesh.count = SPARKS;
      const c = new THREE.Color(RED.bright);
      for (let i = 0; i < SPARKS; i++) sparkMesh.setColorAt(i, c);
      if (sparkMesh.instanceColor) sparkMesh.instanceColor.needsUpdate = true;
    }

    const dummy = new THREE.Object3D();

    /* Reduced motion: the field is composed once and left still — the same
       suspended depth, none of the travel. */
    if (reduceMotion) {
      for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i];
        dummy.position.set(c.x, c.y, c.z);
        dummy.rotation.set(c.rz, c.rz * 0.7, c.rz);
        dummy.scale.setScalar(c.size);
        dummy.updateMatrix();
        field.setMatrixAt(i, dummy.matrix);
      }
      field.instanceMatrix.needsUpdate = true;
    }

    /* ── Input — gentle parallax, fine pointers only ── */
    const fine = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;
    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    if (fine && !reduceMotion) window.addEventListener("mousemove", onMouse, { passive: true });

    const onResize = () => {
      camera.aspect = vw() / vh();
      camera.updateProjectionMatrix();
      renderer.setSize(vw(), vh());
      refreshAnchor();
    };
    window.addEventListener("resize", onResize);
    onResize();

    // Draw immediately with whatever serif is loaded — the webfont redraw
    // below only re-measures once it actually lands.
    sample = drawQuote(quotes[0]);
    textMat.map = sample.tex;
    textMat.needsUpdate = true;

    // Webfont may land after mount — re-measure once ready
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        sample = drawQuote(quotes[quoteIndex]);
        textMat.map = sample.tex;
        textMat.needsUpdate = true;
        refreshAnchor();
      }).catch(() => {});
    }

    /* ── Loop ── */
    const clock = new THREE.Clock();
    let t = 0;
    let raf = 0;
    let running = true;

    const onVisibility = () => {
      running = !document.hidden;
      if (running) clock.getDelta();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;

      /* Camera — slow autonomous drift + restrained pointer parallax */
      const driftX = reduceMotion ? 0 : Math.sin(t * 0.07) * 0.05;
      const driftY = reduceMotion ? 0 : Math.cos(t * 0.055) * 0.04;
      camera.position.x += (mouse.x * 0.14 + driftX - camera.position.x) * 0.045;
      camera.position.y += (mouse.y * 0.09 + driftY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      /* The field — multi-directional drift, slow tumble, occasional z breathing */
      if (!reduceMotion) {
        for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i];
        const breathe = c.breatheA ? Math.sin(t * c.breatheW + c.px) * c.breatheA : 0;
        dummy.position.set(
          c.x + Math.sin(t * c.wx + c.px) * c.ax,
          c.y + Math.cos(t * c.wy + c.py) * c.ay,
          c.z + Math.sin(t * c.wz + c.pz) * c.az + breathe,
        );
        dummy.rotation.set(c.rz + t * c.rSpeed * 0.4, c.rz * 0.7 + t * c.rSpeed * 0.6, c.rz);
        dummy.scale.setScalar(c.size);
        dummy.updateMatrix();
        field.setMatrixAt(i, dummy.matrix);
      }        field.instanceMatrix.needsUpdate = true;
      }

      /* Phase machine */
      phaseT += dt;
      if (phase === "hold" && phaseT >= T_HOLD) {
        phase = "out"; phaseT = 0;
        if (!reduceMotion) spawnDissolve();
      } else if (phase === "out" && phaseT >= T_OUT) {
        phase = "gap"; phaseT = 0;
        if (!reduceMotion) spawnSparks();
        quoteIndex = (quoteIndex + 1) % quotes.length;
        sample = drawQuote(quotes[quoteIndex]);
        textMat.map = sample.tex;
        textMat.needsUpdate = true;
      } else if (phase === "gap" && phaseT >= T_GAP) {
        phase = "in"; phaseT = 0;
        if (!reduceMotion) spawnFormation();
      } else if (phase === "in" && phaseT >= T_IN) {
        phase = "hold"; phaseT = 0;
      }

      /* Quote sprite + halo */
      if (anchorRect) {
        const { w, h } = textWorldSize();
        const cx = anchorRect.left + anchorRect.width / 2;
        const cy = anchorRect.top + anchorRect.height / 2;
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const wx = ((cx / vw()) * 2 - 1) * halfH * camera.aspect;
        const wy = -(((cy / vh()) * 2 - 1)) * halfH;
        textPlane.position.set(wx, wy, 0.001);
        textPlane.scale.set(Math.max(w, 0.001), Math.max(h, 0.001), 1);
        redHalo.position.set(wx, wy, -0.2);
        redHalo.scale.set(3.2, 1.6, 1);
      }
      if (phase === "hold") {
        // No texture yet (font pipeline hiccup) — hold invisible rather than
        // show an untextured quad.
        const target = textMat.map ? 1 : 0;
        textMat.opacity += (target - textMat.opacity) * Math.min(1, dt * 6);
        redHalo.material.opacity += (0 - redHalo.material.opacity) * Math.min(1, dt * 3);
      } else if (phase === "out") {
        const p = phaseT / T_OUT;
        textMat.opacity = reduceMotion ? 1 - clamp01(p / 0.9) : 1 - clamp01(p / 0.28);
        redHalo.material.opacity = 0.12 * Math.sin(Math.min(1, p) * Math.PI);
      } else if (phase === "gap") {
        textMat.opacity = 0;
        redHalo.material.opacity += (0 - redHalo.material.opacity) * Math.min(1, dt * 4);
      } else if (phase === "in") {
        const p = phaseT / T_IN;
        textMat.opacity = clamp01((p - 0.55) / 0.4);
        redHalo.material.opacity = 0.09 * Math.sin(clamp01(p) * Math.PI);
      }
      blueHalo.material.opacity = 0.045 + Math.sin(t * 0.23) * 0.012 + redHalo.material.opacity * 0.15;

      /* Quote particles — dissolve outward, or converge into letterforms */
      if (quoteMesh.count > 0) {
        const forming = phase === "in";
        for (let i = 0; i < quoteMesh.count; i++) {
          const q = quoteParticles[i];
          const p = clamp01((phaseT - q.delay) / q.dur);
          const e = forming ? EASE_OUT(p) : EASE_IN(p);
          const curl = Math.sin(p * Math.PI * 2 + q.seed);
          dummy.position.set(
            q.sx + (q.tx - q.sx) * e + curl * q.cx,
            q.sy + (q.ty - q.sy) * e + curl * q.cy,
            q.sz + (q.tz - q.sz) * e + curl * q.cz,
          );
          const fade = forming ? 0.25 + 0.75 * Math.sin(clamp01(p) * Math.PI * 0.5) : 1 - p * 0.75;
          const shimmer = phase === "hold" ? 0.45 + Math.sin(t * 2 + q.seed) * 0.08 : fade;
          dummy.scale.setScalar(Math.max(0.0001, q.size * shimmer));
          dummy.rotation.set(q.rx + t * q.spin * (1 - e), q.ry - t * q.spin * 0.7 * (1 - e), q.seed);
          dummy.updateMatrix();
          quoteMesh.setMatrixAt(i, dummy.matrix);
        }
        quoteMesh.instanceMatrix.needsUpdate = true;
        quoteMat.opacity = phase === "hold" ? 0.5 : 0.95;
      }

      /* Sparks — absorbed into the field */
      if (sparkMesh.count > 0) {
        let alive = 0;
        for (let i = 0; i < SPARKS; i++) {
          const s = sparks[i];
          if (s.t < 1) s.t = Math.min(1, s.t + dt / s.dur);
          if (s.t < 1) alive++;
          const e = EASE_OUT(s.t);
          dummy.position.set(
            s.sx + (s.tx - s.sx) * e + Math.sin(s.t * 9 + i) * 0.06,
            s.sy + (s.ty - s.sy) * e,
            s.sz + (s.tz - s.sz) * e,
          );
          dummy.scale.setScalar(Math.max(0.0001, s.size * (1 - s.t)));
          dummy.rotation.set(i * 1.3 + t * 3, i * 0.7, 0);
          dummy.updateMatrix();
          sparkMesh.setMatrixAt(i, dummy.matrix);
        }
        sparkMesh.instanceMatrix.needsUpdate = true;
        if (alive === 0) sparkMesh.count = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (fine) window.removeEventListener("mousemove", onMouse);
      const disposeMat = (m: THREE.Material & { map?: THREE.Texture }) => {
        m.map?.dispose();
        m.dispose();
      };
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as (THREE.Material & { map?: THREE.Texture }) | (THREE.Material & { map?: THREE.Texture })[] | undefined;
        if (Array.isArray(mat)) mat.forEach(disposeMat);
        else if (mat) disposeMat(mat);
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
    // anchorRef and onUnavailable are stable per mount; the scene owns one loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}
