import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   INTRO SCENE — one continuous cinematic environment around the title.

   Monochrome, warm-ivory light, deep fog. Architectural slabs and textured
   document surfaces cluster at the left and right edges; the centre stays
   empty. A reflective floor carries soft light pools. The scan line travels
   through the scene itself. No clock, no particles, no neon.
   ═══════════════════════════════════════════════════════════════════════ */

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 640;
const REDUCE =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ─── Procedural monochrome textures (atmosphere, not readable) ───────── */

function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d");
  if (ctx) draw(ctx);
  const tex = new CanvasTexture(cv);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Dashes and blocks that read as newsprint at a glance — never as words. */
function drawNewsprint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cols: number,
) {
  ctx.fillStyle = "#101010";
  ctx.fillRect(0, 0, w, h);
  const colW = w / cols;
  for (let c = 0; c < cols; c++) {
    let y = 18 + Math.random() * 26;
    while (y < h - 30) {
      const isHead = Math.random() < 0.1;
      let x = c * colW + 12 + Math.random() * 8;
      const segs = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segs && x < (c + 1) * colW - 14; s++) {
        const segW = isHead ? 40 + Math.random() * 60 : 14 + Math.random() * 48;
        ctx.fillStyle = `rgba(206, 200, 186, ${(isHead ? 0.09 : 0.045) + Math.random() * 0.05})`;
        ctx.fillRect(x, y, Math.min(segW, (c + 1) * colW - 14 - x), isHead ? 5 : 2.4);
        x += segW + 8;
      }
      y += isHead ? 20 : 9 + Math.random() * 4;
    }
  }
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

const makeNewsTexture = () => canvasTexture(512, 640, (c) => drawNewsprint(c, 512, 640, 4));
const makeTextTexture = () => canvasTexture(512, 512, (c) => drawNewsprint(c, 512, 512, 3));

/** Monochrome globe — mottled landmasses, heavy terminator, grain. */
const makeGlobeTexture = () =>
  canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#0a0a09";
    ctx.fillRect(0, 0, 512, 512);
    const cx = 256;
    const cy = 250;
    const r = 205;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#161614";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r;
      ctx.fillStyle = `rgba(198, 192, 178, ${0.02 + Math.random() * 0.05})`;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(a) * d,
        cy + Math.sin(a) * d,
        12 + Math.random() * 46,
        8 + Math.random() * 30,
        Math.random() * Math.PI,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    const term = ctx.createRadialGradient(cx - 90, cy - 90, r * 0.25, cx, cy, r * 1.25);
    term.addColorStop(0, "rgba(0,0,0,0)");
    term.addColorStop(0.72, "rgba(0,0,0,0.72)");
    term.addColorStop(1, "rgba(0,0,0,0.96)");
    ctx.fillStyle = term;
    ctx.fillRect(0, 0, 512, 512);
    ctx.restore();
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(214, 208, 194, ${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
  });

/** Distant documentary photograph — skyline silhouette, heavy grain. */
const makePhotoTexture = () =>
  canvasTexture(512, 384, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 384);
    sky.addColorStop(0, "#1c1b18");
    sky.addColorStop(1, "#0c0c0b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 512, 384);
    let x = 10;
    while (x < 500) {
      const bw = 18 + Math.random() * 46;
      const bh = 60 + Math.random() * 150;
      ctx.fillStyle = "#070706";
      ctx.fillRect(x, 384 - bh, bw, bh);
      if (Math.random() < 0.4) {
        ctx.fillRect(x + bw / 2 - 2, 384 - bh - 18 - Math.random() * 26, 4, 24);
      }
      x += bw + 4 + Math.random() * 10;
    }
    const g = ctx.createRadialGradient(256, 200, 60, 256, 220, 330);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.68)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(216, 210, 196, ${Math.random() * 0.06})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 384, 1, 1);
    }
  });

