import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

/* ─── HERO CUBE FIELD + QUOTE TRANSFORMATION — reference pass ───────────
   The field is modelled on the fragment-swarm reference: a deep volume of
   very small luminous cubes that alternates between quiet scattering and
   dense converging swarms. Each cube drifts on its own multi-axis path,
   tumbles slowly, and is pulled toward wandering cluster anchors whose
   "activity envelopes" take turns — so masses gather, hold, and disperse
   organically instead of looping. Depth is sold with fog falloff, per-cube
   brightness by distance, near-camera velocity stretch (motion blur), fake
   DOF bokeh sprites, and a handful of white-hot bloom points riding their
   own cubes.

   The crimson quote beneath VERITAS shares the same language: the letter-
   forms themselves break into glowing particles that travel through the
   volume and converge into the next line — never a fade or a separate
   cloud. Timing per cycle: 1.8s readable → 0.6s disintegrate → 0.6s
   disperse and reconstruct.

   Performance: three InstancedMeshes, no postprocessing (glow is additive
   sprites), device-classed counts, loop pauses when the tab hides, and
   prefers-reduced-motion gets a composed-once still field with a plain
   crossfading quote. ──────────────────────────────────────────────────── */

/* Crimson — the examined claim. Deep, restrained, never neon. */
const RED = { core: "#A84742", bright: "#C4574F", flare: "#E08A80", halo: "#7E2E2A" };
/* Blue — the digital environment. */
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
  aspect: number;
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
    const FIELD_COUNT = reduceMotion ? 240 : isSmall ? 520 : 1400;
    const QUOTE_CAP = reduceMotion ? 0 : isSmall ? 360 : 620;
    const CLUSTER_COUNT = reduceMotion ? 3 : isSmall ? 4 : 7;
    const HOT_COUNT = reduceMotion ? 3 : isSmall ? 5 : 10;
    const BOKEH_COUNT = reduceMotion ? 0 : isSmall ? 3 : 8;

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
    scene.fog = new THREE.FogExp2(FIELD_BG, 0.085);

    const vw = () => container.clientWidth || 1;
    const vh = () => container.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(42, vw() / vh(), 0.1, 60);
    camera.position.set(0, 0, 7.2);

    /* ── The field — fragments suspended through genuine depth ── */
    const fieldGeo = new THREE.BoxGeometry(1, 1, 1);
    const fieldMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const field = new THREE.InstancedMesh(fieldGeo, fieldMat, FIELD_COUNT);
    field.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    field.renderOrder = 1;
    scene.add(field);

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
      let guard = 0;
      while (cubes.length < FIELD_COUNT && guard++ < FIELD_COUNT * 40) {
        // Spherical shell around the composition, biased outward
        const r = 1.9 + Math.pow(Math.random(), 0.6) * 7.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta) * 0.72;
        const z = r * Math.cos(phi) * 0.62 + (Math.random() - 0.4) * 1.6;
        if (z > 2.6) continue;
        // Keep the central typography corridor clear at rest
        if (Math.abs(z) < 1.3 && Math.abs(x) < 2.5 && Math.abs(y) < 1.75) continue;

        const depth = clamp01((9.5 - r) / 9.5);
        const hot = Math.random() < 0.07;
        if (hot) {
          // White-hot fragments — the blown-out highlights in the reference
          color.setHSL(0.55 + Math.random() * 0.04, 0.35, 0.78 + Math.random() * 0.12);
        } else {
          color.setHSL(0.575 + Math.random() * 0.055, 0.6 + Math.random() * 0.3, 0.3 + depth * 0.34);
        }
        cubes.push({
          hx: x, hy: y, hz: z,
          size: 0.014 + Math.pow(Math.random(), 2.4) * 0.034 + (Math.random() < 0.045 ? 0.025 : 0),
          cluster: (Math.random() * CLUSTER_COUNT) | 0,
          soc: 0.05 + Math.random() * 0.11,
          socP: Math.random() * Math.PI * 2,
          dax: 0.05 + Math.random() * 0.34,
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
        field.setColorAt(cubes.length - 1, color);
      }
      field.count = cubes.length;
      if (field.instanceColor) field.instanceColor.needsUpdate = true;
    }

    /* ── Cluster anchors — wandering swarm centres. Their staggered activity
          envelopes produce the reference's gather → hold → disperse rhythm:
          the field breathes between sparse and dense. ── */
    const clusters = Array.from({ length: CLUSTER_COUNT }, (_, i) => ({
      ax: 3.2 + Math.random() * 2.0,
      ay: 2.0 + Math.random() * 1.0,
      az: 2.0 + Math.random() * 1.2,
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
        Math.sin(t * c.wy + c.py) * c.ay,
        Math.sin(t * c.wz + c.pz) * c.az,
      );
      return _anchor;
    };
    const clusterActivity = (ci: number, t: number) => {
      const c = clusters[ci];
      return Math.pow(Math.max(0, Math.sin(t * 0.045 + c.env)), 1.5);
    };

    /* ── Quote particles — one instanced pool reused for dissolve + formation.
          Every particle originates from a sampled letterform pixel. ── */
    const quoteGeo = new THREE.BoxGeometry(1, 1, 1);
    const quoteMat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.95, depthWrite: false });
    const quoteMesh = new THREE.InstancedMesh(quoteGeo, quoteMat, Math.max(QUOTE_CAP, 1));
    quoteMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    quoteMesh.renderOrder = 2;
    quoteMesh.count = 0;
    scene.add(quoteMesh);

    interface QP {
      sx: number; sy: number; sz: number;
      tx: number; ty: number; tz: number;
      delay: number; dur: number; size: number;
      cx: number; cy: number; cz: number;
      seed: number;
      rx: number; ry: number; spin: number;
      col: THREE.Color;
    }
    const quoteParticles: QP[] = [];

    /* ── Sparks — embers of the dissolved quote carried into the field ── */
    const SPARKS = isSmall ? 8 : 16;
    const sparkMesh = new THREE.InstancedMesh(quoteGeo, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.9, depthWrite: false }), SPARKS);
    sparkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sparkMesh.renderOrder = 2;
    sparkMesh.count = 0;
    scene.add(sparkMesh);
    const sparks = Array.from({ length: SPARKS }, () => ({
      sx: 0, sy: 0, sz: 0, tx: 0, ty: 0, tz: 0, t: 1, dur: 1.1, size: 0.028,
    }));

    /* ── Glow — additive sprites instead of postprocessing ── */
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

    /* Bloom points — tiny halos riding the hot cubes */
    const hotHalos: { s: THREE.Sprite; ci: number }[] = [];
    {
      let assigned = 0;
      for (let i = 0; i < cubes.length && assigned < HOT_COUNT; i++) {
        if (!cubes[i].hot) continue;
        const s = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeHaloTexture("#3A5E92"), transparent: true,
          opacity: 0.16 + Math.random() * 0.12,
          blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
        }));
        const sc = 0.5 + Math.random() * 0.5;
        s.scale.set(sc, sc, 1);
        s.renderOrder = 0;
        scene.add(s);
        hotHalos.push({ s, ci: i });
        assigned++;
      }
    }

    /* Fake DOF — large soft near-camera bokeh drifting out of focus */
    const bokeh: { s: THREE.Sprite; bx: number; by: number; bz: number; w: number; p: number; base: number }[] = [];
    for (let i = 0; i < BOKEH_COUNT; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeHaloTexture("#2E4C78"), transparent: true,
        opacity: 0.035 + Math.random() * 0.04,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
      }));
      const bx = (Math.random() - 0.5) * 10;
      const by = (Math.random() - 0.5) * 6;
      const bz = 3.2 + Math.random() * 2.4;
      const sc = 1.0 + Math.random() * 1.5;
      s.scale.set(sc, sc, 1);
      s.position.set(bx, by, bz);
      s.renderOrder = 0;
      scene.add(s);
      bokeh.push({ s, bx, by, bz, w: 0.05 + Math.random() * 0.08, p: Math.random() * Math.PI * 2, base: s.material.opacity });
    }

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

    /* ── Phase machine — 1.8s readable → 0.6s disintegrate → 0.6s reform ── */
    const T_HOLD = reduceMotion ? 3.0 : 1.8;
    const T_OUT = reduceMotion ? 0.5 : 0.6;
    const T_GAP = 0;
    const T_IN = reduceMotion ? 0.5 : 0.6;
    type Phase = "hold" | "out" | "gap" | "in";
    let phase: Phase = "hold";
    let phaseT = 0;

    function spawnDissolve() {
      quoteParticles.length = 0;
      if (!anchorRect || sample.count === 0) return;
      const { w, h, k } = textWorldSize();
      const s0 = Math.max(0.011, 1.9 * worldPerPx * (k / 0.3));
      for (let i = 0; i < sample.count; i++) {
        const px = sample.points[i * 2] * k * worldPerPx;
        const py = -sample.points[i * 2 + 1] * k * worldPerPx;
        // Direction grows out of the glyph pixel itself — no cloud above
        const dx = px / (w * 0.5 || 1) + (Math.random() - 0.5) * 0.9;
        const dy = py / (h * 0.5 || 1) + (Math.random() - 0.5) * 0.9;
        const len = Math.hypot(dx, dy) || 1;
        const spread = 0.8 + Math.random() * 1.5;
        const sweep = (px / (w * 0.5 || 1) + 1) / 2;
        const hotP = Math.random() < 0.15;
        quoteParticles.push({
          sx: px, sy: py, sz: 0,
          tx: px + (dx / len) * spread,
          ty: py + (dy / len) * spread,
          tz: (Math.random() - 0.5) * 2.4,
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
          col: hotP
            ? new THREE.Color(RED.bright).lerp(new THREE.Color(RED.flare), 0.6)
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
      const { w, h, k } = textWorldSize();
      const s0 = Math.max(0.011, 1.9 * worldPerPx * (k / 0.3));
      let minX = Infinity, maxX = -Infinity;
      for (let i = 0; i < sample.count; i++) {
        const px = sample.points[i * 2] * k * worldPerPx;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
      }
      for (let i = 0; i < sample.count; i++) {
        const px = sample.points[i * 2] * k * worldPerPx;
        const py = -sample.points[i * 2 + 1] * k * worldPerPx;
        // Converge from the surrounding volume — a quarter arrive from the field itself
        let ox: number, oy: number, oz: number;
        if (Math.random() < 0.25) {
          const c = cubes[(Math.random() * cubes.length) | 0];
          ox = c.hx * 0.55; oy = c.hy * 0.55; oz = c.hz * 0.55;
        } else {
          const a = Math.random() * Math.PI * 2;
          const r = 0.8 + Math.random() * 1.5;
          ox = Math.cos(a) * r;
          oy = Math.sin(a) * r * 0.6;
          oz = (Math.random() - 0.35) * 2.6;
        }
        const sweep = (px - minX) / (maxX - minX || 1);
        const hotP = Math.random() < 0.15;
        quoteParticles.push({
          sx: ox, sy: oy, sz: oz,
          tx: px, ty: py, tz: 0,
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
          col: hotP
            ? new THREE.Color(RED.bright).lerp(new THREE.Color(RED.flare), 0.6)
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

    /* Place one cube: home + swarm pull + personal drift + tumble, with the
       typography corridor softly dimmed and near-camera motion stretch. */
    function placeCube(c: Cube, t: number) {
      const act = clusterActivity(c.cluster, t);
      const mood = clamp01(0.5 + 0.5 * Math.sin(t * c.soc + c.socP));
      const pull = Math.pow(act * mood, 1.5) * 0.85;
      const a = clusterPos(c.cluster, t);
      const drift = 1 - 0.45 * pull;
      const x = c.hx + (a.x - c.hx) * pull + Math.sin(t * c.dwx + c.dpx) * c.dax * drift;
      const y = c.hy + (a.y - c.hy) * pull + Math.cos(t * c.dwy + c.dpy) * c.day * drift;
      const z = c.hz + (a.z - c.hz) * pull + Math.sin(t * c.dwz + c.dpz) * c.daz * drift;

      // Corridor — fragments fade rather than pop when crossing the type
      const corridorD = Math.max(Math.abs(x) - 2.4, Math.abs(y) - 1.75, Math.abs(z) - 1.3);
      const fade = clamp01(corridorD / 0.6);
      const scaleMul = 0.12 + 0.88 * fade;

      dummy.position.set(x, y, z);

      const vx = x - c.prevx, vy = y - c.prevy, vz = z - c.prevz;
      const vlen = Math.hypot(vx, vy, vz);
      const near = z > 1.0;
      if (near && vlen > 0.0008) {
        // Motion blur cue: near cubes stretch along their travel
        _dir.set(vx / vlen, vy / vlen, vz / vlen);
        _q.setFromUnitVectors(Z_AXIS, _dir);
        dummy.quaternion.copy(_q);
        const blur = Math.min(1.4, vlen * 20);
        dummy.scale.set(c.size * scaleMul, c.size * scaleMul, c.size * scaleMul * (1 + blur));
      } else {
        dummy.rotation.set(c.rx + t * c.rSpeed * 0.4, c.ry + t * c.rSpeed * 0.6, c.rx);
        dummy.scale.setScalar(c.size * scaleMul);
      }
      dummy.updateMatrix();
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

      /* The field — gather/disperse swarms, personal drift, tumble, stretch */
      if (!reduceMotion) {
        for (let i = 0; i < cubes.length; i++) {
          placeCube(cubes[i], t);
          field.setMatrixAt(i, dummy.matrix);
        }
        field.instanceMatrix.needsUpdate = true;
      }

      /* Bloom points follow their cubes */
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

        /* Bokeh drift */
        for (let i = 0; i < bokeh.length; i++) {
          const b = bokeh[i];
          b.s.position.set(b.bx + Math.sin(t * b.w + b.p) * 0.5, b.by + Math.cos(t * b.w * 0.8 + b.p) * 0.3, b.bz);
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
        redHalo.scale.set(3.4, 1.7, 1);
      }
      if (phase === "hold") {
        // No texture yet (font pipeline hiccup) — hold invisible rather than
        // show an untextured quad.
        const target = textMat.map ? 1 : 0;
        textMat.opacity += (target - textMat.opacity) * Math.min(1, dt * 6);
        redHalo.material.opacity += (0 - redHalo.material.opacity) * Math.min(1, dt * 3);
      } else if (phase === "out") {
        const p = phaseT / T_OUT;
        textMat.opacity = reduceMotion ? 1 - clamp01(p / 0.9) : 1 - clamp01(p / 0.3);
        redHalo.material.opacity = 0.2 * Math.sin(Math.min(1, p) * Math.PI);
      } else if (phase === "gap") {
        textMat.opacity = 0;
        redHalo.material.opacity += (0 - redHalo.material.opacity) * Math.min(1, dt * 4);
      } else if (phase === "in") {
        const p = phaseT / T_IN;
        textMat.opacity = clamp01((p - 0.5) / 0.35);
        redHalo.material.opacity = 0.16 * Math.sin(clamp01(p) * Math.PI);
      }
      blueHalo.material.opacity = 0.045 + Math.sin(t * 0.23) * 0.012 + redHalo.material.opacity * 0.15;

      /* Quote particles — letter fragments travelling through the volume */
      if (quoteMesh.count > 0) {
        const forming = phase === "in";
        for (let i = 0; i < quoteMesh.count; i++) {
          const q = quoteParticles[i];
          const p = clamp01((phaseT - q.delay) / q.dur);
          const e = forming ? EASE_OUT(p) : EASE_IN(p);
          const curl = Math.sin(p * Math.PI * 2 + q.seed);
          const px = q.sx + (q.tx - q.sx) * e + curl * q.cx;
          const py = q.sy + (q.ty - q.sy) * e + curl * q.cy;
          const pz = q.sz + (q.tz - q.sz) * e + curl * q.cz;
          dummy.position.set(px, py, pz);
          // Stretch along travel while in motion — fragments read as streaks
          _dir.set(q.tx - q.sx, q.ty - q.sy, q.tz - q.sz);
          if (_dir.lengthSq() > 0.0001) {
            _dir.normalize();
            _q.setFromUnitVectors(Z_AXIS, _dir);
            dummy.quaternion.copy(_q);
            const stretch = 1 + (1 - e) * 0.9;
            dummy.scale.set(q.size, q.size, q.size * stretch);
          } else {
            dummy.rotation.set(q.rx + t * q.spin * (1 - e), q.ry - t * q.spin * 0.7 * (1 - e), q.seed);
            dummy.scale.setScalar(Math.max(0.0001, q.size));
          }
          const fade = forming ? 0.25 + 0.75 * Math.sin(clamp01(p) * Math.PI * 0.5) : 1 - p * 0.7;
          dummy.scale.multiplyScalar(Math.max(0.0001, fade));
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

    /* Reduced motion: compose the field once — same structure, none of the
       travel — and leave it still. */
    if (reduceMotion) {
      for (let i = 0; i < cubes.length; i++) {
        placeCube(cubes[i], 0);
        field.setMatrixAt(i, dummy.matrix);
      }
      field.instanceMatrix.needsUpdate = true;
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
