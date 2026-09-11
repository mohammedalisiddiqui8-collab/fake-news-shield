"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";

/* ─── LOCKED PALETTE ─── */
const P = {
  bg: "#0B0D0C",
  text: "#F1F2EE",
  secondary: "#9A9E98",
  sage: "#607568",
  verified: "#8FA596",
  warning: "#A9574D",
  gold: "#A58B5B",
  border: "#292A27",
  surface: "#0F1110",
};

/* ─── Panel Data ─── */
const PANELS = [
  // Main article — left, prominent
  {
    lines: [
      { text: "THE DAILY CHRONICLE", size: 6, weight: 600, color: P.secondary, y: 0 },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 3, color: P.border, y: 10 },
      { text: "Scientists Confirm New Species", size: 12, weight: 700, color: P.text, y: 22 },
      { text: "in Deep Ocean Expedition", size: 12, weight: 700, color: P.text, y: 38 },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 3, color: P.border, y: 52 },
      { text: "Marine biologists from the University of", size: 6, color: P.secondary, y: 64 },
      { text: "Oxford identified a previously unknown", size: 6, color: P.secondary, y: 74 },
      { text: "deep-sea species at 8,200 meters depth.", size: 6, color: P.secondary, y: 84 },
      { text: "Lead researcher Dr. Sarah Chen published", size: 6, color: P.secondary, y: 94 },
      { text: "findings in Nature, March 2025.", size: 6, color: P.secondary, y: 104 },
    ],
    w: 3.0, h: 2.2, x: -1.8, y: 0.2, z: 0, rot: 0.04,
  },
  // Credibility score — right, overlapping
  {
    lines: [
      { text: "CREDIBILITY SCORE", size: 6, weight: 500, color: P.secondary, y: 0 },
      { text: "92", size: 44, weight: 700, color: P.verified, y: 22 },
      { text: "LIKELY CREDIBLE", size: 8, weight: 600, color: P.verified, y: 76 },
      { text: "━━━━━━━━━━━━━━━━━━━", size: 3, color: P.border, y: 90 },
      { text: "Named sources: verified", size: 5, color: P.verified, y: 102 },
      { text: "Citations: confirmed", size: 5, color: P.verified, y: 114 },
      { text: "Balance: adequate", size: 5, color: P.verified, y: 126 },
    ],
    w: 1.6, h: 1.8, x: 1.8, y: 0.6, z: -0.3, rot: -0.03,
  },
  // Fake article — back right
  {
    lines: [
      { text: "EXPOSED!!!", size: 10, weight: 700, color: P.warning, y: 0 },
      { text: "Secret Cure Hidden", size: 9, weight: 600, color: P.text, y: 16 },
      { text: "by Big Pharma", size: 9, weight: 600, color: P.text, y: 30 },
      { text: "━━━━━━━━━━━━━━━━━━━", size: 3, color: P.border, y: 44 },
      { text: "Anonymous insider 'Dr. Truth'", size: 5, color: P.secondary, y: 56 },
      { text: "reveals in viral post that a", size: 5, color: P.secondary, y: 66 },
      { text: "simple mixture can cure ALL", size: 5, color: P.secondary, y: 76 },
      { text: "diseases!!!", size: 5, weight: 600, color: P.warning, y: 86 },
    ],
    w: 2.0, h: 1.6, x: 3.0, y: -0.5, z: -0.9, rot: -0.08,
  },
  // Source verification
  {
    lines: [
      { text: "SOURCE VERIFICATION", size: 6, weight: 500, color: P.gold, y: 0 },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━━", size: 3, color: P.border, y: 12 },
      { text: "University of Oxford", size: 7, weight: 500, color: P.text, y: 24 },
      { text: "✓ Verified institution", size: 5, color: P.verified, y: 38 },
      { text: "Nature — Peer-reviewed", size: 7, weight: 500, color: P.text, y: 54 },
      { text: "✓ Confirmed publication", size: 5, color: P.verified, y: 68 },
      { text: "Dr. Sarah Chen", size: 7, weight: 500, color: P.text, y: 84 },
      { text: "✓ Named researcher", size: 5, color: P.verified, y: 98 },
    ],
    w: 1.7, h: 1.5, x: 0.2, y: -1.4, z: -0.5, rot: 0.02,
  },
  // Red flags
  {
    lines: [
      { text: "RED FLAGS", size: 6, weight: 500, color: P.warning, y: 0 },
      { text: "02 DETECTED", size: 7, weight: 600, color: P.warning, y: 14 },
      { text: "━━━━━━━━━━━━━━━━━━━", size: 3, color: P.border, y: 28 },
      { text: "✗ Anonymous sourcing", size: 5, color: P.warning, y: 40 },
      { text: "✗ No verifiable citations", size: 5, color: P.warning, y: 52 },
    ],
    w: 1.4, h: 1.0, x: 2.6, y: 1.8, z: -0.6, rot: 0.05,
  },
  // Language analysis
  {
    lines: [
      { text: "LANGUAGE ANALYSIS", size: 6, weight: 500, color: P.sage, y: 0 },
      { text: "━━━━━━━━━━━━━━━━━━━━", size: 3, color: P.border, y: 12 },
      { text: "Tone: Professional", size: 5, color: P.secondary, y: 24 },
      { text: "Sensationalism: Low", size: 5, color: P.secondary, y: 36 },
      { text: "Emotional appeals: None", size: 5, color: P.secondary, y: 48 },
      { text: "ALL CAPS: No", size: 5, color: P.verified, y: 60 },
    ],
    w: 1.4, h: 1.2, x: -3.2, y: -0.6, z: -0.7, rot: 0.06,
  },
];