/** Vertical light-shaft gradient (soft horizontal falloff). */
const makeShaftTexture = () =>
  canvasTexture(64, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "rgba(240, 236, 224, 0.9)");
    g.addColorStop(0.55, "rgba(240, 236, 224, 0.28)");
    g.addColorStop(1, "rgba(240, 236, 224, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 512);
    const f = ctx.createLinearGradient(0, 0, 64, 0);
    f.addColorStop(0, "rgba(0,0,0,1)");
    f.addColorStop(0.5, "rgba(0,0,0,0)");
    f.addColorStop(1, "rgba(0,0,0,1)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = f;
    ctx.fillRect(0, 0, 64, 512);
  });

/** Soft ellipse pooled on the floor — the reflection. */
const makePoolTexture = () =>
  canvasTexture(256, 128, (ctx) => {
    const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 120);
    g.addColorStop(0, "rgba(216, 205, 178, 0.5)");
    g.addColorStop(0.5, "rgba(216, 205, 178, 0.12)");
    g.addColorStop(1, "rgba(216, 205, 178, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
  });

/* ─── Component ───────────────────────────────────────────────────────── */

export default function IntroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_SMALL ? 1.75 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x080807, 1);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const disposers: Array<() => void> = [];
    const track = <T extends { dispose(): void }>(r: T): T => {
      disposers.push(() => r.dispose());
      return r;
    };

    const scene = new Scene();
    scene.background = null;
    scene.fog = new Fog(0x080807, 14, 34);

    const camera = new PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.set(0, 1.35, 7.2);
    camera.lookAt(0, 0.9, 0);

    /* ─── Materials ─── */
    const slabMat = track(
      new MeshStandardMaterial({
        color: 0x11110f,
        roughness: 0.42,
        metalness: 0.55,
      }),
    );
    const slabMat2 = track(
      new MeshStandardMaterial({
        color: 0x161614,
        roughness: 0.5,
        metalness: 0.45,
      }),
    );
    const floorMat = track(
      new MeshStandardMaterial({
        color: 0x0b0b0a,
        roughness: 0.22,
        metalness: 0.7,
      }),
    );
    const newsMat = track(
      new MeshStandardMaterial({
        map: track(makeNewsTexture()),
        roughness: 0.78,
        metalness: 0.08,
        color: 0xffffff,
      }),
    );
    const textMat = track(
      new MeshStandardMaterial({
        map: track(makeTextTexture()),
        roughness: 0.8,
        metalness: 0.06,
        color: 0xdddddd,
      }),
    );
    const photoMat = track(
      new MeshStandardMaterial({
        map: track(makePhotoTexture()),
        roughness: 0.72,
        metalness: 0.1,
        color: 0xcccccc,
      }),
    );
    const globeMat = track(
      new MeshStandardMaterial({
        map: track(makeGlobeTexture()),
        roughness: 0.6,
        metalness: 0.15,
        color: 0xbbbbbb,
        emissive: 0x14130f,
        emissiveIntensity: 0.6,
      }),
    );

    const box = track(new BoxGeometry(1, 1, 1));
    const plane = track(new PlaneGeometry(1, 1));

    const addSlab = (
      mat: MeshStandardMaterial,
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      rx: number,
      ry: number,
      rz: number,
      shadow = true,
    ) => {
      const m = new Mesh(box, mat);
      m.scale.set(w, h, d);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = shadow;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };

    const addPanel = (
      mat: MeshStandardMaterial,
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      rx: number,
      ry: number,
      rz: number,
      parent?: Group,
    ) => {
      const m = new Mesh(plane, mat);
      m.scale.set(w, h, 1);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      (parent ?? scene).add(m);
      return m;
    };

    /* ─── Architecture: monolith slabs framing the edges ─── */
    // Hanging from the top, left and right — never over the centre.
    addSlab(slabMat, 3.2, 4.6, 0.5, -5.6, 2.6, -1.2, 0.1, 0.5, 0.04);
    addSlab(slabMat2, 2.2, 3.4, 0.4, -3.4, 3.1, -3.2, 0.05, 0.62, -0.03);
    addSlab(slabMat, 4.2, 4.0, 0.6, 5.8, 2.4, -0.8, -0.08, -0.45, -0.05);
    addSlab(slabMat2, 2.6, 3.0, 0.45, 3.8, 3.2, -2.8, 0.04, -0.6, 0.04);
    // Distant uprights — barely visible through the fog.
    addSlab(slabMat, 1.6, 6.5, 0.7, -8.5, 0.4, -8.5, 0, 0.9, 0);
    addSlab(slabMat2, 1.8, 7.0, 0.8, 8.8, 0.2, -9.0, 0, -0.85, 0);
    addSlab(slabMat, 2.4, 2.0, 0.5, 0.4, 4.6, -10.5, 0.05, 0.15, 0.02);
    // Low folded forms at the floor — the bottom-left / bottom-right masses.
    addSlab(slabMat2, 3.6, 0.35, 1.6, -4.6, -1.15, 1.4, 0.05, 0.35, 0.16);
    addSlab(slabMat, 3.0, 0.3, 1.4, -5.4, -0.95, -0.4, -0.04, 0.5, -0.1);
    addSlab(slabMat2, 3.8, 0.4, 1.8, 4.9, -1.2, 1.2, 0.03, -0.4, -0.14);
    addSlab(slabMat, 2.6, 0.28, 1.2, 5.6, -1.0, -0.8, -0.05, -0.55, 0.09);

    /* ─── Document / photo / globe surfaces at the edges ─── */
    if (!IS_SMALL) {
      // Left cluster: globe over newsprint, a text panel behind.
      addPanel(globeMat, 2.5, 2.5, -4.6, 1.7, 0.2, 0.05, 0.55, 0.02);
      addPanel(newsMat, 2.2, 2.9, -4.15, 1.15, -1.1, 0.03, 0.6, -0.02);
      addPanel(textMat, 1.7, 1.5, -6.2, 0.7, -3.4, 0.02, 0.75, 0.03);
      // Right cluster: photographs and text in depth.
      addPanel(photoMat, 2.3, 1.7, 4.7, 1.5, -0.6, -0.02, -0.5, -0.02);
      addPanel(photoMat, 2.0, 1.5, 5.9, 0.55, -2.6, -0.04, -0.62, 0.02);
      addPanel(newsMat, 1.9, 2.5, 3.9, 1.1, -2.2, 0.03, -0.55, 0.02);
      addPanel(textMat, 1.6, 1.4, 6.6, 1.9, -4.4, 0.02, -0.72, -0.03);
    } else {
      // Mobile: two quiet panels near the corners, far away.
      addPanel(newsMat, 1.8, 2.3, -3.6, 1.3, -2.2, 0.03, 0.6, 0);
      addPanel(photoMat, 2.0, 1.5, 3.7, 1.1, -2.6, -0.03, -0.6, 0);
    }

    /* ─── Floor — receives shadows, carries light pools ─── */
    const floor = new Mesh(track(new PlaneGeometry(90, 60)), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.35;
    floor.receiveShadow = true;
    scene.add(floor);

    const poolMat = track(
      new MeshBasicMaterial({
        map: track(makePoolTexture()),
        transparent: true,
        opacity: 0.55,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const pools: Mesh[] = [];
    const poolSpots: Array<[number, number, number, number]> = [
      [-4.6, 1.6, 0.42, 3.4],
      [-5.3, -0.6, 0.3, 2.6],
      [4.8, 1.4, 0.4, 3.2],
      [5.5, -0.9, 0.26, 2.4],
    ];
    for (const [x, z, o, s] of poolSpots) {
      const p = new Mesh(plane, poolMat);
      p.rotation.x = -Math.PI / 2;
      p.position.set(x, -1.34, z);
      p.scale.set(s, s * 0.45, 1);
      const m = track((p.material as MeshBasicMaterial).clone());
      m.opacity = o;
      p.material = m;
      scene.add(p);
      pools.push(p);
    }

    /* ─── Lighting — soft key, rim, faint ambient ─── */
    scene.add(new AmbientLight(0x1a1916, 0.85));

    const key = new DirectionalLight(0xf0e9d8, 1.15);
    key.position.set(-6.5, 7.5, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 9;
    key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0015;
    scene.add(key);

    const rim = new DirectionalLight(0xcfc6b0, 0.5);
    rim.position.set(7, 4.5, -6);
    scene.add(rim);

    const warm = new PointLight(0xe8ddc2, 0.55, 9, 1.6);
    warm.position.set(-4.4, -0.4, 1.8);
    scene.add(warm);
    const warm2 = new PointLight(0xe8ddc2, 0.4, 8, 1.6);
    warm2.position.set(4.6, -0.5, 1.4);
    scene.add(warm2);

    /* ─── Volumetric shafts — broad, faint, from the upper left ─── */
    const shaftMat = track(
      new MeshBasicMaterial({
        map: track(makeShaftTexture()),
        transparent: true,
        opacity: 0.05,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
      }),
    );
    const shafts: Mesh[] = [];
    const shaftSpecs: Array<[number, number, number, number, number]> = [
      [-5.2, 3.2, -2.5, 3.4, 0.055],
      [-2.9, 2.6, -4.5, 2.4, 0.04],
      [4.9, 2.9, -2.2, 3.0, 0.05],
    ];
    for (const [x, y, z, h, o] of shaftSpecs) {
      const s = new Mesh(plane, shaftMat.clone());
      s.position.set(x, y, z);
      s.scale.set(h * 0.38, h, 1);
      s.rotation.z = 0.18;
      s.rotation.y = x < 0 ? 0.3 : -0.3;
      (s.material as MeshBasicMaterial).opacity = o;
      track(s.material as MeshBasicMaterial);
      scene.add(s);
      shafts.push(s);
    }

    /* ─── The scan line — a thin emissive blade inside the scene ─── */
    const scan = new Group();
    const blade = new Mesh(
      plane,
      track(
        new MeshBasicMaterial({
          color: 0xefe9d9,
          transparent: true,
          opacity: 0.4,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    blade.scale.set(0.012, 7.6, 1);
    blade.position.y = 0.4;
    scan.add(blade);
    const scanGlow = new Mesh(
      plane,
      track(
        new MeshBasicMaterial({
          map: track(makePoolTexture()),
          transparent: true,
          opacity: 0.1,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    scanGlow.scale.set(0.9, 7.0, 1);
    scanGlow.position.y = 0.4;
    scan.add(scanGlow);
    scan.visible = !REDUCE;
    scene.add(scan);

    const SCAN_PERIOD = 46;
    const scanX = (t: number) => -7.4 + ((t % SCAN_PERIOD) / SCAN_PERIOD) * 14.8;

    /* ─── Pointer parallax + slow drift ─── */
    const pointer = { x: 0, y: 0 };
    let tracked = false;
    let blend = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      tracked = true;
    };

    /* ─── Loop ─── */
    const clock = { last: performance.now() };
    let elapsed = 0;
    let paused = document.hidden;
    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) clock.last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (paused) return;
      const dt = Math.min((now - clock.last) / 1000, 0.05);
      clock.last = now;
      if (!REDUCE) elapsed += dt;

      blend = Math.min(1, blend + (tracked && !REDUCE ? dt / 3 : 0));
      const dx = Math.sin(elapsed * 0.045) * 0.28;
      const dy = Math.sin(elapsed * 0.03 + 1.2) * 0.12;
      const px = dx * (1 - blend) + pointer.x * 0.55 * blend;
      const py = dy * (1 - blend) + pointer.y * 0.3 * blend;
      camera.position.x = px;
      camera.position.y = 1.35 + py;
      camera.lookAt(0, 0.9, 0);

      // Distant forms breathe very slowly; the warm pools shimmer.
      const b = REDUCE ? 0 : Math.sin(elapsed * 0.11) * 0.5 + 0.5;
      warm.intensity = 0.45 + b * 0.18;
      warm2.intensity = 0.34 + (1 - b) * 0.12;

      if (!REDUCE) {
        const sx = scanX(elapsed);
        scan.position.x = sx;
        const edge = Math.min(1, Math.min((sx + 7.4) / 1.2, (7.4 - sx) / 1.2));
        (blade.material as MeshBasicMaterial).opacity = 0.34 * edge;
        (scanGlow.material as MeshBasicMaterial).opacity = 0.09 * edge;
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onPointerMove, { passive: true });

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
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
  );
}
