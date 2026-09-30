import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

/* ─── HERO ENERGY FIELD + QUOTE TRANSFORMATION ───────────────────────────
   The hero background is light itself, not objects.

   Every filament is a ribbon of triangles whose path, bend, travelling
   pulse, life envelope and depth falloff are computed in the vertex shader
   from a handful of per-strand attributes. Nothing about the field is drawn
   on the CPU per frame, so the motion is genuine 3D flow: filaments grow
   outward from a soft central source region, curve and breathe, cross in
   front of and behind each other, drift toward and away from the camera,
   fade away and return — each on its own unsynchronised timing.

   Colour is carried by additive light: an electric blue/cyan core inside a
   soft blue bloom. The brightest point on any strand is always the pulse
   travelling along it, so the field reads as current rather than decoration.

   The crimson quote beneath VERITAS uses the identical language. Its sampled
   letterform pixels grow thin red filaments that flow outward, lose the
   letters their structure, then reverse and converge back onto the next
   quote's letterforms. Cycle: 1.8s readable → 0.6s dissolve → 0.6s reform.

   Performance: two draw calls for the whole hero (blue field, red quote
   energy). Ribbon geometry is built once; quote strands are refilled on a
   Float32Array a few times a minute. Device-classed counts, DPR caps, the
   loop pauses when the tab hides, and prefers-reduced-motion freezes the
   energy and falls back to a plain crossfading quote. ──────────────────── */

/* Red — the claim under examination. Restrained deep crimson with a coral
   highlight. Never brighter than the blue system it travels through. */
const RED = { core: "#FF6A55", glow: "#7E1F1A", text: "#A84742" };
/* Blue — the Veritas system: electric cyan core, deep blue bloom. */
const BLUE = { core: "#D8F4FF", glow: "#1E5BE0" };

const clamp01 = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p);

/* ── Strand geometry ───────────────────────────────────────────────────
   One geometry holds many strands. Per-vertex attributes describe the
   strand (constant along it) and where along it each vertex sits; the
   shader does the rest. */
interface StrandField {
  geo: THREE.BufferGeometry;
  pos: Float32Array;
  origin: Float32Array;
  dir: Float32Array;
  curv: Float32Array;
  params: Float32Array;  // length, speed, pulse phase, brightness
  params2: Float32Array; // bend freq, bend amp, z-travel, life offset
  t: Float32Array;
  side: Float32Array;
  segs: number;
  maxStrands: number;
}

