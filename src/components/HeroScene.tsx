"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";

/* ─── Data: floating panels ─── */
const PANELS = [
  { text: "BREAKING: Scientists Confirm\nNew Species in Deep Ocean", color: "#E2DDD4", x: -3.2, y: 1.2, z: -1, rot: 0.15, w: 2.8, h: 1.6, opacity: 0.7 },
  { text: "Anonymous Sources Claim\nGovernment Cover-Up", color: "#E85D4A", x: 2.8, y: 0.8, z: -2, rot: -0.12, w: 2.4, h: 1.4, opacity: 0.5 },
  { text: "VERIFIED ✓\nNamed officials, cited statistics\nMultiple independent sources", color: "#3EE8B8", x: -2.5, y: -1.5, z: -0.5, rot: 0.08, w: 2.6, h: 1.2, opacity: 0.6 },
  { text: "MISLEADING ✗\nSensational headline\nNo verifiable sources", color: "#E85D4A", x: 3.0, y: -1.0, z: -1.5, rot: -0.1, w: 2.2, h: 1.3, opacity: 0.45 },
  { text: "CREDIBILITY: 92%\nSource: Nature Journal\nPeer-reviewed", color: "#D4A85C", x: -0.5, y: 2.0, z: -2.5, rot: 0.05, w: 2.0, h: 1.0, opacity: 0.35 },
  { text: "FACT-CHECK RESULTS\n3 Red Flags Detected\nSeverity: HIGH", color: "#E85D4A", x: 0.8, y: -2.0, z: -1.8, rot: -0.06, w: 2.3, h: 1.1, opacity: 0.4 },
  { text: "LIAR DATASET\nWang (2017)\n14,403 statements", color: "#6B7270", x: -4.0, y: 0.0, z: -3, rot: 0.2, w: 1.8, h: 0.9, opacity: 0.25 },
  { text: "LOGICAL CONSISTENCY\nInternal contradictions: 0\nArgument structure: VALID", color: "#3EE8B8", x: 4.2, y: 0.2, z: -2.8, rot: -0.18, w: 2.0, h: 1.0, opacity: 0.3 },
];

/* ─── Data: connecting lines ─── */
const LINES = [
  { from: 0, to: 2, color: "#3EE8B8" },
  { from: 1, to: 3, color: "#E85D4A" },
  { from: 0, to: 4, color: "#D4A85C" },
  { from: 2, to: 5, color: "#3EE8B8" },
  { from: 6, to: 0, color: "#6B7270" },
  { from: 7, to: 3, color: "#6B7270" },
];

/* ─── Data: evidence dots ─── */
const DOTS = [
  { x: -1.5, y: 0.5, z: 0.2, color: "#3EE8B8", size: 0.04 },
  { x: 1.8, y: -0.3, z: 0.1, color: "#E85D4A", size: 0.03 },
  { x: -0.8, y: -1.2, z: 0.3, color: "#D4A85C", size: 0.035 },
  { x: 2.5, y: 1.5, z: 0.15, color: "#3EE8B8", size: 0.025 },
  { x: -3.0, y: -0.8, z: 0.05, color: "#6B7270", size: 0.03 },
  { x: 0.3, y: 1.8, z: 0.25, color: "#3EE8B8", size: 0.04 },
  { x: 3.5, y: -1.5, z: 0.1, color: "#E85D4A", size: 0.025 },
];

