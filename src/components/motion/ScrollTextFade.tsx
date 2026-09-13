import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollTextFadeProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 0 = fades out at start of element, 1 = fades out at end */
  startFade?: number;
  /** Opacity range [min, max] */
  opacityRange?: [number, number];
  /** Pixel offset for vertical parallax movement */
  parallaxY?: number;
}

/**
 * Fades children in/out as the user scrolls past them.
 * Useful for hero text that should dim as you scroll into the next section.
 *
 * Usage:
 *   <ScrollTextFade parallaxY={40}>
 *     <h2>Scrolls with parallax and fades</h2>
 *   </ScrollTextFade>
 */
export function ScrollTextFade({
  children,
  className = "",
  style,
  startFade = 0.2,
  opacityRange = [0.15, 1],
  parallaxY = 0,
}: ScrollTextFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [startFade - 0.1, startFade + 0.3], opacityRange);
  const y = parallaxY
    ? useTransform(scrollYProgress, [0, 1], [parallaxY, -parallaxY])
    : undefined;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, y, ...style }}
    >
      {children}
    </motion.div>
  );
}
