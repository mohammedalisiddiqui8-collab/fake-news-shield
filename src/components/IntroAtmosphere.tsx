import { useEffect, useMemo, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   INTRO ATMOSPHERE — depth only, nothing else.

   Three quiet layers behind the title page:
     1. Charcoal editorial panels — flat DOM surfaces in CSS 3D perspective,
        deep in the background, hugging the edges. Abstract surfaces, not
        objects: no glow, no colour, no particles, no WebGL.
     2. One scan line — a 1px ivory rule travelling left → right. As it
        crosses a panel, that panel warms by a few percent, then settles.
     3. A numberless clock — real local time, thin ivory hands, second
        hand sweeping in real time.

   Reduced motion: the composition renders static (panels + correct-time
   clock), no scan line, no parallax, no sweep.
   ═══════════════════════════════════════════════════════════════════════ */

const REDUCE =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 640;

type PanelCfg = {
  left: number; // % of viewport width (panel centre)
  top: number; // % of viewport height
  w: number; // vw
  h: number; // vh
  d: number; // proximity 0 (far) … 1 (near)
  rx: number; // deg
  ry: number;
  rz: number;
  iv: number; // base ivory lift
  rules?: boolean; // faint ruled-paper hint
};

const PANELS: PanelCfg[] = [
  { left: 8, top: 18, w: 15, h: 26, d: 0.85, rx: -14, ry: 22, rz: -7, iv: 0.05, rules: true },
  { left: 88, top: 12, w: 13, h: 22, d: 0.7, rx: 12, ry: -26, rz: 5, iv: 0.042 },
  { left: 5, top: 78, w: 16, h: 20, d: 0.6, rx: 9, ry: 18, rz: 3, iv: 0.038 },
  { left: 91, top: 72, w: 12, h: 24, d: 0.75, rx: -10, ry: -20, rz: -4, iv: 0.045, rules: true },
  { left: 20, top: 6, w: 10, h: 14, d: 0.95, rx: -6, ry: 14, rz: 9, iv: 0.058 },
  { left: 78, top: 40, w: 9, h: 16, d: 1.0, rx: 4, ry: -12, rz: -9, iv: 0.062 },
  { left: 30, top: 92, w: 12, h: 12, d: 0.5, rx: 16, ry: 8, rz: -3, iv: 0.032 },
  { left: 62, top: 90, w: 10, h: 14, d: 0.9, rx: -12, ry: -10, rz: 6, iv: 0.05 },
];

/** Mobile keeps three, smaller and pushed to the corners. */
const MOBILE_IDX = [0, 1, 3];

const SCAN_PERIOD = 88; // seconds, left → right

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export default function IntroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const childRefs = useRef<Array<HTMLDivElement | null>>([]);

  const panels = useMemo(() => {
    const idx = IS_SMALL ? MOBILE_IDX : PANELS.map((_, i) => i);
    return idx.map((i) => {
      const p = PANELS[i];
      const shrink = IS_SMALL ? 0.85 : 1;
      return { ...p, w: p.w * shrink, h: p.h * shrink };
    });
  }, []);

  const clock = useMemo(() => {
    const now = new Date();
    return { second: now.getSeconds(), minute: now.getMinutes(), hour: now.getHours() };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    let paused = document.hidden;
    const onVisibility = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* Live clock hands — hour/minute step gently; the second hand sweeps
       via a CSS animation phase-locked to the load time. */
    const hourRef = { current: root.querySelector<SVGLineElement>("[data-hand-hour]") };
    const minuteRef = { current: root.querySelector<SVGLineElement>("[data-hand-minute]") };
    const syncHands = () => {
      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      hourRef.current?.setAttribute("transform", `rotate(${h * 30 + m * 0.5} 50 50)`);
      minuteRef.current?.setAttribute("transform", `rotate(${m * 6 + s * 0.1} 50 50)`);
    };
    syncHands();
    const clockTimer = REDUCE ? undefined : setInterval(syncHands, 1000);

    if (REDUCE) return () => {
      if (clockTimer) clearInterval(clockTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };

    /* Pointer parallax — heavily damped; drift before any pointer input. */
    const pointer = { x: 0, y: 0 };
    let tracked = false;
    let blend = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      tracked = true;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let t = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (paused) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      blend = Math.min(1, blend + (tracked ? dt / 2.5 : 0));
      const driftX = Math.sin(t * 0.021) * 5 + Math.sin(t * 0.007) * 3;
      const driftY = Math.cos(t * 0.017) * 4;
      const px = (driftX * (1 - blend) + pointer.x * 9 * blend) / 1;
      const py = (driftY * (1 - blend) + pointer.y * 6 * blend) / 1;

      // Scan line: -8% → 108% so it enters and leaves fully offscreen.
      const sp = ((t % SCAN_PERIOD) / SCAN_PERIOD) * 116 - 8;
      const edgeFade = clamp01(sp / 6) * clamp01((108 - sp) / 6);
      if (scanRef.current) {
        scanRef.current.style.left = `${sp}%`;
        scanRef.current.style.opacity = `${0.55 * edgeFade}`;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scanPx = (sp / 100) * vw;

      panels.forEach((p, i) => {
        const wrap = wrapRefs.current[i];
        const child = childRefs.current[i];
        if (!wrap || !child) return;
        wrap.style.setProperty("--px", `${(px * (0.35 + p.d)).toFixed(2)}px`);
        wrap.style.setProperty("--py", `${(py * (0.3 + p.d * 0.8)).toFixed(2)}px`);

        // Panel-local scan position → soft exposure band.
        const wpx = (p.w / 100) * vw;
        const local = ((scanPx - (p.left / 100) * vw) / wpx + 0.5) * 100;
        const exposure =
          local > -18 && local < 118
            ? p.iv * 1.9 * Math.exp(-(((local - 50) / 26) ** 2))
            : 0;
        child.style.setProperty("--sp", `${local.toFixed(2)}%`);
        child.style.setProperty("--sx", exposure.toFixed(4));
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (clockTimer) clearInterval(clockTimer);
    };
  }, [panels]);

  return (
    <div ref={rootRef} className="intro-atmosphere absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* ── Charcoal panels in depth ── */}
      {panels.map((p, i) => {
        const c1 = `hsl(228 8% ${(8.6 + p.d * 2.2).toFixed(1)}%)`;
        const c2 = `hsl(228 9% ${(4.6 + p.d * 1.6).toFixed(1)}%)`;
        const style = {
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: `${p.w}vw`,
          height: `${p.h}vh`,
          opacity: 0.5 + p.d * 0.34,
          filter: `blur(${((1 - p.d) * 1.6).toFixed(2)}px)`,
        } as React.CSSProperties;
        const inner = {
          "--rx": `${p.rx}deg`,
          "--ry": `${p.ry}deg`,
          "--rz": `${p.rz}deg`,
          "--iv": (p.iv * (0.6 + p.d * 0.4)).toFixed(4),
          "--bo": (0.04 + p.d * 0.035).toFixed(4),
          "--sp": "50%",
          "--sx": "0",
          backgroundImage: [
            "linear-gradient(100deg, transparent calc(var(--sp) - 13%), rgb(212 208 196 / var(--sx)) var(--sp), transparent calc(var(--sp) + 13%))",
            ...(p.rules
              ? ["repeating-linear-gradient(0deg, transparent 0 22px, rgb(226 222 210 / 0.017) 22px 23px)"]
              : []),
            `linear-gradient(115deg, ${c1}, ${c2})`,
          ].join(", "),
        } as React.CSSProperties;
        return (
          <div
            key={i}
            ref={(el) => {
              wrapRefs.current[i] = el;
            }}
            className="atmo-parallax absolute"
            style={style}
          >
            <div
              ref={(el) => {
                childRefs.current[i] = el;
              }}
              className="panel3d h-full w-full"
              style={inner}
            />
          </div>
        );
      })}

      {/* ── The scan line (motion only) ── */}
      {!REDUCE && (
        <div ref={scanRef} className="atmo-scan" style={{ left: "-8%", opacity: 0 }}>
          <div className="atmo-scan-flank" />
          <div className="atmo-scan-core" />
          <div className="atmo-scan-flank-r" />
        </div>
      )}

      {/* ── Numberless clock, peripheral ── */}
      <div className={`absolute ${IS_SMALL ? "bottom-5 right-5 h-11 w-11" : "bottom-8 right-10 h-16 w-16"}`}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {/* Dial: outline only, no numerals. */}
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="rgb(226 222 210 / 0.16)" strokeWidth="1.4" />
          {Array.from({ length: 60 }, (_, k) => {
            const fifth = k % 5 === 0;
            const a = (k / 60) * Math.PI * 2;
            const r1 = fifth ? 41.5 : 44.5;
            const x1 = 50 + Math.sin(a) * r1;
            const y1 = 50 - Math.cos(a) * r1;
            const x2 = 50 + Math.sin(a) * 47.2;
            const y2 = 50 - Math.cos(a) * 47.2;
            return (
              <line
                key={k}
                x1={x1.toFixed(2)}
                y1={y1.toFixed(2)}
                x2={x2.toFixed(2)}
                y2={y2.toFixed(2)}
                stroke={fifth ? "rgb(226 222 210 / 0.38)" : "rgb(226 222 210 / 0.13)"}
                strokeWidth={fifth ? 1.2 : 0.6}
              />
            );
          })}
          {/* Hands — thin, ivory; seconds in muted crimson, sweeping live. */}
          <line data-hand-hour x1="50" y1="50" x2="50" y2="30" stroke="rgb(226 222 210 / 0.5)" strokeWidth="2.4" strokeLinecap="round" />
          <line data-hand-minute x1="50" y1="50" x2="50" y2="23" stroke="rgb(226 222 210 / 0.42)" strokeWidth="1.4" strokeLinecap="round" />
          {!REDUCE && (
            <g className="atmo-second" style={{ animationDelay: `-${clock.second}s` }}>
              <line x1="50" y1="56" x2="50" y2="21" stroke="rgb(168 71 66 / 0.72)" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          )}
          <circle cx="50" cy="50" r="1.7" fill="rgb(226 222 210 / 0.55)" />
        </svg>
      </div>
    </div>
  );
}
