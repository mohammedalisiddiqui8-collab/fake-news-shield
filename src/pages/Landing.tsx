import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import IntroAtmosphere from "@/components/IntroAtmosphere";
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
          className="whitespace-nowrap text-center font-serif-editorial text-[13px] italic leading-none tracking-[0.08em] text-[#F1F0EA] sm:text-[15px]"
        >
          {OPENING_QUOTES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="veritas-night relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ── The atmosphere — panels in depth, scan line, clock. Behind ──
          everything, inert to input; the page above it stays untouched. */}
      <IntroAtmosphere />

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

          {/* The quote — the examined claim, in ivory. */}
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

      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}
