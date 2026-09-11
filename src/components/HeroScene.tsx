"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";

/* ─── Panel Data: realistic editorial content ─── */
const PANELS = [
  // Main article — large, front-left
  {
    type: "article" as const,
    lines: [
      { text: "THE DAILY CHRONICLE", size: 7, weight: 700, color: "#E2DDD4", y: 0 },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 5, weight: 400, color: "#1A211E", y: 12 },
      { text: "Scientists Confirm New Species", size: 14, weight: 700, color: "#E2DDD4", y: 28 },
      { text: "Discovered in Deep Ocean", size: 14, weight: 700, color: "#E2DDD4", y: 46 },
      { text: "Expedition", size: 14, weight: 700, color: "#E2DDD4", y: 64 },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 5, weight: 400, color: "#1A211E", y: 80 },
      { text: "Marine biologists from the University of Oxford", size: 7, weight: 400, color: "#6B7270", y: 96 },
      { text: "have identified a previously unknown deep-sea", size: 7, weight: 400, color: "#6B7270", y: 108 },
      { text: "species in the Mariana Trench at 8,200 meters.", size: 7, weight: 400, color: "#6B7270", y: 120 },
      { text: "Lead researcher Dr. Sarah Chen published", size: 7, weight: 400, color: "#6B7270", y: 132 },
      { text: "the findings in Nature on March 15, 2025.", size: 7, weight: 400, color: "#6B7270", y: 144 },
    ],
    w: 3.2, h: 2.4, x: -2.0, y: 0.3, z: 0, rot: 0.06,
    bgColor: "#0E1210", borderColor: "#1A211E",
  },
  // Credibility score card — overlapping, right
  {
    type: "score" as const,
    lines: [
      { text: "CREDIBILITY SCORE", size: 7, weight: 500, color: "#6B7270", y: 0 },
      { text: "92", size: 48, weight: 700, color: "#3EE8B8", y: 30 },
      { text: "LIKELY CREDIBLE", size: 9, weight: 600, color: "#3EE8B8", y: 88 },
      { text: "━━━━━━━━━━━━━━━━━━", size: 4, weight: 400, color: "#1A211E", y: 104 },
      { text: "Named sources: ✓", size: 7, weight: 400, color: "#3EE8B8", y: 118 },
      { text: "Citations: ✓", size: 7, weight: 400, color: "#3EE8B8", y: 130 },
      { text: "Balance: ✓", size: 7, weight: 400, color: "#3EE8B8", y: 142 },
      { text: "Logic: ✓", size: 7, weight: 400, color: "#3EE8B8", y: 154 },
    ],
    w: 1.8, h: 2.2, x: 1.6, y: 0.8, z: -0.4, rot: -0.04,
    bgColor: "#0B0E0D", borderColor: "#3EE8B830",
  },
  // Misleading article — back, angled
  {
    type: "article" as const,
    lines: [
      { text: "EXPOSED!!!", size: 12, weight: 700, color: "#E85D4A", y: 0 },
      { text: "Secret Cure Hidden", size: 11, weight: 700, color: "#E2DDD4", y: 18 },
      { text: "by Big Pharma", size: 11, weight: 700, color: "#E2DDD4", y: 34 },
      { text: "━━━━━━━━━━━━━━━━━━", size: 4, weight: 400, color: "#1A211E", y: 50 },
      { text: "Anonymous insider known only as", size: 6, weight: 400, color: "#6B7270", y: 62 },
      { text: "'Dr. Truth' revealed in a viral post", size: 6, weight: 400, color: "#6B7270", y: 74 },
      { text: "that a simple mixture can cure", size: 6, weight: 400, color: "#6B7270", y: 86 },
      { text: "ALL diseases!!!", size: 6, weight: 600, color: "#E85D4A", y: 98 },
    ],
    w: 2.4, h: 1.8, x: 3.2, y: -0.6, z: -1.2, rot: -0.12,
    bgColor: "#0E1210", borderColor: "#E85D4A25",
  },
  // Source verification card
  {
    type: "verification" as const,
    lines: [
      { text: "SOURCE VERIFICATION", size: 7, weight: 600, color: "#D4A85C", y: 0 },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 4, weight: 400, color: "#1A211E", y: 14 },
      { text: "University of Oxford", size: 8, weight: 500, color: "#E2DDD4", y: 30 },
      { text: "✓ Verified institution", size: 6, weight: 400, color: "#3EE8B8", y: 44 },
      { text: "Journal: Nature", size: 8, weight: 500, color: "#E2DDD4", y: 62 },
      { text: "✓ Peer-reviewed", size: 6, weight: 400, color: "#3EE8B8", y: 76 },
      { text: "Lead: Dr. Sarah Chen", size: 8, weight: 500, color: "#E2DDD4", y: 94 },
      { text: "✓ Named researcher", size: 6, weight: 400, color: "#3EE8B8", y: 108 },
      { text: "NSF Funding: ✓", size: 6, weight: 400, color: "#3EE8B8", y: 126 },
    ],
    w: 2.0, h: 1.8, x: -0.2, y: -1.6, z: -0.6, rot: 0.03,
    bgColor: "#0B0E0D", borderColor: "#D4A85C25",
  },
  // Red flags card
  {
    type: "flags" as const,
    lines: [
      { text: "RED FLAGS", size: 7, weight: 600, color: "#E85D4A", y: 0 },
      { text: "02 DETECTED", size: 8, weight: 700, color: "#E85D4A", y: 16 },
      { text: "━━━━━━━━━━━━━━━━━━━━━", size: 4, weight: 400, color: "#1A211E", y: 32 },
      { text: "✗ Anonymous sourcing", size: 6, weight: 400, color: "#E85D4A", y: 46 },
      { text: "✗ No verifiable citations", size: 6, weight: 400, color: "#E85D4A", y: 58 },
    ],
    w: 1.6, h: 1.2, x: 2.8, y: 2.0, z: -0.8, rot: 0.08,
    bgColor: "#0E1210", borderColor: "#E85D4A20",
  },
  // Language analysis
  {
    type: "analysis" as const,
    lines: [
      { text: "LANGUAGE ANALYSIS", size: 7, weight: 600, color: "#3EE8B8", y: 0 },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━", size: 4, weight: 400, color: "#1A211E", y: 14 },
      { text: "Tone: Professional", size: 6, weight: 400, color: "#6B7270", y: 28 },
      { text: "Sensationalism: Low", size: 6, weight: 400, color: "#6B7270", y: 40 },
      { text: "Emotional appeals: None", size: 6, weight: 400, color: "#6B7270", y: 52 },
      { text: "ALL CAPS: No", size: 6, weight: 400, color: "#3EE8B8", y: 64 },
      { text: "Exclamation marks: 0", size: 6, weight: 400, color: "#3EE8B8", y: 76 },
    ],
    w: 1.6, h: 1.4, x: -3.4, y: -0.8, z: -0.9, rot: 0.1,
    bgColor: "#0B0E0D", borderColor: "#3EE8B815",
  },
];

