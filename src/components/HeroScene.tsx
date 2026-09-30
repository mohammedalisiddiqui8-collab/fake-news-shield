import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { useEffect, useRef, type RefObject } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   VERITAS — hero environment (rebuild v2)

   The previous system drew ribbon geometry for every energy trace; on
   screen it read as thick black cartoon lines. This rebuild contains NO
   line, ribbon, stroke, or tube geometry of any kind. Every visual element
   is a point sprite, a soft per-fragment glow, or the canvas text plane.
   Energy is perceived, not drawn:

     1. Skylight   — a broad, barely-there blue wash that breathes (~23s).
     2. Dust field — hundreds of tiny blue glows at five depth tiers; the
                     "material" of the space. Camera parallax gives depth.
     3. Pulses     — a few soft lights travelling invisible curved paths,
                     brightening the dust they pass through. The only
                     visible "flow" — motion implied by light alone.
     4. Embers     — fine red particles sampled per-pixel from the actual
                     quote letterforms; they disperse and reform each cycle.
     5. Quote text — a crisp canvas-texture plane in the same DOM slot.

   The area behind VERITAS is kept quiet via a soft elliptical corridor the
   dust fades out of, computed live from the quote-anchor DOM rect.
   ═══════════════════════════════════════════════════════════════════════ */

const QUOTE_FONT = 'italic 300 32px "Source Serif 4", Georgia, serif';
const RED_TEXT = "#A84742";

const CORE = new Color("#DFF6FF");
const GLOW = new Color("#2B62C9");
const RED = new Color("#C8453B");

const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
const REDUCE_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const INTENSITY = isSmall ? 0.72 : 1;
/** Canvas px → on-screen px for the quote plane (32px glyphs ≈ 13px). */
const TEXT_SCALE = 0.4;

/* ─── Small helpers ───────────────────────────────────────────────────── */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0 before a, 1 after b, linear between. */
const ramp = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Crisp canvas rendering of the current quote (crimson, italic serif). */
function makeQuoteTexture(text: string): CanvasTexture {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) return new CanvasTexture(c);
  ctx.font = QUOTE_FONT;
  try {
    (ctx as unknown as { letterSpacing?: string }).letterSpacing = "0.07em";
  } catch {
    /* older canvas */
  }
  const w = Math.ceil(ctx.measureText(text).width) + 48;
  c.width = Math.max(8, w);
  c.height = 128;
  ctx.font = QUOTE_FONT;
  try {
    (ctx as unknown as { letterSpacing?: string }).letterSpacing = "0.07em";
  } catch {
    /* older canvas */
  }
  ctx.fillStyle = RED_TEXT;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/* ─── Letterform sampling: embers originate on actual glyph pixels ────── */

type Sample = { text: string; pts: Float32Array; count: number };

function sampleLetterforms(text: string, capW = 1400): Sample {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) return { text, pts: new Float32Array(0), count: 0 };
  ctx.font = QUOTE_FONT;
  try {
    (ctx as unknown as { letterSpacing?: string }).letterSpacing = "0.06em";
  } catch {
    /* older canvas */
  }
  const w = Math.ceil(ctx.measureText(text).width) + 64;
  c.width = Math.min(capW, Math.max(8, w));
  c.height = 96;
  ctx.font = QUOTE_FONT;
  try {
    (ctx as unknown as { letterSpacing?: string }).letterSpacing = "0.06em";
  } catch {
    /* older canvas */
  }
  ctx.fillStyle = RED_TEXT;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const pts: number[] = [];
  const step = 2;
  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      if (data[(y * c.width + x) * 4 + 3] > 120) {
        pts.push(x - c.width / 2, c.height / 2 - y, 0);
      }
    }
  }
  return { text, pts: new Float32Array(pts), count: pts.length / 3 };
}

/** Fill a glyph-slot buffer from a sample, wrapping if the sample is short. */
function loadGlyphs(target: Float32Array, sample: Sample, count: number) {
  const n = sample.count;
  if (n === 0) return;
  for (let i = 0; i < count; i++) {
    const j = i % n;
    target[i * 3] = sample.pts[j * 3];
    target[i * 3 + 1] = sample.pts[j * 3 + 1];
    target[i * 3 + 2] = sample.pts[j * 3 + 2];
  }
}

