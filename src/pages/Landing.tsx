import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { VerificationGlyph } from "@/components/VerificationGlyph";

/* ─── PAGE 01 · Title page ────────────────────────────────────────────
   Four things only: the name, the rule beneath it, one small line that
   changes, and the framed way in. The masthead is set in the Aveline
   chain (.font-masthead); everything else stays in the sans. ─────────── */

const OPENING_QUOTES = [
  "Truth deserves evidence.",
  "Follow the claim.",
  "Look beyond the headline.",
  "Evidence before certainty.",
];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The rotating line — a typesetter, not a terminal.
 * The current line softens out, the next one is set in a short reveal
 * (a few characters at a time, eased rather than uniform), then a caret
 * rule blinks twice and stops. Reduced motion: simple crossfades.
 */
function OpeningQuote() {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(OPENING_QUOTES[0].length);
  const [showCaret, setShowCaret] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduce = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) {
      const t = setInterval(() => setIndex((p) => (p + 1) % OPENING_QUOTES.length), 4600);
      return () => clearInterval(t);
    }

    let timers: ReturnType<typeof setTimeout>[] = [];
    const quote = OPENING_QUOTES[index];
    const full = shown >= quote.length;

    if (full) {
      // The line rests; the caret shows briefly, then the line leaves.
      setShowCaret(true);
      const t1 = setTimeout(() => setLeaving(true), 3400);
      const t2 = setTimeout(() => {
        setLeaving(false);
        setShowCaret(false);
        setIndex((p) => (p + 1) % OPENING_QUOTES.length);
      }, 4000);
      timers = [t1, t2];
    } else if (!leaving) {
      // Setting the line: eased steps, a little faster than typewriter.
      const step = shown < 4 ? 60 : shown < 12 ? 34 : 26;
      const t = setTimeout(() => setShown((s) => s + 1), step);
      timers = [t];
    }

    return () => timers.forEach(clearTimeout);
  }, [index, shown, leaving, reduce]);

  const quote = OPENING_QUOTES[index];
  const text = leaving ? "" : quote.slice(0, shown);

  return (
    /* Reserved height so the frame never jumps while the line changes. */
    <div className="relative h-6 w-full" aria-live="polite">
      {reduce ? (
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-0 text-center font-serif-editorial text-[11.5px] italic leading-none tracking-[0.08em] text-[#8E8E8A] sm:text-[13px]"
          >
            {quote}
          </motion.p>
        </AnimatePresence>
      ) : (
        <p className="absolute inset-0 text-center font-serif-editorial text-[11.5px] italic leading-none tracking-[0.08em] text-[#8E8E8A] sm:text-[13px]">
          <span style={{ opacity: leaving ? 0 : 1, transition: "opacity 0.55s ease" }}>
            {text}
          </span>
          {showCaret && !leaving && (
            <motion.span
              className="ml-1 inline-block h-[11px] w-px translate-y-[1.5px] sm:h-[13px]"
              style={{ background: "#6F7074" }}
              animate={{ opacity: [0, 1, 0, 1, 0] }}
              transition={{ duration: 1.4, times: [0, 0.25, 0.5, 0.75, 1], ease: "linear" }}
            />
          )}
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="veritas-night relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ── Top rule ── */}
      <div className="h-px w-full bg-[#2A2B2E]" />

      {/* ── Minimal navigation — the name, nothing else ── */}
      <header className="flex shrink-0 items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <button
          onClick={() => navigate("/")}
          className="group flex items-baseline gap-3"
          aria-label="Veritas — title page"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#6F7074] transition-colors duration-500 group-hover:text-[#C9C3B7]">
            V/
          </span>
          <span className="font-masthead text-[10px] uppercase tracking-[0.34em] text-[#A5A5A1] transition-colors duration-500 group-hover:text-[#F1F0EA]">
            Veritas
          </span>
        </button>
      </header>

      {/* ── Centred composition ── */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* The opening is staged: mark → masthead → primary rule → secondary
            rule → quote → way in. The whole sequence settles in about a
            second — quick enough to feel set, slow enough to feel placed. */}
        <motion.div
          initial="rest"
          animate="in"
          className="flex w-full max-w-3xl flex-col items-center"
        >
          {/* The mark — one quiet trace, secondary to the wordmark. The extra
              air below it is masthead spacing: the name sits in silence. */}
          <motion.div className="mb-16 sm:mb-24" variants={{ rest: { opacity: 0 }, in: { opacity: 1 } }} transition={{ duration: 0.4, ease: EASE }}>
            <VerificationGlyph size={46} />
          </motion.div>

          {/* The masthead — the strongest element on the page. Generous
              tracking reads as a publication name, not a headline. */}
          <motion.h1
            className="text-center font-masthead text-[clamp(2.8rem,12.5vw,7.5rem)] leading-[0.95] tracking-[0.14em] text-[#F1F0EA] sm:tracking-[0.2em]"
            variants={{ rest: { opacity: 0, y: 6 }, in: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
          >
            VERITAS
          </motion.h1>

          {/* The rules beneath the name — the primary line draws left to
              right, the tiny secondary rule follows it */}
          <motion.div
            className="mt-8 h-px w-14 origin-left sm:mt-11"
            style={{ background: "#C9C3B7" }}
            variants={{ rest: { scaleX: 0 }, in: { scaleX: 1 } }}
            transition={{ duration: 0.32, ease: EASE, delay: 0.42 }}
          />
          <motion.div
            className="mt-[3px] h-px w-8 origin-left"
            style={{ background: "#3A3B3E" }}
            variants={{ rest: { scaleX: 0 }, in: { scaleX: 1 } }}
            transition={{ duration: 0.26, ease: EASE, delay: 0.56 }}
          />

          {/* The quote — deliberately a supporting line: smaller, greyer and
              more air above it, so the wordmark stays the loudest element */}
          <motion.div
            className="mt-9 w-full max-w-xs sm:mt-12"
            variants={{ rest: { opacity: 0 }, in: { opacity: 1 } }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.7 }}
          >
            <OpeningQuote />
          </motion.div>

          {/* ── The way in: a framed control, quiet until touched ── */}
          <motion.div
            className="mt-12 sm:mt-16"
            variants={{ rest: { opacity: 0, y: 4 }, in: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.84 }}
          >
            <motion.button
              type="button"
              onClick={() => navigate("/desk")}
              whileTap={{ scale: 0.985 }}
              className="ctrl-frame group h-12 px-8 sm:h-[52px] sm:px-10 text-[10.5px] sm:text-[11.5px]"
              data-primary="true"
            >
              Enter Veritas
              <span className="block text-[14px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-[5px]">
                →
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      <div className="h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}
