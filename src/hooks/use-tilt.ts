import { useCallback, useRef } from "react";

/**
 * 3D tilt that works on BOTH mouse (desktop) and touch (mobile).
 * On mobile, touch and drag across the card to see the tilt.
 */
export function useTilt(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const applyTilt = useCallback(
    (clientX: number, clientY: number) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * maxTilt;
        const tiltY = (x - 0.5) * maxTilt;
        el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`;
      });
    },
    [maxTilt]
  );

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (el) {
      el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    }
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => applyTilt(e.clientX, e.clientY),
    [applyTilt]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 1) {
        applyTilt(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [applyTilt]
  );

  return [ref, onMouseMove, reset, onTouchMove] as const;
}

/**
 * Glare highlight effect — works on mouse and touch.
 */
export function useGlare() {
  const ref = useRef<HTMLDivElement>(null);

  const update = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glare-x", `${x}%`);
    el.style.setProperty("--glare-y", `${y}%`);
  }, []);

  const reset = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.setProperty("--glare-x", "50%");
      el.style.setProperty("--glare-y", "50%");
    }
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => update(e.clientX, e.clientY),
    [update]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 1) update(e.touches[0].clientX, e.touches[0].clientY);
    },
    [update]
  );

  return [ref, onMouseMove, reset, onTouchMove] as const;
}