/* ─── Shaders ─────────────────────────────────────────────────────────── */

const DUST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPx;
  attribute float aSeed;
  attribute float aSize;
  attribute float aTier;
  varying float vTier;
  varying float vTwinkle;
  varying vec3 vWorld;
  void main() {
    vec3 p = position;
    float s = aSeed * 6.2831;
    // Slow individual drift; the x-stream wraps so the field never thins.
    p.x += sin(uTime * 0.037 + s) * 0.35 + uTime * 0.008;
    p.y += cos(uTime * 0.031 + s * 1.7) * 0.28;
    p.z += sin(uTime * 0.023 + s * 0.9) * 0.18;
    p.x = mod(p.x + 8.5, 17.0) - 8.5;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    gl_PointSize = max(aSize * uPx / -mv.z, 1.0);
    gl_Position = projectionMatrix * mv;
    vTier = aTier;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 0.11 + aSeed * 37.0);
  }
`;

const DUST_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uCore;
  uniform vec3 uGlow;
  uniform float uIntensity;
  uniform vec3 uPulsePos;
  uniform float uPulseI;
  uniform float uPulseR;
  uniform vec3 uClean;    // quiet-corridor centre (x, y)
  uniform vec2 uCleanWH;  // quiet-corridor half-extents
  varying float vTier;
  varying float vTwinkle;
  varying vec3 vWorld;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = exp(-d * d * 26.0);
    vec3 col = mix(uGlow, uCore, core);
    float base = 0.05 + vTier * 0.055;
    // Corridor: dust fades out of the ellipse behind the masthead.
    vec2 rel = (vWorld.xy - uClean.xy) / uCleanWH;
    float inside = 1.0 - smoothstep(1.0, 1.6, length(rel));
    float keepFar = mix(0.06, 0.34, clamp(vTier / 4.0, 0.0, 1.0));
    float clean = mix(1.0, keepFar, inside);
    // Pulse: nearby dust brightens as a light passes, then settles.
    float di = distance(vWorld, uPulsePos);
    float influence = uPulseI * exp(-di * di / (uPulseR * uPulseR));
    float alpha = (base + influence * 0.5) * vTwinkle * clean * uIntensity;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

const SPRITE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PULSE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5);
    float core = exp(-d * d * 30.0);
    float halo = exp(-d * d * 7.0);
    float flicker = 0.9 + 0.1 * sin(uTime * 3.0 + uSeed);
    float a = (core + halo * 0.22) * uOpacity * flicker;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const SKY_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uSeed;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float ex = (vUv.x - 0.35) / 0.62;
    float ey = (vUv.y - 0.55) / 0.62;
    float g = exp(-(ex * ex + ey * ey) * 2.1);
    float breathe = 0.82 + 0.18 * sin(uTime * 0.273 + uSeed);
    float a = g * uStrength * breathe;
    if (a < 0.002) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const EMBER_VERT = /* glsl */ `
  uniform float uPx;
  uniform float uP;     // dispersal progress: 0 formed → 1 field
  uniform float uT;     // phase-local time (drives per-particle jitter)
  uniform float uBoot;  // seconds since mount (entrance fade)
  attribute vec3 aTo;
  attribute float aDelay;
  attribute float aSeed;
  varying float vA;
  void main() {
    float pp = clamp((uP - aDelay * 0.3) / (1.0 - aDelay * 0.3), 0.0, 1.0);
    float e = 1.0 - pow(1.0 - pp, 3.0);
    vec3 p = mix(position, aTo, e);
    // Individual jitter — three unsynchronized frequencies per particle.
    float fs = aSeed * 6.2831;
    p.x += sin(uT * (0.8 + fract(aSeed * 7.31)) + fs) * 0.004;
    p.y += cos(uT * (1.1 + fract(aSeed * 3.97)) + fs * 1.6) * 0.003;
    p.z += sin(uT * (1.3 + fract(aSeed * 5.13)) + fs * 0.7) * 0.002;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = max(0.005 * uPx / -mv.z, 1.1);
    gl_Position = projectionMatrix * mv;
    vA = (1.0 - 0.38 * uP * sin(fs)) * clamp(uBoot * 2.0, 0.0, 1.0);
  }