function createTextTexture(text: string, color: string, w: number, h: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = w * 100 * scale;
  canvas.height = h * 100 * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = "rgba(14, 18, 16, 0.85)";
  ctx.fillRect(0, 0, w * 100, h * 100);

  // Border
  ctx.strokeStyle = color + "30";
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 4, w * 100 - 8, h * 100 - 8);

  // Top accent line
  ctx.fillStyle = color + "60";
  ctx.fillRect(4, 4, w * 100 - 8, 2);

  // Text
  const lines = text.split("\n");
  const fontSize = Math.min(11, (w * 100 - 30) / Math.max(...lines.map(l => l.length)) * 1.1);
  ctx.font = `500 ${fontSize}px 'Inter', sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";

  const lineH = fontSize * 1.5;
  const totalH = lines.length * lineH;
  const startY = (h * 100 - totalH) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, 14, startY + i * lineH);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    panelMeshes: THREE.Mesh[];
    lineMeshes: THREE.Line[];
    dotMeshes: THREE.Mesh[];
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

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080A09, 0.08);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xE2DDD4, 0.4);
    key.position.set(5, 5, 5);
    scene.add(key);
    const fill = new THREE.PointLight(0x3EE8B8, 0.3, 20);
    fill.position.set(-5, 2, 3);
    scene.add(fill);
    const rim = new THREE.PointLight(0xD4A85C, 0.15, 15);
    rim.position.set(3, -3, -2);
    scene.add(rim);

    // Create panel meshes
    const panelMeshes: THREE.Mesh[] = [];
    PANELS.forEach((p) => {
      const texture = createTextTexture(p.text, p.color, p.w, p.h);
      const geo = new THREE.PlaneGeometry(p.w, p.h);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: p.opacity,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.rotation.set(0, 0, p.rot);
      mesh.userData = { baseX: p.x, baseY: p.y, baseZ: p.z, baseRot: p.rot, index: panelMeshes.length };
      scene.add(mesh);
      panelMeshes.push(mesh);
    });

    // Create connecting lines
    const lineMeshes: THREE.Line[] = [];
    LINES.forEach((l) => {
      const from = PANELS[l.from];
      const to = PANELS[l.to];
      const points = [
        new THREE.Vector3(from.x, from.y, from.z),
        new THREE.Vector3(
          (from.x + to.x) / 2,
          (from.y + to.y) / 2,
          (from.z + to.z) / 2 - 0.3
        ),
        new THREE.Vector3(to.x, to.y, to.z),
      ];
      const curve = new THREE.QuadraticBezierCurve3(...points);
      const curvePoints = curve.getPoints(30);
      const geo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const color = new THREE.Color(l.color);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.12 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      lineMeshes.push(line);
    });

    // Create evidence dots
    const dotMeshes: THREE.Mesh[] = [];
    DOTS.forEach((d) => {
      const geo = new THREE.SphereGeometry(d.size, 12, 12);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(d.color),
        emissive: new THREE.Color(d.color),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.x, d.y, d.z);
      mesh.userData = { baseY: d.y, phase: Math.random() * Math.PI * 2 };
      scene.add(mesh);
      dotMeshes.push(mesh);
    });

    // Central verification ring
    const ringGeo = new THREE.TorusGeometry(0.6, 0.008, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x3EE8B8,
      emissive: 0x3EE8B8,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.4,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Inner ring
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.005, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x1A211E, transparent: true, opacity: 0.3 })
    );
    innerRing.rotation.x = Math.PI / 2;
    scene.add(innerRing);

    // Checkmark
    const checkGeo1 = new THREE.BoxGeometry(0.025, 0.2, 0.025);
    const checkMat = new THREE.MeshStandardMaterial({ color: 0x3EE8B8, emissive: 0x3EE8B8, emissiveIntensity: 1, roughness: 0.1, metalness: 0.9 });
    const check1 = new THREE.Mesh(checkGeo1, checkMat);
    check1.position.set(-0.06, 0.0, 0);
    check1.rotation.z = 0.5;
    scene.add(check1);
    const check2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.32, 0.025),
      checkMat
    );
    check2.position.set(0.04, 0.02, 0);
    scene.add(check2);

    // State
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    // Mouse handler
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

    // Resize
    const onResize = () => {
      const w2 = container.clientWidth;
      const h2 = container.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener("resize", onResize);

    // Animate
    const animate = () => {
      const t = clock.getElapsedTime();
      const raf = requestAnimationFrame(animate);

      // Smooth mouse
      mouse.x += (targetMouse.x - mouse.x) * 0.04;
      mouse.y += (targetMouse.y - mouse.y) * 0.04;

      // Camera subtle movement
      camera.position.x = mouse.x * 0.5;
      camera.position.y = mouse.y * 0.3;
      camera.lookAt(0, 0, -1);

      // Panel movement
      panelMeshes.forEach((mesh) => {
        const ud = mesh.userData;
        mesh.position.x = ud.baseX + mouse.x * 0.15 * (ud.baseZ + 3);
        mesh.position.y = ud.baseY + mouse.y * 0.1 * (ud.baseZ + 3) + Math.sin(t * 0.3 + ud.index) * 0.05;
        mesh.rotation.y = mouse.x * 0.03;
        mesh.rotation.x = mouse.y * 0.02;
      });

      // Ring rotation
      ring.rotation.z = t * 0.2;
      innerRing.rotation.z = -t * 0.15;
      ring.scale.setScalar(1 + Math.sin(t * 1.5) * 0.02);

      // Dot float
      dotMeshes.forEach((mesh) => {
        const ud = mesh.userData;
        mesh.position.y = ud.baseY + Math.sin(t * 0.8 + ud.phase) * 0.15;
      });

      renderer.render(scene, camera);
      sceneRef.current!.raf = raf;
    };

    sceneRef.current = {
      scene, camera, renderer, panelMeshes, lineMeshes, dotMeshes,
      mouse, targetMouse, clock, raf: 0,
    };
    animate();

    return () => {
      cancelAnimationFrame(sceneRef.current?.raf ?? 0);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ touchAction: "none" }}
    />
  );
}
