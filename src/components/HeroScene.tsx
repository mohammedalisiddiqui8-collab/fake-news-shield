import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

/* ─── HERO FRAGMENT FIELD + QUOTE TRANSFORMATION — floor pass ───────────
   Modelled on the reference: glossy red fragments resting on a wet,
   reflective ground and gathering into airborne swarms, seen from a low
   camera just above the surface. The floor is a real, semi-transparent
   plane with a mirrored copy of the field beneath it, so every fragment
   carries a dim reflection; shallow depth of field is sold with large soft
   bokeh sprites in the near foreground and fog falloff to the far plane.
   Fragments drift on independent multi-axis paths and are pulled toward
   wandering swarm anchors whose staggered activity envelopes produce the
   reference's gather → hold → disperse rhythm.

   The crimson quote beneath VERITAS shares the same language: the sampled
   letterform pixels themselves break into glowing fragments that travel
   through the volume and converge into the next line — never a fade and
   never a cloud drawn above the text. Timing per cycle: 1.8s readable →
   0.6s disintegrate → 0.6s disperse and reconstruct.

   Performance: instanced field + mirrored field, no postprocessing (glow is
   additive sprites), device-classed counts, loop pauses when the tab hides,
   and prefers-reduced-motion composes one still frame with a plain
   crossfading quote. ──────────────────────────────────────────────────── */

/* Crimson — the fragments, and the examined claim. Deep, never neon. */
const RED = { core: "#A84742", bright: "#C4574F", flare: "#E08A80", halo: "#7E2E2A" };
const FIELD_BG = 0x151618;
const FLOOR_Y = 0;

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

/* A wet, film-darkened surface with a soft warm sheen and faint streaks —
   the ground the fragments stand on. */