`;

const EMBER_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = exp(-d * d * 30.0);
    float halo = exp(-d * d * 7.0);
    float a = (core + halo * 0.18) * vA * uAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

/* ─── Component ───────────────────────────────────────────────────────── */

type Phase = "hold" | "out" | "in";

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

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      onUnavailable?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.75 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;";
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0, 5.2);

    const disposers: Array<() => void> = [];
    const track = <T extends { dispose(): void }>(r: T): T => {
      disposers.push(() => r.dispose());
      return r;
    };

    /* ─── 1 · Skylight (atmosphere) ─── */
    const skyGeo = track(new PlaneGeometry(30, 17));
    const makeSky = (seed: number, strength: number, dark: number) => {
      const mat = track(
        new ShaderMaterial({
          uniforms: {
            uColor: { value: GLOW.clone().lerp(new Color("#0A0F1E"), dark) },
            uTime: { value: 0 },
            uSeed: { value: seed },
            uStrength: { value: strength },
          },
          vertexShader: SPRITE_VERT,
          fragmentShader: SKY_FRAG,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
        }),
      );
      return mat;
    };
    const skyMatA = makeSky(3.7, isSmall ? 0.05 : 0.085, 0.55);
    const skyMatB = makeSky(9.2, isSmall ? 0.032 : 0.055, 0.62);
    const skyA = new Mesh(skyGeo, skyMatA);
    skyA.position.set(2.4, 1.1, -8.9);
    const skyB = new Mesh(skyGeo, skyMatB);
    skyB.position.set(-3.1, -0.9, -9.2);
    scene.add(skyA, skyB);

    /* ─── 2 · Dust field ─── */
    const N = isSmall ? 240 : 500;
    const dPos = new Float32Array(N * 3);
    const dSeed = new Float32Array(N);
    const dSize = new Float32Array(N);
    const dTier = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      dPos[i * 3 + 0] = (Math.random() - 0.5) * 17;
      dPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      dPos[i * 3 + 2] = -2 - Math.random() * 7;
      dSeed[i] = Math.random();
      const t = Math.random();
      const tier = t < 0.35 ? 0 : t < 0.62 ? 1 : t < 0.84 ? 2 : t < 0.96 ? 3 : 4;
      dTier[i] = tier;
      dSize[i] = [0.0035, 0.005, 0.007, 0.01, 0.016][tier];
    }
    const dustGeo = track(new BufferGeometry());
    dustGeo.setAttribute("position", track(new BufferAttribute(dPos, 3)));
    dustGeo.setAttribute("aSeed", track(new BufferAttribute(dSeed, 1)));
    dustGeo.setAttribute("aSize", track(new BufferAttribute(dSize, 1)));
    dustGeo.setAttribute("aTier", track(new BufferAttribute(dTier, 1)));
    const dustMat = track(
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPx: { value: 1 },
          uCore: { value: CORE },
          uGlow: { value: GLOW },
          uIntensity: { value: INTENSITY },
          uPulsePos: { value: new Vector3(999, 0, -99) },
          uPulseI: { value: 0 },
          uPulseR: { value: 0.75 },
          uClean: { value: new Vector3(0, 0, 0) },
          uCleanWH: { value: new Vector2(2.4, 1.2) },
        },
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
      }),
    );
    const dust = new Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);

    /* ─── 3 · Light pulses (no stroke — sprite pair + dust brightening) ── */
    type PulseSlot = {
      group: Group;
      coreMat: ShaderMaterial;
      haloMat: ShaderMaterial;
      from: Vector3;
      via: Vector3;
      to: Vector3;
      t: number;
      dur: number;
      delayUntil: number;
      alive: boolean;
    };

    const pulseSlots: PulseSlot[] = [];
    const pulseSpriteGeo = track(new PlaneGeometry(1, 1));
    const makePulseMat = (color: Color) =>
      track(
        new ShaderMaterial({
          uniforms: {
            uColor: { value: color },
            uOpacity: { value: 0 },
            uSeed: { value: Math.random() * 100 },
            uTime: { value: 0 },
          },
          vertexShader: SPRITE_VERT,
          fragmentShader: PULSE_FRAG,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
        }),
      );
    for (let i = 0; i < (isSmall ? 2 : 4); i++) {
      const group = new Group();
      const core = new Mesh(pulseSpriteGeo, makePulseMat(CORE));
      const halo = new Mesh(pulseSpriteGeo, makePulseMat(GLOW));
      core.scale.setScalar(isSmall ? 0.16 : 0.22);
      halo.scale.setScalar(isSmall ? 0.5 : 0.7);
      group.add(core, halo);
      group.visible = false;
      scene.add(group);
      pulseSlots.push({
        group,
        coreMat: core.material as ShaderMaterial,
        haloMat: halo.material as ShaderMaterial,
        from: new Vector3(),
        via: new Vector3(),
        to: new Vector3(),
        t: 0,
        dur: 0,
        delayUntil: 2 + i * 2.6,
        alive: false,
      });
    }

    /* ─── 4 · Ember system (quote particles) ─── */
    const COUNT = isSmall ? 1200 : 2600;
    const ePos = new Float32Array(COUNT * 3); // current glyph slots / dispersed field
    const eTo = new Float32Array(COUNT * 3); // transition targets
    const eDir = new Float32Array(COUNT * 3); // dispersal direction, magnitude baked in
    const eDelay = new Float32Array(COUNT);
    const eSeed = new Float32Array(COUNT);

    let currentSample = sampleLetterforms(quotes[0] ?? "");
    loadGlyphs(ePos, currentSample, COUNT);
    eTo.set(ePos);
    for (let i = 0; i < COUNT; i++) {
      const dx = Math.random() * 2 - 1;
      const dy = Math.random() * 2 - 0.6;
      const dz = Math.random() * 2 - 1;
      const len = Math.hypot(dx, dy, dz) || 1;
      const mag = 0.18 + Math.random() * 0.22;
      eDir[i * 3] = (dx / len) * mag;
      eDir[i * 3 + 1] = (dy / len) * mag + 0.05;
      eDir[i * 3 + 2] = (dz / len) * mag * 0.6;
      eDelay[i] = Math.random() * 0.18;
      eSeed[i] = Math.random() * 1000;
    }

    const emberGeo = track(new BufferGeometry());
    emberGeo.setAttribute("position", track(new BufferAttribute(ePos, 3)));
    emberGeo.setAttribute("aTo", track(new BufferAttribute(eTo, 3)));
    emberGeo.setAttribute("aDelay", track(new BufferAttribute(eDelay, 1)));
    emberGeo.setAttribute("aSeed", track(new BufferAttribute(eSeed, 1)));
    const emberMat = track(
      new ShaderMaterial({
        uniforms: {
          uPx: { value: 1 },
          uP: { value: 0 },
          uT: { value: 0 },
          uBoot: { value: 0 },
          uColor: { value: RED },
          uAlpha: { value: 0.5 },
        },
        vertexShader: EMBER_VERT,
        fragmentShader: EMBER_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
      }),
    );
    const embers = new Points(emberGeo, emberMat);
    embers.frustumCulled = false;
    embers.visible = currentSample.count > 0 && !REDUCE_MOTION;
    // Render only as many particles as the current quote actually sampled —
    // wrapped duplicates would read as brighter specks on the letterforms.
    const syncDrawRange = () =>
      embers.geometry.setDrawRange(0, Math.min(COUNT, currentSample.count));
    syncDrawRange();
    embers.renderOrder = 5;
    scene.add(embers);

    /* ─── 5 · Quote text plane ─── */
    const textMat = track(
      new MeshBasicMaterial({
        map: makeQuoteTexture(currentSample.text),
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    );
    disposers.push(() => textMat.map?.dispose());
    const setMap = (tex: CanvasTexture) => {
      const old = textMat.map;
      textMat.map = tex;
      textMat.needsUpdate = true;
      old?.dispose();
    };
    const textGeo = track(new PlaneGeometry(1, 1));
    const textMesh = new Mesh(textGeo, textMat);
    textMesh.renderOrder = 10;
    scene.add(textMesh);

    /* ─── Anchor mapping: text plane + quiet corridor follow the DOM ─── */
    const anchorPoint = new Vector3();
    const _ray = new Raycaster();
    const _ndc = new Vector2();
    const rayToPlane = (ndcX: number, ndcY: number, out: Vector3) => {
      _ndc.set(ndcX, ndcY);
      _ray.setFromCamera(_ndc, camera);
      const t = -_ray.ray.origin.z / _ray.ray.direction.z;
      out.copy(_ray.ray.origin).addScaledVector(_ray.ray.direction, t);
      return out;
    };

    // Mirrors the dust shader's quiet corridor so pulses path around it too.
    const corridor = { x: 0, y: 0, w: 2.4, h: 1.2 };

    const updateMapping = () => {
      const el = anchorRef.current;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      if (!el || vh === 0 || vw === 0) return;
      const worldH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const worldPerPx = worldH / vh;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      rayToPlane((cx / vw) * 2 - 1, -((cy / vh) * 2 - 1), anchorPoint);
      textMesh.position.set(anchorPoint.x, anchorPoint.y, 0);
      const iw = (textMat.map?.image as HTMLCanvasElement | undefined)?.width ?? 8;
      textMesh.scale.set(iw * worldPerPx * TEXT_SCALE, 128 * worldPerPx * TEXT_SCALE, 1);
      // Quiet corridor: soft ellipse over masthead + rules + quote zone.
      const cleanHalfW = Math.max(r.width / 2 + 48, 0.34 * vw) * worldPerPx;
      const cleanHalfH = 0.19 * vh * worldPerPx;
      const u = dustMat.uniforms;
      u.uClean.value.set((cx - vw / 2) * worldPerPx, (cy - vh * 0.11 - vh / 2) * worldPerPx, 0);
      u.uCleanWH.value.set(cleanHalfW, cleanHalfH);
      corridor.x = u.uClean.value.x;
      corridor.y = u.uClean.value.y;
      corridor.w = cleanHalfW;
      corridor.h = cleanHalfH;
    };

    /* ─── Pulse paths (invisible quadratic Béziers around the corridor) ── */
    const _tmp = new Vector3();
    const edgePoint = (z: number, out: Vector3) => {
      const dist = camera.position.z - z;
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * dist;
      const halfW = halfH * camera.aspect;
      const e = Math.floor(Math.random() * 4);
      const f = Math.random() * 1.7 - 0.85;
      if (e === 0) out.set(f * halfW, halfH + 0.3, z);
      else if (e === 1) out.set(f * halfW, -halfH - 0.3, z);
      else if (e === 2) out.set(-halfW - 0.3, f * halfH, z);
      else out.set(halfW + 0.3, f * halfH, z);
      return out;
    };
    const spawnPulse = (slot: PulseSlot, now: number) => {
      const z = -1.0 - Math.random() * 2.5;
      edgePoint(z, slot.from);
      edgePoint(z, slot.to);
      slot.via
        .addVectors(slot.from, slot.to)
        .multiplyScalar(0.5)
        .add(
          _tmp.set(
            (Math.random() * 2 - 1) * 0.8,
            (Math.random() * 2 - 1) * 0.8,
            (Math.random() * 2 - 1) * 0.2,
          ),
        );
      // Nudge the via point out of the quiet corridor.
      for (let k = 0; k < 4; k++) {
        const dx = (slot.via.x - corridor.x) / (corridor.w * 1.1);
        const dy = (slot.via.y - corridor.y) / (corridor.h * 1.1);
        const q = dx * dx + dy * dy;
        if (q >= 1) break;
        const s = (1 / Math.sqrt(q || 1e-4)) * 1.1;
        slot.via.x = corridor.x + dx * s * corridor.w * 1.1;
        slot.via.y = corridor.y + dy * s * corridor.h * 1.1;
      }
      slot.t = 0;
      slot.dur = (isSmall ? 16 : 14) + Math.random() * 8;
      slot.delayUntil = now + slot.dur + 3 + Math.random() * 6;
      slot.alive = true;
      slot.group.visible = true;
    };
    const quadBezier = (a: Vector3, b: Vector3, c: Vector3, t: number, out: Vector3) => {
      const it = 1 - t;
      out.set(
        it * it * a.x + 2 * it * t * b.x + t * t * c.x,
        it * it * a.y + 2 * it * t * b.y + t * t * c.y,
        it * it * a.z + 2 * it * t * b.z + t * t * c.z,
      );
      return out;
    };

    /* ─── Camera parallax ─── */
    const pointer = { x: 0, y: 0 };
    let pointerTracked = false;
    let parallaxBlend = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerTracked = true;
    };

    /* ─── Loop ─── */
    const clock = new Clock(true);
    let elapsed = 0;
    let paused = document.hidden;
    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) clock.getDelta();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const T = {
      hold: REDUCE_MOTION ? 3.0 : 1.8,
      out: REDUCE_MOTION ? 0.22 : 0.6,
      in: REDUCE_MOTION ? 0.22 : 0.6,
    };
    let phase: Phase = "hold";
    let phaseT = 0;
    let quoteIdx = 0;
    const _head = new Vector3();
    const _best = new Vector3();

    const applyPx = () => {
      const p =
        (renderer.getPixelRatio() * window.innerHeight) /
        (2 * Math.tan((camera.fov * Math.PI) / 360));
      dustMat.uniforms.uPx.value = p;
      emberMat.uniforms.uPx.value = p;
    };

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      applyPx();
      updateMapping();
    };
    onResize();
    window.addEventListener("resize", onResize);

    const posAttr = emberGeo.getAttribute("position") as BufferAttribute;
    const toAttr = emberGeo.getAttribute("aTo") as BufferAttribute;

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (paused) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!REDUCE_MOTION) elapsed += dt;

      // Camera — autonomous drift, blending to pointer parallax over ~2s.
      parallaxBlend = Math.min(1, parallaxBlend + (pointerTracked ? dt / 2 : 0));
      const driftX = Math.sin(elapsed * 0.05) * 0.05;
      const driftY = Math.cos(elapsed * 0.041) * 0.03;
      const tx = MathUtils.lerp(driftX, pointer.x * 0.14, parallaxBlend);
      const ty = MathUtils.lerp(driftY, pointer.y * 0.08, parallaxBlend);
      camera.position.x += (tx - camera.position.x) * Math.min(1, dt * 2.5);
      camera.position.y += (ty - camera.position.y) * Math.min(1, dt * 2.5);
      camera.lookAt(0, 0, 0);

      // Atmosphere + dust
      skyMatA.uniforms.uTime.value = elapsed;
      skyMatB.uniforms.uTime.value = elapsed;
      dustMat.uniforms.uTime.value = elapsed;

      // Pulses
      let bestEnv = 0;
      for (const slot of pulseSlots) {
        if (!slot.alive && !REDUCE_MOTION && elapsed >= slot.delayUntil) {
          spawnPulse(slot, elapsed);
        }
        if (!slot.alive) continue;
        slot.t += dt;
        const env = ramp(slot.t, 0, 3) * (1 - ramp(slot.t, slot.dur - 3, slot.dur));
        quadBezier(slot.from, slot.via, slot.to, easeInOutSine(clamp01(slot.t / slot.dur)), _head);
        slot.group.position.copy(_head);
        slot.coreMat.uniforms.uTime.value = elapsed;
        slot.haloMat.uniforms.uTime.value = elapsed;
        slot.coreMat.uniforms.uOpacity.value = 0.5 * env * INTENSITY;
        slot.haloMat.uniforms.uOpacity.value = 0.14 * env * INTENSITY;
        if (env > bestEnv) {
          bestEnv = env;
          _best.copy(_head);
        }
        if (slot.t >= slot.dur) {
          slot.alive = false;
          slot.group.visible = false;
          slot.coreMat.uniforms.uOpacity.value = 0;
          slot.haloMat.uniforms.uOpacity.value = 0;
        }
      }
      const dustU = dustMat.uniforms;
      if (bestEnv > 0) {
        dustU.uPulsePos.value.copy(_best);
        dustU.uPulseI.value = bestEnv * 0.85;
      } else {
        dustU.uPulseI.value = 0;
      }

      // Ember phase machine — drives the quote cycle.
      phaseT += dt;
      const eu = emberMat.uniforms;
      eu.uT.value = phaseT;
      eu.uBoot.value = elapsed;
      // Reduced motion has no elapsed time — the text must not stay hidden.
      const boot = REDUCE_MOTION ? 1 : Math.min(1, elapsed / 0.8);
      if (phase === "hold") {
        eu.uP.value = 0;
        eu.uAlpha.value = 0.5;
        textMat.opacity = (REDUCE_MOTION ? 1 : 0.92) * boot;
        if (phaseT >= T.hold) {
          phase = "out";
          phaseT = 0;
          if (quotes.length > 1) quoteIdx = (quoteIdx + 1) % quotes.length;
          if (!REDUCE_MOTION) {
            // Dispersal targets: current glyphs pushed along per-particle dirs.
            for (let i = 0; i < COUNT * 3; i++) eTo[i] = ePos[i] + eDir[i];
            toAttr.needsUpdate = true;
            eu.uAlpha.value = 0.85;
          }
        }
      } else if (phase === "out") {
        const k = clamp01(phaseT / T.out);
        eu.uP.value = easeOutCubic(k);
        textMat.opacity = 0.92 * (1 - easeOutCubic(k)) * boot;
        if (phaseT >= T.out) {
          phase = "in";
          phaseT = 0;
          // The dispersed field becomes the origin; the next quote's glyphs
          // become the target. The text swaps at the field's faintest moment.
          ePos.set(eTo);
          posAttr.needsUpdate = true;
          const nextSample = sampleLetterforms(quotes[quoteIdx]);
          if (nextSample.count > 0) {
            loadGlyphs(eTo, nextSample, COUNT);
            currentSample = nextSample;
          } else {
            loadGlyphs(eTo, currentSample, COUNT);
          }
          syncDrawRange();
          toAttr.needsUpdate = true;
          setMap(makeQuoteTexture(quotes[quoteIdx]));
          updateMapping();
        }
      } else {
        const k = clamp01(phaseT / T.in);
        eu.uP.value = 1 - easeOutCubic(k);
        eu.uAlpha.value = 0.85;
        textMat.opacity = 0.92 * easeOutCubic(k) * boot;
        if (phaseT >= T.in) {
          phase = "hold";
          phaseT = 0;
        }
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    /* ─── Fonts settle → resample once (mid-hold only, never mid-transition) */
    let fontsSettled = false;
    document.fonts.ready.then(() => {
      if (fontsSettled) return;
      fontsSettled = true;
      if (phase === "hold") {
        const settled = sampleLetterforms(quotes[quoteIdx]);
        if (settled.count > 0) {
          currentSample = settled;
          loadGlyphs(ePos, settled, COUNT);
          loadGlyphs(eTo, settled, COUNT);
          posAttr.needsUpdate = true;
          toAttr.needsUpdate = true;
          syncDrawRange();
        }
      }
      setMap(makeQuoteTexture(quotes[quoteIdx]));
      updateMapping();
    });

    window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const d of disposers) d();
      renderer.dispose();
      renderer.forceContextLoss?.();
      container.removeChild(renderer.domElement);
    };
    // anchorRef and onUnavailable are stable per mount; the scene owns one loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRef, quotes, onUnavailable]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}
