"use client";
import { useRef, useEffect, useState } from "react";

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
      setMouse({ x, y });
    };
    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (t) handleMove(t.clientX, t.clientY); };
    el.addEventListener("mousemove", onMouse, { passive: true });
    el.addEventListener("touchmove", onTouch, { passive: true });
    return () => { el.removeEventListener("mousemove", onMouse); el.removeEventListener("touchmove", onTouch); };
  }, []);

  const rx = mouse.y * -8;
  const ry = mouse.x * 8;

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden" style={{ perspective: "1200px" }}>
      {/* Grid dot background */}
      <div className="absolute inset-0 grid-dot-bg opacity-30" />

      {/* Rotating scene */}
      <div className="relative" style={{
        transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        transformStyle: "preserve-3d",
      }}>
        {/* Outer ring */}
        <div className="absolute -inset-32 sm:-inset-48" style={{
          border: "1px solid rgba(45,212,168,0.12)",
          borderRadius: "50%",
          animation: "spin 30s linear infinite",
          transformStyle: "preserve-3d",
        }}>
          {/* Orbital dots on outer ring */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <div key={i} className="absolute" style={{
              top: "50%", left: "50%",
              transform: `rotate(${deg}deg) translateX(${typeof window !== "undefined" && window.innerWidth < 640 ? 120 : 180}px) translateY(-50%)`,
            }}>
              <div className="w-2 h-2 rounded-full" style={{
                background: i % 2 === 0 ? "#2DD4A8" : "#C4985A",
                boxShadow: `0 0 8px ${i % 2 === 0 ? "rgba(45,212,168,0.5)" : "rgba(196,152,90,0.5)"}`,
              }} />
            </div>
          ))}
        </div>

        {/* Middle ring */}
        <div className="absolute -inset-20 sm:-inset-32" style={{
          border: "1px solid rgba(45,212,168,0.08)",
          borderRadius: "50%",
          animation: "spin 20s linear infinite reverse",
          transformStyle: "preserve-3d",
        }}>
          {[0, 90, 180, 270].map((deg, i) => (
            <div key={i} className="absolute" style={{
              top: "50%", left: "50%",
              transform: `rotate(${deg}deg) translateX(${typeof window !== "undefined" && window.innerWidth < 640 ? 78 : 120}px) translateY(-50%)`,
            }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{
                background: "#2DD4A8",
                boxShadow: "0 0 6px rgba(45,212,168,0.4)",
              }} />
            </div>
          ))}
        </div>

        {/* Inner ring */}
        <div className="absolute -inset-10 sm:-inset-16" style={{
          border: "1px solid rgba(45,212,168,0.06)",
          borderRadius: "50%",
          animation: "spin 12s linear infinite",
        }} />

        {/* Center verification mark */}
        <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full" style={{
            background: "radial-gradient(circle, rgba(45,212,168,0.15) 0%, transparent 70%)",
            animation: "pulse 3s ease-in-out infinite",
          }} />
          {/* Ring */}
          <div className="absolute inset-2 sm:inset-3 rounded-full" style={{
            border: "2px solid rgba(45,212,168,0.4)",
            boxShadow: "0 0 20px rgba(45,212,168,0.1), inset 0 0 20px rgba(45,212,168,0.05)",
          }} />
          {/* Checkmark */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="relative z-10">
            <path d="M12 20L18 26L28 14" stroke="#2DD4A8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 0 6px rgba(45,212,168,0.6))",
                strokeDasharray: 40,
                strokeDashoffset: 0,
                animation: "drawCheck 1.5s ease-out 0.5s forwards",
              }} />
          </svg>
        </div>

        {/* Floating data lines */}
        {[
          { x1: -160, y1: -80, x2: -60, y2: -20, color: "#2DD4A8" },
          { x1: 160, y1: -60, x2: 60, y2: -15, color: "#C4985A" },
          { x1: -140, y1: 100, x2: -50, y2: 30, color: "#2DD4A8" },
          { x1: 150, y1: 80, x2: 55, y2: 25, color: "#C4985A" },
          { x1: -180, y1: 10, x2: -65, y2: 5, color: "#1E2522" },
          { x1: 180, y1: -10, x2: 65, y2: -5, color: "#1E2522" },
        ].map((line, i) => (
          <svg key={i} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
            <line
              x1={`calc(50% + ${line.x1}px)`} y1={`calc(50% + ${line.y1}px)`}
              x2={`calc(50% + ${line.x2}px)`} y2={`calc(50% + ${line.y2}px)`}
              stroke={line.color} strokeWidth="0.5"
            />
          </svg>
        ))}

        {/* Floating labels */}
        {[
          { text: "NLP ENGINE", x: -200, y: -40, delay: "0.5s" },
          { text: "70+ PATTERNS", x: 160, y: -80, delay: "0.7s" },
          { text: "SOURCE CHECK", x: -180, y: 60, delay: "0.9s" },
          { text: "LOGIC ANALYSIS", x: 170, y: 70, delay: "1.1s" },
        ].map((label, i) => (
          <div key={i} className="absolute text-[8px] sm:text-[9px] tracking-[0.2em] font-medium whitespace-nowrap hidden sm:block" style={{
            left: `calc(50% + ${label.x}px)`,
            top: `calc(50% + ${label.y}px)`,
            transform: "translate(-50%, -50%)",
            color: "#7A8280",
            opacity: 0,
            animation: `fadeIn 0.8s ease-out ${label.delay} forwards`,
          }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "#2DD4A8", opacity: 0.5 }} />
            {label.text}
          </div>
        ))}
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(45,212,168,0.008) 3px, rgba(45,212,168,0.008) 4px)",
      }} />
    </div>
  );
}
