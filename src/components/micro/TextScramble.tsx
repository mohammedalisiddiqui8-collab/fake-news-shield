import { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Cycles through a list of strings with a scramble/reveal effect.
 * Designed for small technical/status labels only.
 */
export function TextScramble({
  phrases,
  interval = 2400,
  className = "",
  style = {},
}: {
  phrases: string[];
  interval?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(phrases[0]);
  const scrambleRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (phrases.length <= 1) return;

    const cycle = () => {
      const nextIndex = (prev: number) => (prev + 1) % phrases.length;
      const target = phrases[nextIndex(index)];
      const maxLen = Math.max(display.length, target.length);
      let step = 0;
      const totalSteps = 8;

      const scramble = () => {
        step++;
        const progress = step / totalSteps;
        let result = "";
        for (let i = 0; i < maxLen; i++) {
          if (i < target.length * progress) {
            result += target[i] ?? "";
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplay(result);
        if (step < totalSteps) {
          scrambleRef.current = setTimeout(scramble, 30);
        } else {
          setDisplay(target);
          setIndex((p) => nextIndex(p));
        }
      };

      scramble();
    };

    const id = setInterval(cycle, interval);
    return () => {
      clearInterval(id);
      if (scrambleRef.current) clearTimeout(scrambleRef.current);
    };
  }, [index, interval, phrases, display]);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {display}
    </span>
  );
}
