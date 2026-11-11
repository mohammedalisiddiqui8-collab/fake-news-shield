import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── word-by-word reveal ────────────────────────────────────────────────
   Headlines are split into words, each masked by its own overflow window
   and lifted into place. The mask is what makes it feel typeset rather
   than "text slides up": no glyph is ever half-visible against the dark.
   `lines` is explicit so the line breaks are art-directed, not accidental. */
export function TextReveal({
  lines,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.055,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const words = lines.flatMap((line, li) =>
    line.split(" ").map((word, wi) => ({ word, key: `${li}-${wi}`, line: li })),
  );

  return (
    <Tag className={className} aria-label={lines.join(" ")}>
      <motion.span
        aria-hidden="true"
        className="block"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
        variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
        {lines.map((line, li) => (
          <span key={li} className="block">
            {words
              .filter((w) => w.line === li)
              .map(({ word, key }, i, arr) => (
                <span
                  key={key}
                  className="inline-flex overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]"
                >
                  <motion.span
                    className="inline-block will-change-transform"
                    variants={{
                      hidden: { y: reduce ? 0 : "112%", opacity: reduce ? 0 : 1 },
                      show: {
                        y: 0,
                        opacity: 1,
                        transition: { duration: reduce ? 0.3 : 0.95, ease: EASE },
                      },
                    }}
                  >
                    {word}
                    {i < arr.length - 1 ? "\u00A0" : ""}
                  </motion.span>
                </span>
              ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/* ── a quieter entrance for blocks, cards and captions ───────────────── */
export function FadeUp({
  children,
  className = "",
  delay = 0,
  y = 22,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px -8% 0px" }}
      transition={{ duration: reduce ? 0.25 : 0.9, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── the rotating second line ───────────────────────────────────────────
   One sentence at a time, swapped behind a mask after the reader has had
   enough time to finish it. Reduced motion gets the first sentence and
   nothing else; screen readers get one stable sentence instead of a
   carousel that announces itself every five seconds. */
export function HeadlineRotator({
  phrases,
  className = "",
  interval = 4600,
}: {
  phrases: string[];
  className?: string;
  interval?: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => window.clearInterval(id);
  }, [phrases.length, interval, reduce]);

  return (
    <span className={`relative block ${className}`}>
      <span className="sr-only">{phrases[0]}</span>
      <span aria-hidden="true" className="relative block overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className="block"
            initial={{ y: reduce ? 0 : "70%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : "-70%", opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
          >
            {phrases[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
