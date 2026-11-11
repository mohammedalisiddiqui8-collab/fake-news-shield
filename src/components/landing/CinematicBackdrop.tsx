import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  EllipseCurve,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   CINEMATIC BACKDROP — the title page's atmosphere, built in three.js.

   A slow camera inside a dark volume of drifting dust: two thin orbital
   rings tilt overhead, a single investigative scan beam crosses the frame
   every half minute, and three warm haze sheets sit far behind everything
   to give the black some depth. No bloom, no glow, no lens flare — the
   brightness ceiling is deliberately low so the ivory type stays the
   brightest thing on screen.

   Performance: the particle count drops by roughly 70% under 768px, the
   device pixel ratio is clamped, the whole loop is suspended when the tab
   is hidden or the hero scrolls out of view, and pointer parallax only
   exists for fine pointers. Anyone who asks the system for reduced motion
   gets a still frame, never a jitter.
   ═══════════════════════════════════════════════════════════════════════ */

const IVORY = 0xefeade;

function softDot(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function hazeSheet(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
    g.addColorStop(0, "rgba(236,230,214,0.55)");
    g.addColorStop(0.55, "rgba(214,206,188,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function beamSheet(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(241,236,222,0)");
    g.addColorStop(0.16, "rgba(241,236,222,0.85)");
    g.addColorStop(0.84, "rgba(241,236,222,0.85)");
    g.addColorStop(1, "rgba(241,236,222,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 256);
    const fade = ctx.createLinearGradient(0, 0, 32, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(0.5, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, 32, 256);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export default function CinematicBackdrop({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const small = window.matchMedia("(max-width: 767px)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.8));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(new Color(0x080807), 0);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(52, host.clientWidth / host.clientHeight, 0.1, 60);
    camera.position.set(0, 0, 8.5);

    const disposers: Array<() => void> = [];
    const keep = <T extends { dispose(): void }>(item: T): T => {
      disposers.push(() => item.dispose());
      return item;
    };

    /* ── dust ───────────────────────────────────────────────────────── */
    const count = small ? 280 : 900;
    const positions = new Float32Array(count * 3);
    const drift = new Float32Array(count);
    const sway = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 2] = -6 + Math.random() * 8;
      drift[i] = 0.04 + Math.random() * 0.16;
      sway[i] = Math.random() * Math.PI * 2;
    }
    const dustGeo = keep(new BufferGeometry());
    dustGeo.setAttribute("position", new BufferAttribute(positions, 3));
    const dustTex = keep(softDot());
    const dustMat = keep(
      new PointsMaterial({
        size: 0.075,
        map: dustTex,
        color: new Color(IVORY),
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    const dust = new Points(dustGeo, dustMat);
    scene.add(dust);

    /* ── orbital rings ──────────────────────────────────────────────── */
    const ringSpecs = [
      { r: 3.1, squash: 0.34, tilt: 0.16, op: 0.16, speed: 0.052 },
      { r: 4.4, squash: 0.3, tilt: -0.2, op: 0.1, speed: -0.038 },
      { r: 5.6, squash: 0.28, tilt: 0.1, op: 0.07, speed: 0.026 },
    ];
    const ringMeshes: LineLoop[] = [];
    for (const spec of ringSpecs) {
      const curve = new EllipseCurve(0, 0, spec.r, spec.r, 0, Math.PI * 2, false, 0);
      const geo = keep(new BufferGeometry().setFromPoints(curve.getPoints(small ? 96 : 180)));
      const mat = keep(
        new LineBasicMaterial({ color: new Color(IVORY), transparent: true, opacity: spec.op }),
      );
      const ring = new LineLoop(geo, mat);
      // Tilted toward the camera, not edge-on: the rings should read as
      // orbits around the room rather than as stray horizontal rules.
      ring.rotation.x = 1.12 + spec.tilt;
      ring.rotation.y = spec.squash * 0.5;
      ring.position.y = -0.2;
      ringMeshes.push(ring);
      scene.add(ring);
    }

    /* ── atmospheric haze ───────────────────────────────────────────── */
    const hazeTex = keep(hazeSheet());
    const hazePlane = keep(new PlaneGeometry(1, 1));
    const hazes: Mesh[] = [];
    const hazeSpecs = [
      { x: -3.6, y: 1.1, z: -5.5, s: 9, o: 0.14 },
      { x: 4.2, y: -1.4, z: -7, s: 11, o: 0.1 },
      { x: 0.8, y: 0.4, z: -9, s: 14, o: 0.08 },
    ];
    for (const h of hazeSpecs) {
      const mat = keep(
        new MeshBasicMaterial({
          map: hazeTex,
          transparent: true,
          opacity: h.o,
          depthWrite: false,
          blending: AdditiveBlending,
        }),
      );
      const mesh = new Mesh(hazePlane, mat);
      mesh.position.set(h.x, h.y, h.z);
      mesh.scale.set(h.s, h.s * 0.62, 1);
      scene.add(mesh);
      hazes.push(mesh);
    }

    /* ── the scan beam ──────────────────────────────────────────────── */
    const beamTex = keep(beamSheet());
    const beamMat = keep(
      new MeshBasicMaterial({
        map: beamTex,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    const beam = new Mesh(keep(new PlaneGeometry(0.5, 12)), beamMat);
    beam.position.set(-7, 0, -1.5);
    beam.visible = !reduce;
    scene.add(beam);

    /* ── camera + loop ──────────────────────────────────────────────── */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.active = true;
    };
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let elapsed = 0;

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) last = performance.now();
      },
      { threshold: 0.02 },
    );
    io.observe(host);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduce) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onVisibility = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      if (!reduce) elapsed += dt;

      // camera: a slow dolly, plus a fraction of pointer parallax
      const targetX = Math.sin(elapsed * 0.055) * 0.42 + pointer.tx * 0.38;
      const targetY = Math.cos(elapsed * 0.041) * 0.2 - pointer.ty * 0.16;
      pointer.x += (targetX - pointer.x) * (reduce ? 0 : Math.min(1, dt * 1.6));
      pointer.y += (targetY - pointer.y) * (reduce ? 0 : Math.min(1, dt * 1.6));
      camera.position.x = pointer.x;
      camera.position.y = pointer.y;
      camera.position.z = 8.5 + Math.sin(elapsed * 0.035) * 0.45;
      camera.lookAt(0, 0, 0);

      // dust: slow upward drift with a lateral breath
      if (!reduce) {
        const pos = dustGeo.getAttribute("position") as BufferAttribute;
        const arr = pos.array as Float32Array;
        for (let i = 0; i < count; i++) {
          const iy = i * 3 + 1;
          arr[iy] += drift[i] * dt;
          if (arr[iy] > 5.5) arr[iy] = -5.5;
          arr[i * 3] += Math.sin(elapsed * 0.25 + sway[i]) * 0.0015;
        }
        pos.needsUpdate = true;

        // rings turn almost imperceptibly
        ringMeshes.forEach((ring, i) => {
          ring.rotation.z += ringSpecs[i].speed * dt;
        });

        // scan beam crosses roughly every 26 seconds
        const period = 26;
        const p = (elapsed % period) / period;
        beam.position.x = -8 + p * 16;
        const edge = Math.min(1, Math.min(p * 6, (1 - p) * 6));
        beamMat.opacity = 0.18 * Math.max(0, edge);

        hazes.forEach((mesh, i) => {
          mesh.position.x = hazeSpecs[i].x + Math.sin(elapsed * 0.05 + i) * 0.5;
          mesh.position.y = hazeSpecs[i].y + Math.cos(elapsed * 0.04 + i) * 0.3;
        });
      }

      renderer.render(scene, camera);
    };

    if (reduce) {
      // One still frame is the whole experience: no loop, no GPU churn.
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (fine) window.removeEventListener("pointermove", onPointer);
      for (const d of disposers) d();
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, [reduce]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* The atmosphere never becomes the subject: a vertical wash anchors the
          type side of the hero back into the black, and a very soft warm key
          sits behind the specimen panel. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 38% at 74% 34%, rgba(241,240,234,0.07), rgba(241,240,234,0.02) 45%, transparent 72%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,8,7,0.92) 0%, rgba(8,8,7,0.55) 42%, rgba(8,8,7,0.08) 70%, rgba(8,8,7,0.35) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-44"
        style={{ background: "linear-gradient(180deg, rgba(8,8,7,0), #080807)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 95% at 50% 45%, transparent 46%, rgba(4,4,3,0.42) 82%, rgba(4,4,3,0.68) 100%)",
        }}
      />
    </div>
  );
}