function makeFloorTexture(): THREE.CanvasTexture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0F1013";
  ctx.fillRect(0, 0, s, s);
  // warm sheen where the light pools
  const g = ctx.createRadialGradient(s * 0.5, s * 0.62, 0, s * 0.5, s * 0.62, s * 0.42);
  g.addColorStop(0, "rgba(150,120,84,0.16)");
  g.addColorStop(0.55, "rgba(120,100,80,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  // cool sheen opposite
  const g2 = ctx.createRadialGradient(s * 0.24, s * 0.34, 0, s * 0.24, s * 0.34, s * 0.4);
  g2.addColorStop(0, "rgba(120,140,170,0.10)");
  g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, s, s);
  // fine wet streaks
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#9AA7B8" : "#B39A72";
    const y = Math.random() * s;
    const x = Math.random() * s;
    const w = 20 + Math.random() * 120;
    ctx.fillRect(x, y, w, 1);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface QuoteSample {
  points: Float32Array; // x,y per point in offscreen-canvas px, origin at text centre
  count: number;
  tex: THREE.CanvasTexture | null;
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
    const FIELD_COUNT = reduceMotion ? 260 : isSmall ? 560 : 1500;
    const QUOTE_CAP = reduceMotion ? 0 : isSmall ? 360 : 620;
    const CLUSTER_COUNT = reduceMotion ? 3 : isSmall ? 4 : 7;
    const HOT_COUNT = reduceMotion ? 3 : isSmall ? 5 : 10;
    const BOKEH_COUNT = reduceMotion ? 0 : isSmall ? 4 : 9;

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
    scene.fog = new THREE.FogExp2(FIELD_BG, 0.075);

    const vw = () => container.clientWidth || 1;
    const vh = () => container.clientHeight || 1;
    // Low camera, just above the wet surface — the reference's viewpoint
    const camera = new THREE.PerspectiveCamera(42, vw() / vh(), 0.1, 60);
    camera.position.set(0, 0.62, 6.4);

    /* ── Light: cool ambience, warm key, red rim from the swarm ── */
    scene.add(new THREE.AmbientLight(0x2A3550, 0.5));
    const key = new THREE.DirectionalLight(0xF2E9DC, 1.15);
    key.position.set(3.4, 5.5, 3.2);
    scene.add(key);
    const rim = new THREE.PointLight(0xFF5A4A, 1.4, 22, 2);
    rim.position.set(0, 1.1, -2.5);
    scene.add(rim);

    /* ── The wet floor ── */
    const floorMat = new THREE.MeshBasicMaterial({
      map: makeFloorTexture(), transparent: true, opacity: 0.78, depthWrite: false,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 26), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, FLOOR_Y, -5);
    floor.renderOrder = 1;
    scene.add(floor);

    // Additive sheen lying on the surface — the wet highlight
    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 14),
      new THREE.MeshBasicMaterial({
        map: makeHaloTexture("#6E7A90"), transparent: true, opacity: 0.05,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
      })
    );
    sheen.rotation.x = -Math.PI / 2;
    sheen.position.set(0, FLOOR_Y + 0.01, -4.5);
    sheen.renderOrder = 2;
    scene.add(sheen);

    /* ── The fragment field — glossy, red, suspended through real depth ── */
    const fieldGeo = new THREE.BoxGeometry(1, 1, 1);
    const fragMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.22, metalness: 0.72,
      emissive: 0x1A0506, emissiveIntensity: 1,
    });
    const field = new THREE.InstancedMesh(fieldGeo, fragMat, FIELD_COUNT);
    field.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    field.renderOrder = 3;
    scene.add(field);

    // The mirrored copy below the surface — every fragment reflects
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.5, metalness: 0.5,
      emissive: 0x0A0203, emissiveIntensity: 1,
      transparent: true, opacity: 0.42, depthWrite: false,
    });
    const mirror = new THREE.InstancedMesh(fieldGeo, mirrorMat, FIELD_COUNT);
    mirror.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mirror.renderOrder = 0;
    scene.add(mirror);

    interface Cube {
      hx: number; hy: number; hz: number;      // home position
      size: number;
      cluster: number;                          // which swarm it belongs to
      soc: number; socP: number;                // sociability — when it joins a gather
      dax: number; day: number; daz: number;    // personal drift amplitudes
      dwx: number; dwy: number; dwz: number;    // personal drift speeds
      dpx: number; dpy: number; dpz: number;    // personal drift phases
      rx: number; ry: number; rSpeed: number;   // slow tumble
      prevx: number; prevy: number; prevz: number;
      hot: boolean;
    }
    const cubes: Cube[] = [];
    {
      const color = new THREE.Color();
      const mcolor = new THREE.Color();
      let guard = 0;
      while (cubes.length < FIELD_COUNT && guard++ < FIELD_COUNT * 40) {
        // Wide in depth: near fragments large, far ones almost dust
        const z = 3.2 - Math.pow(Math.random(), 0.62) * 16.5;
        const spreadX = 3.4 + (-z) * 0.62;
        const x = (Math.random() - 0.5) * 2 * spreadX;
        // Most rest on the surface; a minority hover and swarm
        const y = FLOOR_Y + 0.02 + Math.pow(Math.random(), 2.3) * 3.1;
        if (Math.abs(x) < 2.9 && y > 0.95 && y < 3.5 && z > -4.5) continue; // keep the title clear

        const depth = clamp01((-z + 13) / 13);
        const hot = Math.random() < 0.07;
        if (hot) {
          color.setHSL(0.02, 0.12, 0.72 + Math.random() * 0.14);
        } else {
          color.setHSL(0.004 + Math.random() * 0.018, 0.62 + Math.random() * 0.26, 0.24 + Math.random() * 0.2 + depth * 0.06);
        }
        field.setColorAt(cubes.length, color);
        // Reflections are dimmer and cooler
        mcolor.copy(color).multiplyScalar(0.34);
        mirror.setColorAt(cubes.length, mcolor);
        cubes.push({
          hx: x, hy: y, hz: z,
          size: 0.045 + Math.pow(Math.random(), 2.0) * 0.15 + (Math.random() < 0.05 ? 0.09 : 0),
          cluster: (Math.random() * CLUSTER_COUNT) | 0,
          soc: 0.05 + Math.random() * 0.11,
          socP: Math.random() * Math.PI * 2,
          dax: 0.05 + Math.random() * 0.32,
          day: 0.05 + Math.random() * 0.26,
          daz: 0.04 + Math.random() * 0.24,
          dwx: 0.05 + Math.random() * 0.3,
          dwy: 0.05 + Math.random() * 0.3,
          dwz: 0.05 + Math.random() * 0.28,
          dpx: Math.random() * Math.PI * 2,
          dpy: Math.random() * Math.PI * 2,
          dpz: Math.random() * Math.PI * 2,
          rx: Math.random() * Math.PI,
          ry: Math.random() * Math.PI,
          rSpeed: (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.55),
          prevx: x, prevy: y, prevz: z,
          hot,
        });
      }
      field.count = cubes.length;
      mirror.count = cubes.length;
      if (field.instanceColor) field.instanceColor.needsUpdate = true;
      if (mirror.instanceColor) mirror.instanceColor.needsUpdate = true;
    }

    /* ── Swarm anchors — wandering centres whose staggered activity envelopes
          give the field its gather → hold → disperse breathing. ── */
    const clusters = Array.from({ length: CLUSTER_COUNT }, (_, i) => ({
      ax: 2.4 + Math.random() * 3.4,
      ay: 0.5 + Math.random() * 1.9,
      az: 2.2 + Math.random() * 4.2,
      wx: 0.032 + Math.random() * 0.035,
      wy: 0.026 + Math.random() * 0.03,
      wz: 0.03 + Math.random() * 0.032,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      pz: Math.random() * Math.PI * 2,
      env: (i / CLUSTER_COUNT) * Math.PI * 2,
    }));
    const _anchor = new THREE.Vector3();
    const clusterPos = (ci: number, t: number) => {
      const c = clusters[ci];
      _anchor.set(
        Math.sin(t * c.wx + c.px) * c.ax,
        FLOOR_Y + 0.35 + Math.abs(Math.sin(t * c.wy + c.py)) * c.ay,
        Math.sin(t * c.wz + c.pz) * c.az - 3.2,
      );
      return _anchor;
    };
    const clusterActivity = (ci: number, t: number) => {
      const c = clusters[ci];
      return Math.pow(Math.max(0, Math.sin(t * 0.045 + c.env)), 1.5);
    };

    /* ── Quote fragments — one instanced pool, reused for break and reform ── */
    const quoteGeo = new THREE.BoxGeometry(1, 1, 1);
    const quoteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.3, metalness: 0.6,
      emissive: 0x5A1512, emissiveIntensity: 1.4,
      transparent: true, opacity: 0.95, depthWrite: false,
    });
    const quoteMesh = new THREE.InstancedMesh(quoteGeo, quoteMat, Math.max(QUOTE_CAP, 1));
    quoteMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    quoteMesh.renderOrder = 4;
    quoteMesh.count = 0;
    scene.add(quoteMesh);

    interface QP {
      ax: number; ay: number; az: number;  // letterform point (screen-space offsets)
      bx: number; by: number; bz: number;  // dispersed / origin point
      delay: number; dur: number; size: number;
      cx: number; cy: number; cz: number;  // curl keeps paths off straight lines
      seed: number;
      rx: number; ry: number; spin: number;
      col: THREE.Color;
    }
    const quoteParticles: QP[] = [];

    /* ── Sparks — embers of the dissolved quote carried into the field ── */
    const SPARKS = isSmall ? 8 : 16;
    const sparkMesh = new THREE.InstancedMesh(quoteGeo, new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.35, metalness: 0.5,
      emissive: 0x6A1A14, emissiveIntensity: 1.6,
      transparent: true, opacity: 0.9, depthWrite: false,
    }), SPARKS);
    sparkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sparkMesh.renderOrder = 4;
    sparkMesh.count = 0;
    scene.add(sparkMesh);
    const sparks = Array.from({ length: SPARKS }, () => ({
      sx: 0, sy: 0, sz: 0, tx: 0, ty: 0, tz: 0, t: 1, dur: 1.0, size: 0.03,
    }));

    /* ── Bloom points riding the hottest fragments ── */
    const hotHalos: { s: THREE.Sprite; ci: number }[] = [];
    {
      let assigned = 0;
      for (let i = 0; i < cubes.length && assigned < HOT_COUNT; i++) {
        if (!cubes[i].hot) continue;
        const s = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeHaloTexture("#8A3A32"), transparent: true,
          opacity: 0.16 + Math.random() * 0.12,
          blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
        }));
        const sc = 0.5 + Math.random() * 0.5;
        s.scale.set(sc, sc, 1);
        s.renderOrder = 2;
        scene.add(s);
        hotHalos.push({ s, ci: i });
        assigned++;
      }
    }

    /* Shallow depth of field — large soft blobs in the near foreground */
    const bokeh: { s: THREE.Sprite; bx: number; by: number; bz: number; w: number; p: number; base: number }[] = [];
    for (let i = 0; i < BOKEH_COUNT; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeHaloTexture("#5A322E"), transparent: true,
        opacity: 0.04 + Math.random() * 0.04,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
      }));
      const bx = (Math.random() - 0.5) * 9;
      const by = 0.15 + Math.random() * 1.5;
      const bz = 3.6 + Math.random() * 2.2;
      const sc = 1.0 + Math.random() * 1.6;
      s.scale.set(sc, sc, 1);
      s.position.set(bx, by, bz);
      s.renderOrder = 2;
      scene.add(s);
      bokeh.push({ s, bx, by, bz, w: 0.05 + Math.random() * 0.08, p: Math.random() * Math.PI * 2, base: s.material.opacity });
    }

    /* ── The quote itself — crisp canvas texture, pinned to the layout slot ── */
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true })!;
    const textMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), textMat);
    textPlane.renderOrder = 5;
    scene.add(textPlane);

    let sample: QuoteSample = { points: new Float32Array(0), count: 0, tex: null, widthPx: 1, heightPx: 1 };
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
      let points = new Float32Array(pts);
      if (points.length / 2 > QUOTE_CAP) {
        const stride = Math.ceil(points.length / 2 / QUOTE_CAP);
        const thinned: number[] = [];
        for (let i = 0; i < points.length / 2; i += stride) thinned.push(points[i * 2], points[i * 2 + 1]);
        points = new Float32Array(thinned);
      }
      return { points, count: points.length / 2, tex, widthPx: w, heightPx: off.height };
    }

    /* ── Screen-slot mapping for the tilted camera: ray → plane at z = 0 ── */
    let anchorRect: DOMRect | null = null;
    const _ray = new THREE.Vector3();
    const _p0 = new THREE.Vector3();
    const _p1 = new THREE.Vector3();
    const _right = new THREE.Vector3();
    const _up = new THREE.Vector3();
    const _fwd = new THREE.Vector3();
    const anchorPoint = new THREE.Vector3();
    let worldPerPx = 0.01;
    let anchorNdcX = 0;
    let anchorNdcY = 0;

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
      anchorNdcX = (cx / vw()) * 2 - 1;
      anchorNdcY = -((cy / vh()) * 2 - 1);
      camera.updateMatrixWorld();
      rayToPlane(anchorNdcX, anchorNdcY, anchorPoint);
      rayToPlane(anchorNdcX + 2 / vw(), anchorNdcY, _p1);
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
      return { w: sample.widthPx * k * worldPerPx, h: sample.heightPx * k * worldPerPx, k };
    };

    /* ── Phase machine — 1.8s readable → 0.6s disintegrate → 0.6s reform ── */
    const T_HOLD = reduceMotion ? 3.0 : 1.8;
    const T_OUT = reduceMotion ? 0.5 : 0.6;
    const T_GAP = 0;
    const T_IN = reduceMotion ? 0.5 : 0.6;
    type Phase = "hold" | "out" | "gap" | "in";
    let phase: Phase = "hold";
    let phaseT = 0;

    /* Offsets are stored in the camera's right/up basis so the fragments
       always land exactly on the glyphs, whatever the camera does. */
    const letterOffset = (i: number, k: number) => {
      const px = sample.points[i * 2] * k * worldPerPx;
      const py = -sample.points[i * 2 + 1] * k * worldPerPx;
      return { px, py };
    };

    function spawnDissolve() {
      quoteParticles.length = 0;
      if (!anchorRect || sample.count === 0) return;
      const { w, h, k } = textWorldSize();
      const s0 = Math.max(0.011, 1.9 * worldPerPx * (k / 0.3));
      for (let i = 0; i < sample.count; i++) {
        const { px, py } = letterOffset(i, k);
        // Direction grows out of the glyph pixel itself — never a cloud above
        const dx = px / (w * 0.5 || 1) + (Math.random() - 0.5) * 0.9;
        const dy = py / (h * 0.5 || 1) + (Math.random() - 0.5) * 0.9;
        const len = Math.hypot(dx, dy) || 1;
        const spread = 0.8 + Math.random() * 1.5;
        const sweep = (px / (w * 0.5 || 1) + 1) / 2;
        const flare = Math.random() < 0.15;
        quoteParticles.push({
          ax: px, ay: py, az: 0,
          bx: px + (dx / len) * spread,
          by: py + (dy / len) * spread,
          bz: (Math.random() - 0.5) * 2.2,
          delay: (1 - sweep) * 0.22 + Math.random() * 0.12,
          dur: 0.28 + Math.random() * 0.25,
          size: s0 * (0.7 + Math.random() * 0.6),
          cx: (Math.random() - 0.5) * 0.35,
          cy: (Math.random() - 0.5) * 0.35,
          cz: (Math.random() - 0.5) * 0.3,
          seed: Math.random() * Math.PI * 2,
          rx: Math.random() * Math.PI,
          ry: Math.random() * Math.PI,
          spin: 3 + Math.random() * 5,
          col: flare
            ? new THREE.Color(RED.bright).lerp(new THREE.Color(RED.flare), 0.65)
            : new THREE.Color(RED.core).lerp(new THREE.Color(RED.bright), Math.random() * 0.7),
        });
      }
      quoteMesh.count = Math.min(quoteParticles.length, QUOTE_CAP);
      for (let i = 0; i < quoteMesh.count; i++) quoteMesh.setColorAt(i, quoteParticles[i].col);
      if (quoteMesh.instanceColor) quoteMesh.instanceColor.needsUpdate = true;
    }

    function spawnFormation() {
      quoteParticles.length = 0;
      if (!anchorRect || sample.count === 0) return;
      const { w, k } = textWorldSize();
      const s0 = Math.max(0.011, 1.9 * worldPerPx * (k / 0.3));
      let minX = Infinity, maxX = -Infinity;
      for (let i = 0; i < sample.count; i++) {
        const px = sample.points[i * 2] * k * worldPerPx;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
      }
      for (let i = 0; i < sample.count; i++) {
        const { px, py } = letterOffset(i, k);
        // Converge from the surrounding volume — a quarter arrive from the field
        let ox: number, oy: number, oz: number;
        if (Math.random() < 0.25) {
          const c = cubes[(Math.random() * cubes.length) | 0];
          const dx = c.hx - anchorPoint.x, dy = c.hy - anchorPoint.y, dz = c.hz - anchorPoint.z;
          ox = dx * _right.x + dy * _right.y + dz * _right.z;
          oy = dx * _up.x + dy * _up.y + dz * _up.z;
          oz = dx * _fwd.x + dy * _fwd.y + dz * _fwd.z;
        } else {
          const a = Math.random() * Math.PI * 2;
          const r = 0.8 + Math.random() * 1.5;
          ox = Math.cos(a) * r;
          oy = Math.sin(a) * r * 0.6;
          oz = (Math.random() - 0.35) * 2.6;
        }
        const sweep = (px - minX) / (maxX - minX || 1);
        const flare = Math.random() < 0.15;
        quoteParticles.push({
          ax: px, ay: py, az: 0,
          bx: ox, by: oy, bz: oz,
          delay: sweep * 0.26 + Math.random() * 0.14,
          dur: 0.3 + Math.random() * 0.24,
          size: s0 * (0.7 + Math.random() * 0.6),
          cx: (Math.random() - 0.5) * 0.5,
          cy: (Math.random() - 0.5) * 0.35,
          cz: (Math.random() - 0.5) * 0.4,
          seed: Math.random() * Math.PI * 2,
          rx: Math.random() * Math.PI,
          ry: Math.random() * Math.PI,
          spin: 3 + Math.random() * 5,
          col: flare
            ? new THREE.Color(RED.bright).lerp(new THREE.Color(RED.flare), 0.65)
            : new THREE.Color(RED.bright).lerp(new THREE.Color(RED.core), Math.random() * 0.6),
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
        s.dur = 0.9 + Math.random() * 0.5;
        s.size = 0.016 + Math.random() * 0.018;
      }
      sparkMesh.count = SPARKS;
      const c = new THREE.Color(RED.bright);
      for (let i = 0; i < SPARKS; i++) sparkMesh.setColorAt(i, c);
      if (sparkMesh.instanceColor) sparkMesh.instanceColor.needsUpdate = true;
    }

    const dummy = new THREE.Object3D();
    const _dir = new THREE.Vector3();
    const _q = new THREE.Quaternion();
    const Z_AXIS = new THREE.Vector3(0, 0, 1);

    /* Place one fragment: home + swarm pull + personal drift + tumble, with
       the title corridor softened and near-camera motion stretch. */
    function placeCube(c: Cube, t: number, out: THREE.Object3D) {
      const act = clusterActivity(c.cluster, t);
      const mood = clamp01(0.5 + 0.5 * Math.sin(t * c.soc + c.socP));
      const pull = Math.pow(act * mood, 1.5) * 0.85;
      const a = clusterPos(c.cluster, t);
      const drift = 1 - 0.45 * pull;
      const x = c.hx + (a.x - c.hx) * pull + Math.sin(t * c.dwx + c.dpx) * c.dax * drift;
      const y = Math.max(FLOOR_Y + 0.02, c.hy + (a.y - c.hy) * pull + Math.cos(t * c.dwy + c.dpy) * c.day * drift);
      const z = c.hz + (a.z - c.hz) * pull + Math.sin(t * c.dwz + c.dpz) * c.daz * drift;

      // The title corridor — fragments fade rather than pop across it
      const corridorD = Math.max(Math.abs(x) - 2.9, FLOOR_Y + 0.95 - y, y - 3.5);
      const fade = clamp01(corridorD / 0.7);
      const scaleMul = 0.14 + 0.86 * fade;

      out.position.set(x, y, z);
      const vx = x - c.prevx, vy = y - c.prevy, vz = z - c.prevz;
      const vlen = Math.hypot(vx, vy, vz);
      if (z > 2.2 && vlen > 0.0008) {
        // Motion blur cue: near fragments stretch along their travel
        _dir.set(vx / vlen, vy / vlen, vz / vlen);
        _q.setFromUnitVectors(Z_AXIS, _dir);
        out.quaternion.copy(_q);
        const blur = Math.min(1.4, vlen * 20);
        out.scale.set(c.size * scaleMul, c.size * scaleMul, c.size * scaleMul * (1 + blur));
      } else {
        out.rotation.set(c.rx + t * c.rSpeed * 0.4, c.ry + t * c.rSpeed * 0.6, c.rx);
        out.scale.setScalar(c.size * scaleMul);
      }
      out.updateMatrix();
      c.prevx = x; c.prevy = y; c.prevz = z;
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

    // Draw immediately with whatever serif is loaded; the webfont redraw below
    // only re-measures once it actually lands.
    sample = drawQuote(quotes[0]);
    textMat.map = sample.tex;
    textMat.needsUpdate = true;

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
    const _p = new THREE.Vector3();
    const _mirrorDummy = new THREE.Object3D();
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

      /* Camera — low, drifting slightly along the surface */
      const driftX = reduceMotion ? 0 : Math.sin(t * 0.07) * 0.06;
      const driftZ = reduceMotion ? 0 : Math.cos(t * 0.05) * 0.06;
      camera.position.x += (mouse.x * 0.2 + driftX - camera.position.x) * 0.045;
      camera.position.y += (0.62 + mouse.y * 0.07 - camera.position.y) * 0.045;
      camera.position.z += (6.4 + driftZ - camera.position.z) * 0.045;
      camera.lookAt(mouse.x * 0.25, 1.15 + mouse.y * 0.12, -3.2);
      camera.updateMatrixWorld();
      updateMapping();

      /* The field + its reflection */
      if (!reduceMotion) {
        for (let i = 0; i < cubes.length; i++) {
          placeCube(cubes[i], t, dummy);
          field.setMatrixAt(i, dummy.matrix);
          // Mirror through the wet surface, slightly flattened
          _p.setFromMatrixPosition(dummy.matrix);
          _mirrorDummy.position.set(_p.x, 2 * FLOOR_Y - _p.y, _p.z);
          _mirrorDummy.quaternion.set(dummy.quaternion.x, -dummy.quaternion.y, dummy.quaternion.z, -dummy.quaternion.w);
          _mirrorDummy.scale.set(dummy.scale.x, dummy.scale.y * 1.35, dummy.scale.z);
          _mirrorDummy.updateMatrix();
          mirror.setMatrixAt(i, _mirrorDummy.matrix);
        }
        field.instanceMatrix.needsUpdate = true;
        mirror.instanceMatrix.needsUpdate = true;
      }

      /* Bloom points and bokeh drift */
      if (!reduceMotion) {
        for (let h = 0; h < hotHalos.length; h++) {
          const c = cubes[hotHalos[h].ci];
          if (!c) continue;
          hotHalos[h].s.position.set(
            c.hx + Math.sin(t * c.dwx + c.dpx) * c.dax,
            c.hy + Math.cos(t * c.dwy + c.dpy) * c.day,
            c.hz + Math.sin(t * c.dwz + c.dpz) * c.daz,
          );
          hotHalos[h].s.material.opacity = 0.14 + Math.sin(t * 0.7 + h * 2.1) * 0.06;
        }
        for (let i = 0; i < bokeh.length; i++) {
          const b = bokeh[i];
          b.s.position.set(b.bx + Math.sin(t * b.w + b.p) * 0.5, b.by + Math.cos(t * b.w * 0.8 + b.p) * 0.25, b.bz);
          b.s.material.opacity = b.base * (0.75 + Math.sin(t * 0.4 + b.p) * 0.25);
        }
      }

      /* Phase machine */
      phaseT += dt;
      if (phase === "hold" && phaseT >= T_HOLD) {
        phase = "out"; phaseT = 0;
        if (!reduceMotion) spawnDissolve();
      } else if (phase === "out" && phaseT >= T_OUT) {
        phase = "gap"; phaseT = 0;
        quoteIndex = (quoteIndex + 1) % quotes.length;
        sample = drawQuote(quotes[quoteIndex]);
        textMat.map = sample.tex;
        textMat.needsUpdate = true;
      } else if (phase === "gap" && phaseT >= T_GAP) {
        phase = "in"; phaseT = 0;
        if (!reduceMotion) { spawnFormation(); spawnSparks(); }
      } else if (phase === "in" && phaseT >= T_IN) {
        phase = "hold"; phaseT = 0;
      }

      /* The quote line — pinned to its slot, always facing the camera */
      if (anchorRect) {
        const { w, h } = textWorldSize();
        textPlane.position.copy(anchorPoint);
        textPlane.quaternion.copy(camera.quaternion);
        textPlane.scale.set(Math.max(w, 0.001), Math.max(h, 0.001), 1);
      }
      if (phase === "hold") {
        // No texture yet (font pipeline hiccup) — hold invisible rather than
        // show an untextured quad.
        const target = textMat.map ? 1 : 0;
        textMat.opacity += (target - textMat.opacity) * Math.min(1, dt * 6);
        quoteMat.emissiveIntensity = 1.4;
      } else if (phase === "out") {
        const p = phaseT / T_OUT;
        textMat.opacity = reduceMotion ? 1 - clamp01(p / 0.9) : 1 - clamp01(p / 0.3);
        quoteMat.emissiveIntensity = 2.6;
      } else if (phase === "gap") {
        textMat.opacity = 0;
        quoteMat.emissiveIntensity = 2.2;
      } else if (phase === "in") {
        const p = phaseT / T_IN;
        textMat.opacity = clamp01((p - 0.5) / 0.35);
        quoteMat.emissiveIntensity = 2.0;
      }
      rim.intensity = 1.4 + (textMat.opacity < 1 ? 0.9 : 0) + Math.sin(t * 0.6) * 0.15;
      sheen.material.opacity = 0.05 + Math.sin(t * 0.23) * 0.012;

      /* Quote fragments — letter points travelling through the volume */
      if (quoteMesh.count > 0) {
        const forming = phase === "in";
        for (let i = 0; i < quoteMesh.count; i++) {
          const q = quoteParticles[i];
          const p = clamp01((phaseT - q.delay) / q.dur);
          const e = forming ? EASE_OUT(p) : EASE_IN(p);
          const curl = Math.sin(p * Math.PI * 2 + q.seed);
          const ox = q.ax + (q.bx - q.ax) * e + curl * q.cx;
          const oy = q.ay + (q.by - q.ay) * e + curl * q.cy;
          const oz = q.az + (q.bz - q.az) * e + curl * q.cz;
          _p.copy(anchorPoint)
            .addScaledVector(_right, ox)
            .addScaledVector(_up, oy)
            .addScaledVector(_fwd, oz);
          dummy.position.copy(_p);
          // Stretch along travel while in motion — fragments read as streaks
          _dir.set(q.bx - q.ax, q.by - q.ay, q.bz - q.az);
          if (_dir.lengthSq() > 0.0001) {
            _dir.normalize();
            _q.setFromUnitVectors(Z_AXIS, _dir);
            dummy.quaternion.copy(_q);
            const stretch = 1 + (1 - e) * 0.9;
            dummy.scale.set(q.size, q.size, q.size * stretch);
          } else {
            dummy.rotation.set(q.rx + t * q.spin * (1 - e), q.ry - t * q.spin * 0.7 * (1 - e), q.seed);
            dummy.scale.setScalar(q.size);
          }
          const fade = forming ? 0.3 + 0.7 * Math.sin(clamp01(p) * Math.PI * 0.5) : 1 - p * 0.7;
          dummy.scale.multiplyScalar(Math.max(0.0001, fade));
          dummy.updateMatrix();
          quoteMesh.setMatrixAt(i, dummy.matrix);
        }
        quoteMesh.instanceMatrix.needsUpdate = true;
      }

      /* Sparks — absorbed into the field */
      if (sparkMesh.count > 0) {
        let alive = 0;
        for (let i = 0; i < SPARKS; i++) {
          const s = sparks[i];
          if (s.t < 1) s.t = Math.min(1, s.t + dt / s.dur);
          if (s.t < 1) alive++;
          const e = EASE_OUT(s.t);
          _p.copy(anchorPoint)
            .addScaledVector(_right, s.sx + (s.tx - s.sx) * e + Math.sin(s.t * 9 + i) * 0.06)
            .addScaledVector(_up, s.sy + (s.ty - s.sy) * e)
            .addScaledVector(_fwd, s.sz + (s.tz - s.sz) * e);
          dummy.position.copy(_p);
          dummy.rotation.set(i * 1.3 + t * 3, i * 0.7, 0);
          dummy.scale.setScalar(Math.max(0.0001, s.size * (1 - s.t)));
          dummy.updateMatrix();
          sparkMesh.setMatrixAt(i, dummy.matrix);
        }
        sparkMesh.instanceMatrix.needsUpdate = true;
        if (alive === 0) sparkMesh.count = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    /* Reduced motion: compose one still frame — same structure, no travel. */
    if (reduceMotion) {
      camera.lookAt(0, 1.15, -3.2);
      camera.updateMatrixWorld();
      updateMapping();
      for (let i = 0; i < cubes.length; i++) {
        placeCube(cubes[i], 0, dummy);
        field.setMatrixAt(i, dummy.matrix);
        _p.setFromMatrixPosition(dummy.matrix);
        _mirrorDummy.position.set(_p.x, 2 * FLOOR_Y - _p.y, _p.z);
        _mirrorDummy.quaternion.copy(dummy.quaternion);
        _mirrorDummy.scale.copy(dummy.scale);
        _mirrorDummy.updateMatrix();
        mirror.setMatrixAt(i, _mirrorDummy.matrix);
      }
      field.instanceMatrix.needsUpdate = true;
      mirror.instanceMatrix.needsUpdate = true;
    }

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
