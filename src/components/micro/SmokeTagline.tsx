"use client";
import { useRef, useEffect, useCallback } from "react";

const TAGLINES = [
  "Truth over noise.",
  "Facts over fiction.",
  "Verify before you believe.",
  "Evidence over opinion.",
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  char?: string;
  charX?: number;
  charY?: number;
}

/**
 * Canvas-based smoke dissolve tagline.
 * Letters dissolve into wispy smoke particles and reform as the next phrase.
 */
export function SmokeTagline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    particles: [] as Particle[],
    currentText: TAGLINES[0],
    nextText: TAGLINES[1],
    textIndex: 0,
    phase: "show" as "show" | "dissolve" | "reform",
    timer: 0,
    fadeProgress: 0,
    displayedOpacity: 1,
    raf: 0,
    disposed: false,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    if (s.disposed) return;

    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, w, h);

    const fontSize = Math.round(20 * dpr);
    const fontFamily = "'DM Serif Display', serif";

    // Draw current text with fading opacity
    if (s.phase === "show" || s.phase === "dissolve") {
      ctx.save();
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = `rgba(212, 200, 184, ${s.displayedOpacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.currentText, w / 2, h / 2);
      ctx.restore();
    }

    // Draw reforming text
    if (s.phase === "reform") {
      ctx.save();
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = `rgba(212, 200, 184, ${1 - s.displayedOpacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.nextText, w / 2, h / 2);
      ctx.restore();
    }

    // Draw smoke particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.015; // gentle upward drift
      p.vx *= 0.995; // slight drag
      p.life--;
      p.opacity = Math.max(0, (p.life / p.maxLife) * 0.7);

      if (p.life <= 0) {
        s.particles.splice(i, 1);
        continue;
      }

      const alpha = p.opacity;
      if (alpha <= 0) continue;

      // Draw soft smoke particle
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(180, 168, 148, ${alpha})`;
      ctx.beginPath();
      // Irregular organic shape using bezier curves
      const size = p.size * (1 + (1 - p.life / p.maxLife) * 1.5);
      ctx.ellipse(p.x, p.y, size, size * 0.7, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    s.timer++;

    // Phase transitions
    if (s.phase === "show" && s.timer > 2800) {
      // Start dissolving
      s.phase = "dissolve";
      s.fadeProgress = 0;
      spawnSmokeFromText(ctx, s, w, h, fontSize, fontFamily);
    }

    if (s.phase === "dissolve") {
      s.fadeProgress += 0.02;
      s.displayedOpacity = Math.max(0, 1 - s.fadeProgress * 2);
      if (s.fadeProgress >= 0.5) {
        s.phase = "reform";
        s.fadeProgress = 0;
        s.displayedOpacity = 1;
        s.textIndex = (s.textIndex + 1) % TAGLINES.length;
        s.currentText = TAGLINES[s.textIndex];
        s.nextText = TAGLINES[(s.textIndex + 1) % TAGLINES.length];
      }
    }

    if (s.phase === "reform") {
      s.fadeProgress += 0.015;
      s.displayedOpacity = Math.min(1, s.fadeProgress * 2);
      if (s.fadeProgress >= 0.5) {
        s.phase = "show";
        s.timer = 0;
        s.displayedOpacity = 1;
      }
    }

    // Cleanup old particles
    if (s.particles.length > 300) {
      s.particles.splice(0, s.particles.length - 300);
    }

    s.raf = requestAnimationFrame(draw);
  }, []);

  const spawnSmokeFromText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      s: typeof stateRef.current,
      w: number,
      h: number,
      fontSize: number,
      fontFamily: string
    ) => {
      ctx.save();
      ctx.font = `${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(s.currentText);
      const textWidth = metrics.width;
      const textLeft = (w - textWidth) / 2;
      const textTop = h / 2 - fontSize * 0.35;

      // Sample the text area and spawn particles where there are letters
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = Math.ceil(textWidth);
      sampleCanvas.height = Math.ceil(fontSize * 1.2);
      const sampleCtx = sampleCanvas.getContext("2d")!;
      sampleCtx.font = `${fontSize}px ${fontFamily}`;
      sampleCtx.fillStyle = "white";
      sampleCtx.textBaseline = "top";
      sampleCtx.fillText(s.currentText, 0, fontSize * 0.1);

      const imageData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
      const step = 4;

      for (let y = 0; y < sampleCanvas.height; y += step) {
        for (let x = 0; x < sampleCanvas.width; x += step) {
          const i = (y * sampleCanvas.width + x) * 4;
          if (imageData.data[i + 3] > 128) {
            // This pixel is part of a letter
            const worldX = textLeft + x;
            const worldY = textTop + y;
            // Spawn 1-2 particles per sampled point
            for (let k = 0; k < 2; k++) {
              s.particles.push({
                x: worldX + (Math.random() - 0.5) * step,
                y: worldY + (Math.random() - 0.5) * step,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -Math.random() * 0.6 - 0.2,
                life: 50 + Math.random() * 40,
                maxLife: 90,
                size: 1.5 + Math.random() * 2,
                opacity: 0.5 + Math.random() * 0.3,
              });
            }
          }
        }
      }
      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    stateRef.current.disposed = false;
    stateRef.current.raf = requestAnimationFrame(draw);

    return () => {
      stateRef.current.disposed = true;
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener("resize", resize);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
