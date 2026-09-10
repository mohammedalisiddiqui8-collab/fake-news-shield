import { useCallback, useRef, type RefObject } from "react";

/**
 * Returns a ref and mouse-move handler that applies a subtle 3D tilt
 * based on cursor position within the element.
 *
 * Usage:
 *   const [ref, onMouseMove, onMouseLeave] = useTilt();
 *   <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
 */
export function useTilt(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * maxTilt;
        const tiltY = (x - 0.5) * maxTilt;
        el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`;
      });
    },
    [maxTilt]
  );

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (el) {
      el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    }
  }, []);

  return [ref, onMouseMove, onMouseLeave] as const;
}

/**
 * Returns a ref and handler for a "glare" effect — a specular highlight
 * that follows the cursor across the card surface.
 */
export function useGlare() {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glare-x", `${x}%`);
    el.style.setProperty("--glare-y", `${y}%`);
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.setProperty("--glare-x", "50%");
      el.style.setProperty("--glare-y", "50%");
    }
  }, []);

  return [ref, onMouseMove, onMouseLeave] as const;
}
