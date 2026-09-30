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
   INTRO SCENE — one continuous cinematic environment, v2.

   The camera sits INSIDE a vast dark hall: colonnade piers crop the left
   and right frame edges, ceiling beams crop the top corners, the floor
   runs to a fogged horizon. Document surfaces (newsprint, globe, photos)
   are pinned to the architecture — they are surfaces of the hall, not
   floating cards. The centre stays an empty dark void for VERITAS.
   ═══════════════════════════════════════════════════════════════════════ */

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 640;
const REDUCE =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ─── Procedural monochrome textures (brightened to read in darkness) ── */

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
  ctx.fillStyle = "#171715";
  ctx.fillRect(0, 0, w, h);
  const colW = w / cols;
  for (let c = 0; c < cols; c++) {
    let y = 18 + Math.random() * 26;
    while (y < h - 30) {
      const isHead = Math.random() < 0.11;
      let x = c * colW + 12 + Math.random() * 8;
      const segs = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segs && x < (c + 1) * colW - 14; s++) {
        const segW = isHead ? 40 + Math.random() * 60 : 14 + Math.random() * 48;
        ctx.fillStyle = `rgba(214, 208, 192, ${(isHead ? 0.2 : 0.1) + Math.random() * 0.07})`;
        ctx.fillRect(x, y, Math.min(segW, (c + 1) * colW - 14 - x), isHead ? 5 : 2.4);
        x += segW + 8;
      }
      y += isHead ? 20 : 9 + Math.random() * 4;
    }
  }
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.22, w / 2, h / 2, h * 0.78);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

const makeNewsTexture = () => canvasTexture(512, 640, (c) => drawNewsprint(c, 512, 640, 4));
const makeTextTexture = () => canvasTexture(512, 512, (c) => drawNewsprint(c, 512, 512, 3));

/** Monochrome globe — mottled landmasses, heavy terminator, grain. */
const makeGlobeTexture = () =>
  canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#0d0d0c";
    ctx.fillRect(0, 0, 512, 512);
    const cx = 256;
    const cy = 250;
    const r = 205;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#232320";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 52; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r;
      ctx.fillStyle = `rgba(206, 200, 184, ${0.05 + Math.random() * 0.09})`;
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
    const term = ctx.createRadialGradient(cx - 90, cy - 90, r * 0.3, cx, cy, r * 1.3);
    term.addColorStop(0, "rgba(0,0,0,0)");
    term.addColorStop(0.7, "rgba(0,0,0,0.66)");
    term.addColorStop(1, "rgba(0,0,0,0.94)");
    ctx.fillStyle = term;
    ctx.fillRect(0, 0, 512, 512);
    ctx.restore();
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(214, 208, 194, ${Math.random() * 0.06})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
  });