/* ─── Connecting evidence lines ─── */
const EVIDENCE_LINES = [
  { from: 0, to: 1, color: "#3EE8B8" },   // article → credibility
  { from: 0, to: 3, color: "#D4A85C" },   // article → source verification
  { from: 2, to: 4, color: "#E85D4A" },   // fake article → red flags
  { from: 0, to: 5, color: "#3EE8B8" },   // article → language analysis
  { from: 1, to: 3, color: "#6B7270" },   // credibility → source verification
];

/* ─── Verification seal ─── */
const SEAL = {
  x: 0, y: 0.2, z: 0.5,
  radius: 0.55,
};

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
  ctx.fillStyle = panel.bgColor;
  ctx.fillRect(0, 0, w, h);

  // Border
  const borderAlpha = panel.borderColor.includes("#") ? panel.borderColor.slice(-2) : "30";
  ctx.strokeStyle = panel.borderColor;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // Top accent
  const accentColor = panel.lines[0]?.color || "#3EE8B8";
  ctx.fillStyle = accentColor + "40";
  ctx.fillRect(3, 3, w - 6, 1.5);

  // Render text lines
  panel.lines.forEach((line) => {
    ctx.font = `${line.weight} ${line.size}px 'Inter', 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = line.color;
    ctx.textBaseline = "top";
    ctx.fillText(line.text, 14, 20 + line.y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSealTexture(): THREE.CanvasTexture {
  const scale = 2;
  const size = 200 * scale;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const cx = 100, cy = 100, r = 80;

  // Outer ring
  ctx.strokeStyle = "#3EE8B860";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = "#3EE8B830";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
  ctx.stroke();

  // VERITAS text around the circle
  ctx.font = "600 8px 'Inter', sans-serif";
  ctx.fillStyle = "#3EE8B890";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = "· VERIFIED · VERITAS · ";
  const angleStep = (Math.PI * 2) / text.length;
  for (let i = 0; i < text.length; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * (r - 20), cy + Math.sin(angle) * (r - 20));
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  // Center checkmark
  ctx.strokeStyle = "#3EE8B8";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy);
  ctx.lineTo(cx - 4, cy + 10);
  ctx.lineTo(cx + 14, cy - 10);
  ctx.stroke();

  // VERITAS text below
  ctx.font = "700 10px 'Inter', sans-serif";
  ctx.fillStyle = "#3EE8B8";
  ctx.textAlign = "center";
  ctx.fillText("VERITAS", cx, cy + r - 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    panelMeshes: THREE.Mesh[];
    lineMeshes: THREE.Line[];
    sealMesh: THREE.Mesh;
    scanPlane: THREE.Mesh;
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
    scene.fog = new THREE.FogExp2(0x080A09, 0.06);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting — editorial, directional
    const ambient = new THREE.AmbientLight(0xffffff, 0.12);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xE2DDD4, 0.5);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.PointLight(0x3EE8B8, 0.2, 20);
    fill.position.set(-6, 2, 4);
    scene.add(fill);
    const rim = new THREE.PointLight(0xD4A85C, 0.1, 15);
    rim.position.set(5, -4, -3);
    scene.add(rim);

    // Create panel meshes
    const panelMeshes: THREE.Mesh[] = [];
    PANELS.forEach((p) => {
      const texture = createPanelTexture(p);
      const geo = new THREE.PlaneGeometry(p.w, p.h);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        roughness: 0.85,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.rotation.set(0, 0, p.rot);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { baseX: p.x, baseY: p.y, baseZ: p.z, baseRot: p.rot, idx: panelMeshes.length };
      scene.add(mesh);
      panelMeshes.push(mesh);
    });

    // Verification seal
    const sealTexture = createSealTexture();
    const sealGeo = new THREE.PlaneGeometry(SEAL.radius * 2, SEAL.radius * 2);
    const sealMat = new THREE.MeshStandardMaterial({
      map: sealTexture,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.6,
    });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.position.set(SEAL.x, SEAL.y, SEAL.z);
    scene.add(sealMesh);

    // Scanning plane — thin line that moves across panels
    const scanGeo = new THREE.PlaneGeometry(0.015, 3.5);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x3EE8B8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.position.z = 0.3;
    scene.add(scanPlane);

    // Evidence lines
    const lineMeshes: THREE.Line[] = [];
    EVIDENCE_LINES.forEach((l) => {
      const from = PANELS[l.from];
      const to = PANELS[l.to];
      const mid = new THREE.Vector3(
        (from.x + to.x) / 2,
        (from.y + to.y) / 2,
        Math.max(from.z, to.z) + 0.3
      );
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(from.x, from.y, from.z),
        mid,
        new THREE.Vector3(to.x, to.y, to.z)
      );
      const points = curve.getPoints(40);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(l.color),
        transparent: true,
        opacity: 0.1,
      });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      lineMeshes.push(line);
    });

    // State
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

      // Smooth mouse
      mouse.x += (targetMouse.x - mouse.x) * 0.035;
      mouse.y += (targetMouse.y - mouse.y) * 0.035;

      // Camera parallax
      camera.position.x = mouse.x * 0.6;
      camera.position.y = mouse.y * 0.35;
      camera.lookAt(0, 0, -1);

      // Panel float — each at different speed based on depth
      panelMeshes.forEach((mesh) => {
        const ud = mesh.userData;
        const depthFactor = (ud.baseZ + 2) * 0.5; // closer = more movement
        mesh.position.x = ud.baseX + mouse.x * 0.12 * depthFactor;
        mesh.position.y = ud.baseY + mouse.y * 0.08 * depthFactor + Math.sin(t * 0.25 + ud.idx * 1.3) * 0.03;
        mesh.rotation.y = mouse.x * 0.015 * depthFactor;
        mesh.rotation.x = mouse.y * 0.01 * depthFactor;
      });

      // Seal rotation and float
      sealMesh.rotation.z = t * 0.1;
      sealMesh.position.y = SEAL.y + Math.sin(t * 0.4) * 0.04;
      sealMesh.position.x = SEAL.x + mouse.x * 0.05;

      // Scan line movement
      scanPlane.position.x = -4 + ((t * 0.4) % 8);
      scanPlane.material.opacity = 0.15 + Math.sin(t * 2) * 0.1;

      renderer.render(scene, camera);
    };

    stateRef.current = {
      scene, camera, renderer, panelMeshes, lineMeshes, sealMesh, scanPlane,
      mouse, targetMouse, clock, raf: 0,
    };
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

  return (
    <div ref={containerRef} className="absolute inset-0 z-0" style={{ touchAction: "none" }} />
  );
}
