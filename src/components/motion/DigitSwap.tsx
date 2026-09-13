import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DigitSwapProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Digits to display — pad with zeros */
  padStart?: number;
}

/**
 * Animates individual digits when the value changes.
 * Each digit slides vertically into position with AnimatePresence.
 *
 * Usage:
 *   <DigitSwap value={87} suffix="%" />
 *   <DigitSwap value={42} padStart={3} /> // "042"
 */
export function DigitSwap({
  value,
  suffix = "",
  prefix = "",
  duration = 600,
  className = "",
  style,
  padStart = 0,
}: DigitSwapProps) {
  const str = padStart > 0 ? String(value).padStart(padStart, "0") : String(value);
  const chars = `${prefix}${str}${suffix}`.split("");

  return (
    <span className={className} style={style} aria-label={`${prefix}${value}${suffix}`}>
      {chars.map((char, i) => (
        <AnimatedChar key={`${i}-${chars.length}`} char={char} duration={duration} index={i} />
      ))}
    </span>
  );
}

function AnimatedChar({
  char,
  duration,
  index,
}: {
  char: string;
  duration: number;
  index: number;
}) {
  const [prev, setPrev] = useState(char);
  const [display, setDisplay] = useState(char);

  useEffect(() => {
    if (char !== prev) {
      setDisplay(char);
      setPrev(char);
    }
  }, [char, prev]);

  // Non-digit chars just show without animation
  if (!/\d/.test(char)) {
    return <span className="inline-block">{char}</span>;
  }

  return (
    <span className="inline-block relative overflow-hidden" style={{ minWidth: char === " " ? "0.25em" : undefined }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`${char}-${index}`}
          initial={{ y: "100%", opacity: 0, filter: "blur(2px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(2px)" }}
          transition={{
            duration: duration / 1000,
            ease: [0.22, 1, 0.36, 1],
            delay: index * 0.02,
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