/** Distant documentary photograph — skyline silhouette, heavy grain. */
const makePhotoTexture = () =>
  canvasTexture(512, 384, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 384);
    sky.addColorStop(0, "#2a2822");
    sky.addColorStop(1, "#121210");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 512, 384);
    let x = 10;
    while (x < 500) {
      const bw = 18 + Math.random() * 46;
      const bh = 60 + Math.random() * 150;
      ctx.fillStyle = "#0c0c0a";
      ctx.fillRect(x, 384 - bh, bw, bh);
      if (Math.random() < 0.4) {
        ctx.fillRect(x + bw / 2 - 2, 384 - bh - 18 - Math.random() * 26, 4, 24);
      }
      x += bw + 4 + Math.random() * 10;
    }
    const g = ctx.createRadialGradient(256, 200, 60, 256, 220, 330);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(216, 210, 196, ${Math.random() * 0.07})`;
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

/** Soft ellipse — floor pools and the scan-line base glow. */
const makePoolTexture = () =>
  canvasTexture(256, 128, (ctx) => {
    const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 120);
    g.addColorStop(0, "rgba(216, 205, 178, 0.5)");
    g.addColorStop(0.5, "rgba(216, 205, 178, 0.12)");
    g.addColorStop(1, "rgba(216, 205, 178, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
  });

/** Broad radial haze for the atmosphere sheets. */
const makeHazeTexture = () =>
  canvasTexture(512, 512, (ctx) => {
    const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
    g.addColorStop(0, "rgba(214, 202, 176, 0.55)");
    g.addColorStop(0.55, "rgba(214, 202, 176, 0.14)");
    g.addColorStop(1, "rgba(214, 202, 176, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  });

/** Wide gradient band — the faint light where floor meets backdrop. */
const makeHorizonTexture = () =>
  canvasTexture(512, 64, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(210, 198, 172, 0.5)");
    g.addColorStop(1, "rgba(210, 198, 172, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 64);
    const f = ctx.createLinearGradient(0, 0, 512, 0);
    f.addColorStop(0, "rgba(0,0,0,1)");
    f.addColorStop(0.25, "rgba(0,0,0,0)");
    f.addColorStop(0.75, "rgba(0,0,0,0)");
    f.addColorStop(1, "rgba(0,0,0,1)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = f;
    ctx.fillRect(0, 0, 512, 64);
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
    renderer.domElement.style.cssText = "position:absolute;inset:0;z-index:0;";
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
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
    scene.fog = new Fog(0x080807, 11, 30);

    const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.set(0, 1.15, 5.6);
    camera.lookAt(0, 0.85, 0);

    /* ─── Materials ─── */
    const pierMat = track(
      new MeshStandardMaterial({ color: 0x171614, roughness: 0.5, metalness: 0.4 }),
    );
    const pierMatFar = track(
      new MeshStandardMaterial({ color: 0x131311, roughness: 0.55, metalness: 0.35 }),
    );
    const beamMat = track(
      new MeshStandardMaterial({ color: 0x1a1917, roughness: 0.45, metalness: 0.45 }),
    );
    const massMat = track(
      new MeshStandardMaterial({ color: 0x141311, roughness: 0.48, metalness: 0.42 }),
    );
    const floorMat = track(
      new MeshStandardMaterial({ color: 0x0c0c0b, roughness: 0.24, metalness: 0.72 }),
    );
    const wallMat = track(new MeshBasicMaterial({ color: 0x0b0b0a }));

    // Document surfaces: brightened textures + a faint self-glow so they
    // read as lit-from-within surfaces inside a dark hall.
    const docMat = (map: CanvasTexture, tint: number, glow: number) =>
      track(
        new MeshStandardMaterial({
          map,
          emissive: 0xcfc4a8,
          emissiveMap: map,
          emissiveIntensity: glow,
          roughness: 0.75,
          metalness: 0.08,
          color: tint,
        }),
      );
    const newsMat = docMat(track(makeNewsTexture()), 0xffffff, 0.5);
    const textMat = docMat(track(makeTextTexture()), 0xdddddd, 0.42);
    const photoMat = docMat(track(makePhotoTexture()), 0xcccccc, 0.5);
    const globeMat = docMat(track(makeGlobeTexture()), 0xbbbbbb, 0.55);

    const box = track(new BoxGeometry(1, 1, 1));
    const plane = track(new PlaneGeometry(1, 1));

    const addBox = (
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

    /** A thin bright strip along an edge — the grazing-light highlight. */
    const edgeGlow = (
      w: number,
      d: number,
      x: number,
      y: number,
      z: number,
      ry: number,
      op: number,
    ) => {
      const m = new Mesh(
        box,
        track(
          new MeshBasicMaterial({
            color: 0xd6cbb0,
            transparent: true,
            opacity: op,
            blending: AdditiveBlending,
            depthWrite: false,
          }),
        ),
      );
      m.scale.set(w, 0.022, d);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      scene.add(m);
      return m;
    };

    /* ─── Backdrop wall + horizon band ─── */
    const wall = new Mesh(track(new PlaneGeometry(90, 34)), wallMat);
    wall.position.set(0, 6, -16.5);
    scene.add(wall);

    const horizon = new Mesh(
      plane,
      track(
        new MeshBasicMaterial({
          map: track(makeHorizonTexture()),
          transparent: true,
          opacity: 0.5,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    horizon.position.set(0, -0.72, -15.8);
    horizon.scale.set(38, 1.1, 1);
    scene.add(horizon);

    /* ─── Colonnade — piers crop the frame edges and recede in depth ─── */
    const buildColonnade = (side: 1 | -1) => {
      const s = side;
      // Near pier — cropped by the frame edge.
      addBox(pierMat, 2.4, 9.5, 1.9, s * 6.15, 1.9, 1.1, 0.02, s * 0.16, s * 0.015);
      // Mid pier — carries the document cluster.
      addBox(pierMat, 1.7, 8.2, 1.5, s * 5.0, 1.55, -2.4, 0.01, s * 0.3, s * 0.01);
      // Far pier — dissolving into the fog.
      addBox(pierMatFar, 2.1, 9.0, 1.6, s * 6.4, 1.7, -8.6, 0, s * 0.42, 0);
      if (!IS_SMALL) {
        // Deep upright — barely there.
        addBox(pierMatFar, 1.4, 8.5, 1.3, s * 8.9, 1.4, -12.5, 0, s * 0.5, 0);
      }
      // Ceiling beams cropping the top corners.
      addBox(beamMat, 5.2, 0.55, 1.7, s * 5.3, 4.6, -0.6, 0.1, s * 0.34, s * 0.055);
      addBox(beamMat, 4.0, 0.45, 1.4, s * 4.4, 5.3, -4.2, 0.06, s * 0.42, s * 0.03);
      // Bottom masses — the folded foreground floor forms.
      addBox(massMat, 4.6, 0.42, 2.0, s * 4.9, -1.14, 1.5, 0.03, s * 0.3, s * 0.13);
      addBox(massMat, 3.2, 0.34, 1.5, s * 5.5, -1.0, -0.6, -0.04, s * 0.42, -s * 0.08);
      // Grazing highlights on the near masses and beams.
      edgeGlow(4.4, 1.9, s * 4.9, -0.9, 1.5, s * 0.3, 0.3);
      edgeGlow(5.0, 1.6, s * 5.3, 4.9, -0.6, s * 0.34, 0.22);
    };
    buildColonnade(-1);
    buildColonnade(1);

    /* ─── Document surfaces — pinned to the piers, angled with them ─── */
    const pin = (
      mat: MeshStandardMaterial,
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      ry: number,
      rz = 0,
    ) => {
      const m = new Mesh(plane, mat);
      m.scale.set(w, h, 1);
      m.position.set(x, y, z);
      m.rotation.set(0, ry, rz);
      m.castShadow = false;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };

    if (!IS_SMALL) {
      // Left cluster: globe over newsprint, text deeper in.
      pin(globeMat, 2.6, 2.6, -4.35, 1.9, 0.1, 0.5, 0.02);
      pin(newsMat, 2.3, 3.0, -3.9, 1.2, -1.5, 0.56, -0.02);
      pin(textMat, 1.8, 1.6, -5.4, 0.75, -6.6, 0.62, 0.03);
      // Right cluster: photographs and text.
      pin(photoMat, 2.5, 1.9, 4.4, 1.6, -0.2, -0.46, -0.02);
      pin(photoMat, 2.2, 1.65, 5.3, 0.6, -2.4, -0.56, 0.02);
      pin(newsMat, 2.0, 2.6, 3.7, 1.25, -3.4, -0.5, 0.02);
      pin(textMat, 1.7, 1.5, 5.9, 2.0, -7.2, -0.6, -0.03);
    } else {
      // Mobile: two quiet surfaces near the corners, angled in.
      pin(newsMat, 2.0, 2.6, -3.7, 1.5, -1.6, 0.5, 0);
      pin(photoMat, 2.2, 1.65, 3.8, 1.2, -2.0, -0.5, 0);
    }

    /* ─── Floor — receives shadows, carries pools and sheen streaks ─── */
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
    const poolSpots: Array<[number, number, number, number]> = [
      [-4.7, 1.7, 0.5, 3.6],
      [-5.4, -0.5, 0.34, 2.8],
      [4.8, 1.5, 0.46, 3.4],
      [5.5, -0.8, 0.3, 2.6],
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
    }

    /* ─── Lighting — soft key, rim, faint ambient, warm floor points ─── */
    scene.add(new AmbientLight(0x24211b, 1.0));

    const key = new DirectionalLight(0xf0e9d8, 1.5);
    key.position.set(-7.5, 8.5, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 26;
    key.shadow.camera.left = -13;
    key.shadow.camera.right = 13;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0015;
    scene.add(key);

    const rim = new DirectionalLight(0xd8cdb4, 0.9);
    rim.position.set(8, 5, -7);
    scene.add(rim);

    const warm = new PointLight(0xe8ddc2, 0.75, 10, 1.6);
    warm.position.set(-4.6, -0.3, 1.9);
    scene.add(warm);
    const warm2 = new PointLight(0xe8ddc2, 0.5, 9, 1.6);
    warm2.position.set(4.7, -0.4, 1.5);
    scene.add(warm2);

    /* ─── Haze — broad faint sheets + a glow behind the centre void ─── */
    const hazeTex = track(makeHazeTexture());
    const hazeSpecs: Array<[number, number, number, number, number, number]> = [
      [0, 1.6, -9.5, 16, 9, 0.075], // behind the centre — depth separator
      [-4.5, 2.4, -6.5, 9, 7, 0.05],
      [4.5, 2.2, -6.0, 9, 7, 0.05],
    ];
    for (const [x, y, z, w, h, o] of hazeSpecs) {
      const hz = new Mesh(
        plane,
        track(
          new MeshBasicMaterial({
            map: hazeTex,
            transparent: true,
            opacity: o,
            blending: AdditiveBlending,
            depthWrite: false,
            side: DoubleSide,
          }),
        ),
      );
      hz.position.set(x, y, z);
      hz.scale.set(w, h, 1);
      scene.add(hz);
    }

    /* ─── Volumetric shafts — faint columns of light from the beams ─── */
    const shaftTex = track(makeShaftTexture());
    const shaftSpecs: Array<[number, number, number, number, number]> = [
      [-5.1, 3.4, -2.2, 4.4, 0.055],
      [-2.9, 2.8, -4.6, 3.2, 0.04],
      [4.9, 3.1, -2.0, 3.8, 0.05],
    ];
    for (const [x, y, z, h, o] of shaftSpecs) {
      const s = new Mesh(
        plane,
        track(
          new MeshBasicMaterial({
            map: shaftTex,
            transparent: true,
            opacity: o,
            blending: AdditiveBlending,
            depthWrite: false,
            side: DoubleSide,
          }),
        ),
      );
      s.position.set(x, y, z);
      s.scale.set(h * 0.36, h, 1);
      s.rotation.z = 0.16;
      s.rotation.y = x < 0 ? 0.3 : -0.3;
      scene.add(s);
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
    blade.scale.set(0.012, 7.8, 1);
    blade.position.y = 0.45;
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
    scanGlow.scale.set(0.9, 7.2, 1);
    scanGlow.position.y = 0.45;
    scan.add(scanGlow);
    // The bright kiss where the scan meets the floor.
    const scanBase = new Mesh(
      plane,
      track(
        new MeshBasicMaterial({
          map: track(makePoolTexture()),
          transparent: true,
          opacity: 0.3,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    scanBase.rotation.x = -Math.PI / 2;
    scanBase.position.set(0, -1.3, 0.2);
    scanBase.scale.set(2.2, 1.1, 1);
    scan.add(scanBase);
    scan.visible = !REDUCE;
    scene.add(scan);

    const SCAN_PERIOD = 46;
    const scanX = (t: number) => -6.6 + ((t % SCAN_PERIOD) / SCAN_PERIOD) * 13.2;

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
      const dx = Math.sin(elapsed * 0.045) * 0.24;
      const dy = Math.sin(elapsed * 0.03 + 1.2) * 0.1;
      const px = dx * (1 - blend) + pointer.x * 0.5 * blend;
      const py = dy * (1 - blend) + pointer.y * 0.28 * blend;
      camera.position.x = px;
      camera.position.y = 1.15 + py;
      camera.lookAt(0, 0.85, 0);

      // The hall breathes: warm points swell very slowly.
      const b = REDUCE ? 0 : Math.sin(elapsed * 0.11) * 0.5 + 0.5;
      warm.intensity = 0.62 + b * 0.2;
      warm2.intensity = 0.42 + (1 - b) * 0.14;

      if (!REDUCE) {
        const sx = scanX(elapsed);
        scan.position.x = sx;
        const edge = Math.min(1, Math.min((sx + 6.6) / 1.2, (6.6 - sx) / 1.2));
        (blade.material as MeshBasicMaterial).opacity = 0.34 * edge;
        (scanGlow.material as MeshBasicMaterial).opacity = 0.09 * edge;
        (scanBase.material as MeshBasicMaterial).opacity = 0.26 * edge;
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
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {/* Cinematic vignette — pulls the frame's corners into darkness and
          binds the render into a single photographic image. */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 46%, transparent 42%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </div>
  );
}