function makeStrandField(maxStrands: number, segs: number): StrandField {
  const verts = maxStrands * (segs + 1) * 2;
  const pos = new Float32Array(verts * 3);
  const origin = new Float32Array(verts * 3);
  const dir = new Float32Array(verts * 3);
  const curv = new Float32Array(verts * 3);
  const params = new Float32Array(verts * 4);
  const params2 = new Float32Array(verts * 4);
  const t = new Float32Array(verts);
  const side = new Float32Array(verts);

  for (let s = 0; s < maxStrands; s++) {
    for (let j = 0; j <= segs; j++) {
      const v = (s * (segs + 1) + j) * 2;
      t[v] = j / segs;
      t[v + 1] = j / segs;
      side[v] = -1;
      side[v + 1] = 1;
    }
  }

  const indices = new Uint16Array(maxStrands * segs * 6);
  let k = 0;
  for (let s = 0; s < maxStrands; s++) {
    for (let j = 0; j < segs; j++) {
      const v = (s * (segs + 1) + j) * 2;
      indices[k++] = v; indices[k++] = v + 1; indices[k++] = v + 2;
      indices[k++] = v + 1; indices[k++] = v + 3; indices[k++] = v + 2;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aOrigin", new THREE.BufferAttribute(origin, 3));
  geo.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
  geo.setAttribute("aCurv", new THREE.BufferAttribute(curv, 3));
  geo.setAttribute("aParams", new THREE.BufferAttribute(params, 4));
  geo.setAttribute("aParams2", new THREE.BufferAttribute(params2, 4));
  geo.setAttribute("aT", new THREE.BufferAttribute(t, 1));
  geo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.setDrawRange(0, 0);

  return { geo, pos, origin, dir, curv, params, params2, t, side, segs, maxStrands };
}

interface StrandSpec {
  ox: number; oy: number; oz: number;
  dx: number; dy: number; dz: number;
  cx: number; cy: number; cz: number;
  len: number; speed: number; phase: number; bright: number;
  freq: number; amp: number; ztravel: number; lifeOff: number;
}

function fillStrands(f: StrandField, specs: StrandSpec[]) {
  const n = Math.min(specs.length, f.maxStrands);
  const { segs, pos, origin, dir, curv, params, params2 } = f;
  for (let s = 0; s < n; s++) {
    const sp = specs[s];
    for (let j = 0; j <= segs; j++) {
      const v = (s * (segs + 1) + j) * 2;
      for (let side = 0; side < 2; side++) {
        const o3 = (v + side) * 3;
        const o4 = (v + side) * 4;
        pos[o3] = sp.ox; pos[o3 + 1] = sp.oy; pos[o3 + 2] = sp.oz;
        origin[o3] = sp.ox; origin[o3 + 1] = sp.oy; origin[o3 + 2] = sp.oz;
        dir[o3] = sp.dx; dir[o3 + 1] = sp.dy; dir[o3 + 2] = sp.dz;
        curv[o3] = sp.cx; curv[o3 + 1] = sp.cy; curv[o3 + 2] = sp.cz;
        params[o4] = sp.len; params[o4 + 1] = sp.speed; params[o4 + 2] = sp.phase; params[o4 + 3] = sp.bright;
        params2[o4] = sp.freq; params2[o4 + 1] = sp.amp; params2[o4 + 2] = sp.ztravel; params2[o4 + 3] = sp.lifeOff;
      }
    }
  }
  const attrs = ["position", "aOrigin", "aDir", "aCurv", "aParams", "aParams2"] as const;
  for (const a of attrs) (f.geo.getAttribute(a) as THREE.BufferAttribute).needsUpdate = true;
  f.geo.setDrawRange(0, n * (segs + 1) * 2);
}

/* ── Shader: the whole visual language lives here ─────────────────────── */
const VERT = /* glsl */ `
  attribute vec3 aOrigin;
  attribute vec3 aDir;
  attribute vec3 aCurv;
  attribute vec4 aParams;   // length, speed, pulse phase, brightness
  attribute vec4 aParams2;  // bend frequency, bend amplitude, z travel, life offset
  attribute float aT;
  attribute float aSide;

  uniform float uTime;
  uniform float uLifeSpeed;
  uniform float uPulseT;    // shared central pulse progress, <0 when idle
  uniform float uPulseAmp;
  uniform float uWidth;
  uniform float uCenterY;
  uniform vec2  uCorridor;  // inner / outer radius kept clear of the title

  varying float vSide;
  varying float vCore;
  varying float vBright;
  varying float vLife;
  varying float vDepth;
  varying float vClear;

  // The filament's spine: a gentle, time-evolving curve, never a straight beam
  vec3 pathAt(float t) {
    float len = aParams.x;
    float ph  = aParams.w * 6.2831853;
    float bend  = sin(t * 3.14159265 * aParams2.x + ph + uTime * 0.13) * aParams2.y;
    float bend2 = cos(t * 3.14159265 * aParams2.x * 0.47 + ph * 0.7 - uTime * 0.09) * aParams2.y * 0.6;
    vec3 p = aOrigin + aDir * (t * len) + aCurv * bend;
    p.y += bend2 * 0.35;
    // some strands breathe toward and away from the camera
    p.z += sin(t * 3.14159265 + ph + uTime * 0.21) * aParams2.z;
    return p;
  }

  void main() {
    float t = aT;
    vec3 p  = pathAt(t);
    vec3 p2 = pathAt(min(t + 0.02, 1.0));
    vec3 p3 = pathAt(max(t - 0.02, 0.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 tv = normalize((modelViewMatrix * vec4(p2 - p3, 0.0)).xyz);
    vec3 side = normalize(cross(tv, vec3(0.0, 0.0, 1.0)));
    mv.xyz += side * aSide * uWidth * (0.55 + aParams.w * 0.9);

    // fade away, then return again — every strand on its own clock
    float lf = fract(uTime * uLifeSpeed + aParams2.w);
    vLife = smoothstep(0.0, 0.14, lf) * (1.0 - smoothstep(0.74, 1.0, lf));

    // the pulse running outward along the strand
    float ph = fract(aParams.z + uTime * aParams.y);
    float d = t - ph;
    vCore = exp(-d * d / 0.00055) + exp(-pow(max(ph - t, 0.0), 2.0) / 0.004) * 0.35;

    // rare shared pulse leaving the central source
    if (uPulseT >= 0.0) {
      float gd = t - uPulseT;
      vCore += exp(-gd * gd / 0.0011) * uPulseAmp;
    }

    vBright = aParams.w;
    vSide = aSide;
    vDepth = -mv.z;

    // the title stays clean: energy brightens as it leaves the corridor
    vClear = smoothstep(uCorridor.x, uCorridor.y, length(p.xy - vec2(0.0, uCenterY)));

    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColorCore;
  uniform vec3 uColorGlow;
  uniform float uCoreW;
  uniform float uGlowW;
  uniform float uIntensity;

  varying float vSide;
  varying float vCore;
  varying float vBright;
  varying float vLife;
  varying float vDepth;
  varying float vClear;

  void main() {
    float v = abs(vSide);
    // foreground strands lose their core and bloom soft; distant ones fade out
    float near = 1.0 - clamp((vDepth - 2.5) / 9.0, 0.0, 1.0);
    float far  = 1.0 - clamp((15.0 - vDepth) / 10.0, 0.0, 1.0);

    float core = exp(-v * v * uCoreW) * (1.0 - near * 0.65);
    float glow = exp(-v * v * uGlowW) * (1.0 + near * 0.9);

    float i = (core * (0.30 + vCore * 1.7) + glow * 0.22)
            * vBright * vLife * mix(0.22, 1.0, vClear) * far * uIntensity;

    vec3 c = mix(uColorGlow, uColorCore, clamp(core * 1.5 + vCore * 0.8, 0.0, 1.0));
    gl_FragColor = vec4(c * i, 1.0);
  }
`;

function makeEnergyMaterial(
  core: string,
  glow: string,
  coreW: number,
  glowW: number,
  intensity: number,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLifeSpeed: { value: 0.06 },
      uPulseT: { value: -1 },
      uPulseAmp: { value: 0.55 },
      uWidth: { value: 0.055 },
      uCenterY: { value: 0.15 },
      uCorridor: { value: new THREE.Vector2(1.9, 4.2) },
      uColorCore: { value: new THREE.Color(core) },
      uColorGlow: { value: new THREE.Color(glow) },
      uCoreW: { value: coreW },
      uGlowW: { value: glowW },
      uIntensity: { value: intensity },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
  });
}

