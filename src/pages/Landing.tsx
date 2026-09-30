import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import IntroScene from "@/components/IntroScene";

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

const quoted = (s: string) => `\u201C${s}\u201D`;

/**
 * The rotating line — a quiet crossfade. The current line softens out
 * (fade + a breath of blur), the next settles in. ~520ms per phase,
 * nothing mechanical. One line, always ivory. Reduced motion: the same
 * swap without the blur.
 */
function OpeningQuote() {
  const [index, setIndex] = useState(0);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % OPENING_QUOTES.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    /* Reserved height so the frame never jumps while the line changes. */
    <div className="relative flex h-6 w-full items-center justify-center" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(5px)" }}
          transition={{ duration: reduce ? 0.35 : 0.52, ease: "easeInOut" }}
          className="whitespace-nowrap text-center font-serif-editorial text-[14px] italic leading-none tracking-[0.06em] text-[#D8D4CB] sm:text-[16px]"
        >
          {quoted(OPENING_QUOTES[index])}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="veritas-night relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ── The scene — one continuous cinematic environment. Behind ──
          everything, inert to input; the page above it stays untouched. */}
      <IntroScene />

      {/* ── Top rule ── */}
      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />

      {/* ── Minimal navigation — the name, nothing else ── */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
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
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* The opening is staged: masthead → quote → way in. The whole
            sequence settles in about a second — quick enough to feel set,
            slow enough to feel placed. */}
        <motion.div
          initial="rest"
          animate="in"
          className="flex w-full max-w-3xl flex-col items-center"
        >
          {/* The masthead — the strongest element on the page. Generous
              tracking reads as a publication name, not a headline. */}
          <motion.h1
            className="text-center font-masthead text-[clamp(2.8rem,12.5vw,7.5rem)] leading-[0.95] tracking-[0.14em] text-[#F1F0EA] sm:tracking-[0.2em]"
            variants={{ rest: { opacity: 0, y: 6 }, in: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
          >
            VERITAS
          </motion.h1>

          {/* The quote — the examined claim, in soft ivory. */}
          <motion.div
            className="relative mt-9 flex w-full justify-center sm:mt-12"
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
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              className="group flex items-center gap-2.5 rounded-full border border-[#C9C3B7]/40 bg-black/25 px-8 py-3.5 text-[10.5px] uppercase tracking-[0.28em] text-[#F1F0EA] backdrop-blur-sm transition-colors duration-500 hover:border-[#C9C3B7]/75 hover:bg-[#151410]/60 sm:px-10 sm:text-[11px]"
            >
              Enter Veritas
              <span className="block text-[13px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-[4px]">
                →
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}