/* ─── Evidence connections ─── */
const LINES = [
  { from: 0, to: 1, color: P.verified },
  { from: 0, to: 3, color: P.gold },
  { from: 2, to: 4, color: P.warning },
  { from: 0, to: 5, color: P.sage },
];

function createPanelTexture(panel: typeof PANELS[0]): THREE.CanvasTexture {
  const scale = 2;
  const pw = panel.w * 100 * scale;
  const ph = panel.h * 100 * scale;
  const canvas = document.createElement("canvas");
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  const w = panel.w * 100;
  const h = panel.h * 100;

  // Background
  ctx.fillStyle = P.surface;
  ctx.fillRect(0, 0, w, h);

  // Border
  ctx.strokeStyle = P.border;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // Top accent line
  ctx.fillStyle = P.sage + "40";
  ctx.fillRect(3, 3, w - 6, 1);

  // Text
  panel.lines.forEach((line) => {
    ctx.font = `${line.weight || 400} ${line.size}px 'Inter', sans-serif`;
    ctx.fillStyle = line.color;
    ctx.textBaseline = "top";
    ctx.fillText(line.text, 12, 18 + line.y);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createSealTexture(): THREE.CanvasTexture {
  const scale = 2;
  const size = 180 * scale;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const cx = 90, cy = 90, r = 70;

  // Outer ring
  ctx.strokeStyle = P.sage + "50";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = P.sage + "25";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.stroke();

  // VERITAS text around circle
  ctx.font = "500 6px 'Inter', sans-serif";
  ctx.fillStyle = P.sage + "70";
  ctx.textAlign = "center";
  const txt = "· VERIFIED · VERITAS · ";
  const step = (Math.PI * 2) / txt.length;
  for (let i = 0; i < txt.length; i++) {
    const a = -Math.PI / 2 + i * step;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * (r - 16), cy + Math.sin(a) * (r - 16));
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(txt[i], 0, 0);
    ctx.restore();
  }

  // Checkmark
  ctx.strokeStyle = P.sage;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy);
  ctx.lineTo(cx - 3, cy + 8);
  ctx.lineTo(cx + 12, cy - 8);
  ctx.stroke();

  // VERITAS below
  ctx.font = "600 8px 'Inter', sans-serif";
  ctx.fillStyle = P.sage;
  ctx.textAlign = "center";
  ctx.fillText("VERITAS", cx, cy + r - 5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    panelMeshes: THREE.Mesh[];
    sealMesh: THREE.Mesh;
    scanPlane: THREE.Mesh;
    camera: THREE.PerspectiveCamera;
    mouse: THREE.Vector2;
    targetMouse: THREE.Vector2;
    clock: THREE.Clock;
    raf: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0B0D0C, 0.05);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const key = new THREE.DirectionalLight(0xF1F2EE, 0.4);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.PointLight(0x607568, 0.15, 20);
    fill.position.set(-5, 2, 4);
    scene.add(fill);
    const rim = new THREE.PointLight(0xA58B5B, 0.08, 15);
    rim.position.set(5, -4, -3);
    scene.add(rim);

    // Panels
    const panelMeshes: THREE.Mesh[] = [];
    PANELS.forEach((p) => {
      const tex = createPanelTexture(p);
      const geo = new THREE.PlaneGeometry(p.w, p.h);
      const mat = new THREE.MeshStandardMaterial({
        map: tex, transparent: true, opacity: 0.92,
        side: THREE.DoubleSide, roughness: 0.9, metalness: 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.rotation.set(0, 0, p.rot);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { bx: p.x, by: p.y, bz: p.z, br: p.rot, i: panelMeshes.length };
      scene.add(mesh);
      panelMeshes.push(mesh);
    });

    // Seal
    const sealTex = createSealTexture();
    const sealMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.0),
      new THREE.MeshStandardMaterial({
        map: sealTex, transparent: true, opacity: 0.7,
        side: THREE.DoubleSide, roughness: 0.4, metalness: 0.5,
      })
    );
    sealMesh.position.set(0, 0.3, 0.4);
    scene.add(sealMesh);

    // Scan line — muted sage
    const scanPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.01, 3.2),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(P.sage), transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    scanPlane.position.z = 0.3;
    scene.add(scanPlane);

    // Evidence lines
    LINES.forEach((l) => {
      const from = PANELS[l.from];
      const to = PANELS[l.to];
      const mid = new THREE.Vector3(
        (from.x + to.x) / 2, (from.y + to.y) / 2,
        Math.max(from.z, to.z) + 0.25
      );
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(from.x, from.y, from.z), mid,
        new THREE.Vector3(to.x, to.y, to.z)
      );
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(l.color), transparent: true, opacity: 0.08,
      });
      scene.add(new THREE.Line(geo, mat));
    });

    // Mouse
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    const onMouse = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        targetMouse.x = (t.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
      }
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    const onResize = () => {
      const w2 = container.clientWidth;
      const h2 = container.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouse.x += (targetMouse.x - mouse.x) * 0.03;
      mouse.y += (targetMouse.y - mouse.y) * 0.03;

      camera.position.x = mouse.x * 0.5;
      camera.position.y = mouse.y * 0.3;
      camera.lookAt(0, 0, -1);

      // Panel parallax — closer panels move more
      panelMeshes.forEach((m) => {
        const u = m.userData;
        const d = (u.bz + 2) * 0.4;
        m.position.x = u.bx + mouse.x * 0.1 * d;
        m.position.y = u.by + mouse.y * 0.06 * d + Math.sin(t * 0.2 + u.i * 1.5) * 0.02;
        m.rotation.y = mouse.x * 0.01 * d;
        m.rotation.x = mouse.y * 0.008 * d;
      });

      // Seal
      sealMesh.rotation.z = t * 0.08;
      sealMesh.position.y = 0.3 + Math.sin(t * 0.35) * 0.03;

      // Scanner — smooth sweep
      scanPlane.position.x = -4.5 + ((t * 0.35) % 9);
      scanPlane.material.opacity = 0.12 + Math.sin(t * 1.5) * 0.08;

      renderer.render(scene, camera);
    };

    stateRef.current = { renderer, panelMeshes, sealMesh, scanPlane, camera, mouse, targetMouse, clock, raf: 0 };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0" style={{ touchAction: "none" }} />;
}
