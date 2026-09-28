import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { VerificationGlyph } from "@/components/VerificationGlyph";

/* ─── PAGE 01 · Title page ──────────────────────────────────────────────
   Three things only: the name, one small line that changes, and the way in.
   No eyebrow headings, no account links, no competing furniture. ──────────── */

const OPENING_QUOTES = [
  "Truth deserves evidence.",
  "Follow the claim.",
  "Look beyond the headline.",
  "Evidence before certainty.",
];

const EASE = [0.22, 1, 0.36, 1] as const;

function OpeningQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((p) => (p + 1) % OPENING_QUOTES.length);
    }, 4600);
    return () => clearInterval(t);
  }, []);

  return (
    /* Reserved height so the frame never jumps while the line changes. */
    <div className="relative h-6 w-full" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="absolute inset-0 text-center font-serif-editorial text-[13px] italic leading-none tracking-[0.06em] text-[#A5A5A1] sm:text-[15px]"
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
          <span className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#A5A5A1] transition-colors duration-500 group-hover:text-[#F1F0EA]">
            Veritas
          </span>
        </button>
      </header>

      {/* ── Centred composition ── */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="flex w-full max-w-3xl flex-col items-center"
        >
          {/* The mark — one quiet trace, secondary to the wordmark */}
          <div className="mb-12 sm:mb-16">
            <VerificationGlyph size={46} />
          </div>

          <h1 className="text-center font-serif-editorial text-[clamp(2.6rem,13vw,7.5rem)] leading-[0.95] tracking-[0.16em] text-[#F1F0EA] sm:tracking-[0.22em]">
            VERITAS
          </h1>

          <div className="mt-8 h-px w-14 bg-[#3A3B3E] sm:mt-11" />

          <div className="mt-8 w-full max-w-sm sm:mt-10">
            <OpeningQuote />
          </div>

          {/* ── The way in: an editorial entrance, not a SaaS button ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.35, ease: EASE }}
            className="mt-16 sm:mt-24"
          >
          <motion.button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group flex flex-col items-center gap-4"
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.995 }}
          >
            <span className="relative block overflow-hidden pb-2">
              <motion.span
                className="block font-serif-editorial text-[clamp(1.35rem,4.6vw,2.4rem)] leading-none tracking-[0.2em] text-[#F1F0EA] transition-colors duration-500 group-hover:text-white"
                variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                ENTER VERITAS
              </motion.span>
              {/* The rule draws itself out from the left on hover */}
              <motion.span
                className="absolute bottom-0 left-0 block h-px w-full origin-left"
                style={{ background: "#C9C3B7" }}
                initial={{ scaleX: 0.28 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.6, ease: EASE }}
              />
              <motion.span
                className="absolute bottom-0 left-0 block h-px w-full origin-left"
                style={{ background: "#F1F0EA" }}
                variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                transition={{ duration: 0.7, ease: EASE }}
              />
            </span>

            {/* The arrow steps forward and settles */}
            <motion.span
              className="flex items-center gap-3 text-[#A5A5A1] transition-colors duration-500 group-hover:text-[#F1F0EA]"
              variants={{ rest: { x: 0 }, hover: { x: 7 } }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <span className="h-px w-6 bg-current opacity-40" />
              <span className="block text-[15px] leading-none">→</span>
            </motion.span>
          </motion.button>
          </motion.div>
        </motion.div>
      </main>

      <div className="h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}