interface QuoteSample {
  points: Float32Array;
  count: number;
  tex: THREE.CanvasTexture | null;
  widthPx: number;
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

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isSmall =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)").matches;

    /* Density: fewer strands, shorter strands, quieter bloom on small screens */
    const FIELD_STRANDS = reduceMotion ? 26 : isSmall ? 34 : 84;
    const FIELD_SEGS = isSmall ? 22 : 44;
    const HOLD_STRANDS = isSmall ? 40 : 90;
    const BREAK_STRANDS = isSmall ? 150 : 300;
    const RED_SEGS = isSmall ? 14 : 22;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      onUnavailable?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.75 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const vw = () => container.clientWidth || 1;
    const vh = () => container.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(42, vw() / vh(), 0.1, 60);
    camera.position.set(0, 0.2, 7.2);

    /* ── The blue field ── */
    const field = makeStrandField(FIELD_STRANDS, FIELD_SEGS);
    const fieldMat = makeEnergyMaterial(BLUE.core, BLUE.glow, isSmall ? 90 : 70, 4.5, isSmall ? 0.85 : 1);
    fieldMat.uniforms.uWidth.value = 0.055;
    fieldMat.uniforms.uLifeSpeed.value = 0.045;
    const fieldMesh = new THREE.Mesh(field.geo, fieldMat);
    fieldMesh.frustumCulled = false;
    fieldMesh.renderOrder = 1;
    scene.add(fieldMesh);

    /* Filaments leave a small, soft central source region behind the title —
       many nearby origins, never a single point, and never a visible orb. */
    {
      const specs: StrandSpec[] = [];
      const SRC = { x: 0, y: 0.15, z: -1.7 };
      for (let i = 0; i < FIELD_STRANDS; i++) {
        // origin: a small invisible volume, so the field never starts at a pixel
        const r = 0.32 + Math.pow(Math.random(), 0.7) * 0.66;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const ox = SRC.x + r * Math.sin(ph) * Math.cos(th) * 1.35;
        const oy = SRC.y + r * Math.sin(ph) * Math.sin(th) * 0.85;
        const oz = SRC.z + r * Math.cos(ph) * 0.5;
        // direction: outward, mostly across and away — depth tiers from -16 to +3
        const dz = -0.35 - Math.random() * 0.9;
        const spread = 0.5 + Math.random() * 1.5;
        const dx = (Math.random() - 0.5) * 2 * spread;
        const dy = (Math.random() - 0.5) * 2 * spread * 0.55;
        const dl = Math.hypot(dx, dy, dz) || 1;
        specs.push({
          ox, oy, oz,
          dx: dx / dl, dy: dy / dl, dz: dz / dl,
          // bend vector keeps strands from ever reading as straight beams
          cx: (Math.random() - 0.5) * 0.5,
          cy: (Math.random() - 0.5) * 0.34,
          cz: (Math.random() - 0.5) * 0.4,
          len: 2.6 + Math.pow(Math.random(), 1.4) * 13,
          speed: 0.07 + Math.random() * 0.2,
          phase: Math.random(),
          // the stationary strand stays quiet; the pulse carries the brightness
          bright: 0.22 + Math.random() * 0.42,
          freq: 0.6 + Math.random() * 2.2,
          amp: 0.06 + Math.random() * 0.45,
          ztravel: Math.random() < 0.3 ? 0.25 + Math.random() * 0.75 : 0.04,
          lifeOff: Math.random(),
        });
      }
      fillStrands(field, specs);
    }

    /* ── The red quote energy ── */
    const holdField = makeStrandField(HOLD_STRANDS, RED_SEGS);
    const breakField = makeStrandField(BREAK_STRANDS, RED_SEGS);
    const reformField = makeStrandField(BREAK_STRANDS, RED_SEGS);
    // Restrained: the red never outshines the blue system it travels through
    const holdMat = makeEnergyMaterial(RED.core, RED.glow, isSmall ? 120 : 100, 6, 0.5);
    holdMat.uniforms.uWidth.value = 0.03;
    holdMat.uniforms.uLifeSpeed.value = 0.1;
    holdMat.uniforms.uCorridor.value = new THREE.Vector2(0, 0.1); // letter edge energy is allowed everywhere on the line
    const breakMat = makeEnergyMaterial(RED.core, RED.glow, isSmall ? 95 : 78, 4.2, 0.85);
    breakMat.uniforms.uWidth.value = 0.042;
    breakMat.uniforms.uLifeSpeed.value = 0.16;
    breakMat.uniforms.uCorridor.value = new THREE.Vector2(0, 0.1);
    const reformMat = makeEnergyMaterial(RED.core, RED.glow, isSmall ? 95 : 78, 4.2, 0.95);
    reformMat.uniforms.uWidth.value = 0.042;
    reformMat.uniforms.uLifeSpeed.value = 0.13;
    reformMat.uniforms.uCorridor.value = new THREE.Vector2(0, 0.1);

    const holdMesh = new THREE.Mesh(holdField.geo, holdMat);
    const breakMesh = new THREE.Mesh(breakField.geo, breakMat);
    const reformMesh = new THREE.Mesh(reformField.geo, reformMat);
    for (const m of [holdMesh, breakMesh, reformMesh]) {
      m.frustumCulled = false;
      m.visible = false;
      m.renderOrder = 3;
      scene.add(m);
    }
    // All three ride the quote slot, so the strands always start exactly on
    // the letters and end exactly on the next letters.
    const quoteGroup = new THREE.Group();
    quoteGroup.add(holdMesh, breakMesh, reformMesh);
    scene.add(quoteGroup);

    /* ── The crisp quote line ── */
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true })!;
    const textMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), textMat);
    textPlane.renderOrder = 4;
    scene.add(textPlane);

    let sample: QuoteSample = { points: new Float32Array(0), count: 0, tex: null, widthPx: 1 };
    let quoteIndex = 0;

    function drawQuote(text: string): QuoteSample {
      const fontPx = 32;
      off.width = 8;
      off.height = 52;
      octx.font = `italic 400 ${fontPx}px "Source Serif 4", Georgia, serif`;
      type LS = { letterSpacing?: string };
      try { (octx as unknown as LS).letterSpacing = "0.06em"; } catch { /* older canvas */ }
      const w = Math.min(1400, Math.ceil(octx.measureText(text).width) + 12);
      off.width = w;
      octx.font = `italic 400 ${fontPx}px "Source Serif 4", Georgia, serif`;
      try { (octx as unknown as LS).letterSpacing = "0.06em"; } catch { /* older canvas */ }
      octx.textBaseline = "middle";
      octx.fillStyle = RED.text;
      octx.fillText(text, 6, off.height / 2);

      const tex = new THREE.CanvasTexture(off);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;

      const pts: number[] = [];
      const img = octx.getImageData(0, 0, w, off.height).data;
      const step = 2;
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < w; x += step) {
          if (img[(y * w + x) * 4 + 3] > 120) pts.push(x - w / 2, y - off.height / 2);
        }
      }
      return { points: new Float32Array(pts), count: pts.length / 2, tex, widthPx: w };
    }

    /* ── Screen-slot mapping (camera basis, so the strands stay glued to the
          letters under parallax) ── */
    let anchorRect: DOMRect | null = null;
    const _ray = new THREE.Vector3();
    const _p1 = new THREE.Vector3();
    const _right = new THREE.Vector3();
    const _up = new THREE.Vector3();
    const _fwd = new THREE.Vector3();
    const anchorPoint = new THREE.Vector3();
    let worldPerPx = 0.01;

    const rayToPlane = (ndcX: number, ndcY: number, out: THREE.Vector3) => {
      _ray.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
      const t = (0 - camera.position.z) / _ray.z;
      return out.copy(camera.position).addScaledVector(_ray, t);
    };
    const refreshAnchor = () => {
      const el = anchorRef.current;
      anchorRect = el && el.getBoundingClientRect().width > 0 ? el.getBoundingClientRect() : null;
    };
    const updateMapping = () => {
      if (!anchorRect) return;
      const cx = anchorRect.left + anchorRect.width / 2;
      const cy = anchorRect.top + anchorRect.height / 2;
      camera.updateMatrixWorld();
      rayToPlane((cx / vw()) * 2 - 1, -((cy / vh()) * 2 - 1), anchorPoint);
      rayToPlane(((cx + 2) / vw()) * 2 - 1, -((cy / vh()) * 2 - 1), _p1);
      worldPerPx = Math.max(1e-5, anchorPoint.distanceTo(_p1) / 2);
      const m = camera.matrixWorld.elements;
      _right.set(m[0], m[1], m[2]).normalize();
      _up.set(m[4], m[5], m[6]).normalize();
      _fwd.set(-m[8], -m[9], -m[10]).normalize();
    };
    const textWorldSize = () => {
      if (!anchorRect) return { w: 0, h: 0, k: 0.3 };
      const desiredPx = Math.max(11, Math.min(16, Math.round(anchorRect.height * 0.58)));
      const k = desiredPx / 32;
      return { w: sample.widthPx * k * worldPerPx, h: 52 * k * worldPerPx, k };
    };

    /* Sample a letterform point into the camera's right/up basis, in the
       quote group's local space. */
    const letterLocal = (i: number, k: number) => {
      const px = sample.points[i * 2] * k * worldPerPx;
      const py = -sample.points[i * 2 + 1] * k * worldPerPx;
      return { ox: px, oy: py };
    };

    /* ── Red strand sets ── */
    function buildHoldStrands() {
      const { w, h, k } = textWorldSize();
      const specs: StrandSpec[] = [];
      if (anchorRect && sample.count > 0) {
        const n = Math.min(HOLD_STRANDS, sample.count);
        for (let i = 0; i < n; i++) {
          const { ox, oy } = letterLocal(i, k);
          const dx = ox / (w * 0.5 || 1) + (Math.random() - 0.5) * 0.7;
          const dy = oy / (h * 0.5 || 1) + (Math.random() - 0.5) * 0.7;
          const l = Math.hypot(dx, dy) || 1;
          specs.push({
            ox, oy, oz: 0,
            dx: dx / l, dy: dy / l, dz: (Math.random() - 0.5) * 0.2,
            cx: (Math.random() - 0.5) * 0.05,
            cy: (Math.random() - 0.5) * 0.05,
            cz: (Math.random() - 0.5) * 0.03,
            len: 0.05 + Math.random() * 0.28,
            speed: 0.18 + Math.random() * 0.4,
            phase: Math.random(),
            bright: 0.2 + Math.random() * 0.3,
            freq: 2 + Math.random() * 3,
            amp: 0.008 + Math.random() * 0.02,
            ztravel: 0.01,
            lifeOff: Math.random(),
          });
        }
      }
      fillStrands(holdField, specs);
    }

    function buildBreakStrands() {
      const { w, h, k } = textWorldSize();
      const specs: StrandSpec[] = [];
      if (anchorRect && sample.count > 0) {
        for (let i = 0; i < Math.min(BREAK_STRANDS, sample.count); i++) {
          const { ox, oy } = letterLocal(i, k);
          // direction grows out of the letterform pixel itself
          const dx = ox / (w * 0.5 || 1) + (Math.random() - 0.5) * 1.1;
          const dy = oy / (h * 0.5 || 1) + (Math.random() - 0.5) * 1.1;
          const l = Math.hypot(dx, dy) || 1;
          specs.push({
            ox, oy, oz: 0,
            dx: dx / l, dy: dy / l, dz: (Math.random() - 0.5) * 1.6,
            cx: (Math.random() - 0.5) * 0.45,
            cy: (Math.random() - 0.5) * 0.3,
            cz: (Math.random() - 0.5) * 0.5,
            len: 0.9 + Math.random() * 2.7,
            speed: 0.3 + Math.random() * 0.5,
            phase: Math.random(),
            bright: 0.5 + Math.random() * 0.5,
            freq: 1 + Math.random() * 2.5,
            amp: 0.05 + Math.random() * 0.2,
            ztravel: 0.1 + Math.random() * 0.35,
            lifeOff: Math.random(),
          });
        }
      }
      fillStrands(breakField, specs);
    }

    function buildReformStrands() {
      const { w, h, k } = textWorldSize();
      const specs: StrandSpec[] = [];
      if (anchorRect && sample.count > 0) {
        for (let i = 0; i < Math.min(BREAK_STRANDS, sample.count); i++) {
          const { ox, oy } = letterLocal(i, k);
          // start dispersed through the surrounding space…
          const a = Math.random() * Math.PI * 2;
          const r = 0.8 + Math.random() * 2.4;
          const sx = ox + Math.cos(a) * r;
          const sy = oy + Math.sin(a) * r * 0.7;
          const sz = (Math.random() - 0.35) * 2.2;
          // …and run straight back onto the next letterform
          const dx = ox - sx, dy = oy - sy, dz = 0 - sz;
          const l = Math.hypot(dx, dy, dz) || 1;
          specs.push({
            ox: sx, oy: sy, oz: sz,
            dx: dx / l, dy: dy / l, dz: dz / l,
            cx: (Math.random() - 0.5) * 0.4,
            cy: (Math.random() - 0.5) * 0.3,
            cz: (Math.random() - 0.5) * 0.4,
            len: l * 1.04,
            speed: 0.32 + Math.random() * 0.55,
            phase: Math.random(),
            bright: 0.55 + Math.random() * 0.45,
            freq: 1 + Math.random() * 2.2,
            amp: 0.04 + Math.random() * 0.16,
            ztravel: 0.08 + Math.random() * 0.25,
            lifeOff: Math.random(),
          });
        }
      }
      fillStrands(reformField, specs);
    }

    /* ── Phase machine — 1.8s readable → 0.6s dissolve → 0.6s reform ── */
    const T_HOLD = reduceMotion ? 3.0 : 1.8;
    const T_OUT = reduceMotion ? 0.5 : 0.6;
    const T_GAP = 0;
    const T_IN = reduceMotion ? 0.5 : 0.6;
    type Phase = "hold" | "out" | "gap" | "in";
    let phase: Phase = "hold";
    let phaseT = 0;
    const strandsActive = !reduceMotion;

    /* ── Input — restrained parallax, fine pointers only ── */
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

    sample = drawQuote(quotes[0]);
    textMat.map = sample.tex;
    textMat.needsUpdate = true;
    // Mapping is needed before the first strand build
    camera.lookAt(0, 0.15, 0);
    camera.updateMatrixWorld();
    updateMapping();
    buildHoldStrands();

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        sample = drawQuote(quotes[quoteIndex]);
        textMat.map = sample.tex;
        textMat.needsUpdate = true;
        refreshAnchor();
        updateMapping();
        if (phase === "hold") buildHoldStrands();
      }).catch(() => {});
    }

    /* ── Loop ── */
    const clock = new THREE.Clock();
    let t = 0;
    let raf = 0;
    let running = true;

    // Rare, subtle shared pulse leaving the central source
    let nextPulse = 9 + Math.random() * 8;
    let pulseStart = -1;
    const PULSE_DUR = 3.4;

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

      /* Camera — slow parallax so the field has real depth */
      const driftX = reduceMotion ? 0 : Math.sin(t * 0.07) * 0.06;
      const driftY = reduceMotion ? 0 : Math.cos(t * 0.055) * 0.05;
      camera.position.x += (mouse.x * 0.26 + driftX - camera.position.x) * 0.045;
      camera.position.y += (0.2 + mouse.y * 0.13 + driftY - camera.position.y) * 0.045;
      camera.position.z += (7.2 + Math.sin(t * 0.045) * 0.08 - camera.position.z) * 0.045;
      camera.lookAt(mouse.x * 0.3, 0.15 + mouse.y * 0.14, 0);
      camera.updateMatrixWorld();
      updateMapping();

      /* Energy time — frozen under reduced motion */
      const et = reduceMotion ? 0 : t;
      fieldMat.uniforms.uTime.value = et;
      holdMat.uniforms.uTime.value = et;
      breakMat.uniforms.uTime.value = et;
      reformMat.uniforms.uTime.value = et;

      /* Rare shared pulse from the central source */
      if (strandsActive) {
        if (pulseStart < 0 && t >= nextPulse) pulseStart = t;
        if (pulseStart >= 0) {
          const p = (t - pulseStart) / PULSE_DUR;
          if (p >= 1) { pulseStart = -1; nextPulse = t + 11 + Math.random() * 10; }
          fieldMat.uniforms.uPulseT.value = p;
        } else {
          fieldMat.uniforms.uPulseT.value = -1;
        }
      }

      /* Phase machine */
      phaseT += dt;
      if (phase === "hold" && phaseT >= T_HOLD) {
        phase = "out"; phaseT = 0;
        if (strandsActive) buildBreakStrands();
      } else if (phase === "out" && phaseT >= T_OUT) {
        phase = "gap"; phaseT = 0;
        quoteIndex = (quoteIndex + 1) % quotes.length;
        sample = drawQuote(quotes[quoteIndex]);
        textMat.map = sample.tex;
        textMat.needsUpdate = true;
        if (strandsActive) buildReformStrands();
      } else if (phase === "gap" && phaseT >= T_GAP) {
        phase = "in"; phaseT = 0;
      } else if (phase === "in" && phaseT >= T_IN) {
        phase = "hold"; phaseT = 0;
        if (strandsActive) buildHoldStrands();
      }

      /* Strand visibility per phase */
      holdMesh.visible = strandsActive && phase === "hold";
      breakMesh.visible = strandsActive && phase === "out";
      reformMesh.visible = strandsActive && phase === "in";
      quoteGroup.position.copy(anchorPoint);
      quoteGroup.quaternion.copy(camera.quaternion);

      /* The quote line itself */
      if (anchorRect) {
        const { w, h } = textWorldSize();
        textPlane.position.copy(anchorPoint);
        textPlane.quaternion.copy(camera.quaternion);
        textPlane.scale.set(Math.max(w, 0.001), Math.max(h, 0.001), 1);
      }
      if (phase === "hold") {
        const target = textMat.map ? 1 : 0;
        textMat.opacity += (target - textMat.opacity) * Math.min(1, dt * 6);
      } else if (phase === "out") {
        // the letters lose their structure as the energy leaves them
        textMat.opacity = reduceMotion ? 1 - clamp01((phaseT / T_OUT) / 0.9) : 1 - clamp01((phaseT / T_OUT) / 0.62);
      } else if (phase === "gap") {
        textMat.opacity = 0;
      } else if (phase === "in") {
        // fully readable again once the energy has landed on the glyphs
        textMat.opacity = clamp01((phaseT / T_IN - 0.55) / 0.35);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (fine) window.removeEventListener("mousemove", onMouse);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
    // anchorRef and onUnavailable are stable per mount; the scene owns one loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}
