import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";

/* ─── PAGE 01 · Title page ──────────────────────────────────────────────
   A quiet opening frame: near-black, one wordmark, one small line that
   changes. Nothing competes with the title. ─────────────────────────────── */

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
    }, 4200);
    return () => clearInterval(t);
  }, []);

  return (
    /* Reserved height so the frame never jumps while the line changes. */
    <div className="relative h-6 w-full" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: EASE }}
          className="absolute inset-0 text-center text-[10px] font-light uppercase tracking-[0.34em] text-[#A5A5A1] sm:text-[11px]"
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

      {/* ── Minimal navigation ── */}
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

        <button
          onClick={() => navigate("/auth")}
          className="ul-hover text-[10px] font-light uppercase tracking-[0.28em] text-[#A5A5A1] transition-colors duration-500 hover:text-[#F1F0EA]"
        >
          Sign in
        </button>
      </header>

      {/* ── Centred composition ── */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="flex w-full max-w-3xl flex-col items-center"
        >
          <p className="kicker mb-10 text-[#5C5D61] sm:mb-14">
            Fact-checking desk
          </p>

          <h1 className="text-center font-serif-editorial text-[clamp(2.6rem,13vw,7.5rem)] leading-[0.95] tracking-[0.16em] text-[#F1F0EA] sm:tracking-[0.22em]">
            VERITAS
          </h1>

          <div className="mt-9 h-px w-14 bg-[#3A3B3E] sm:mt-12" />

          <div className="mt-9 w-full max-w-sm sm:mt-11">
            <OpeningQuote />
          </div>
        </motion.div>
      </main>

      {/* ── Entering the product ── */}
      <footer className="flex shrink-0 flex-col gap-6 px-6 pb-10 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pb-12">
        <p className="kicker text-[#4E4F53]">
          Independent verification
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-3 self-start text-[11px] font-light uppercase tracking-[0.28em] text-[#A5A5A1] transition-colors duration-500 hover:text-[#F1F0EA] sm:self-auto"
        >
          <span className="ul-hover">Enter Veritas</span>
          <span className="inline-block transition-transform duration-500 ease-out group-hover:translate-x-1">
            →
          </span>
        </button>
      </footer>

      <div className="h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}
