import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

/* ─── PAGE 01 · Title page ────────────────────────────────────────────
   The scene is the supplied reference artwork, left exactly as provided:
   no overlay, filter or effect on top of the photograph. Its own
   masthead is the largest element on the page and stays part of the
   image. What a photograph cannot do is change or respond, so the two
   elements beneath it are live: the opening line that rotates, and the
   way in. Only the pill's baked outline is covered, and only by a fill
   matched to the near-black backdrop already behind it. ─────────────── */

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
 * (fade + a breath of blur), the next settles in. One line, always ivory.
 * Reduced motion: the same swap without the blur.
 */
function OpeningQuote() {
  const [index, setIndex] = useState(0);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const t = setInterval(
      () => setIndex((p) => (p + 1) % OPENING_QUOTES.length),
      4200,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex h-8 w-full items-center justify-center px-6" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(5px)" }}
          transition={{ duration: reduce ? 0.35 : 0.52, ease: "easeInOut" }}
          className="whitespace-nowrap text-center font-serif-editorial text-[17px] italic leading-none tracking-[0.05em] text-[#D8D4CB] sm:text-[21px] lg:text-[25px]"
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
      {/* ── The scene — the supplied reference artwork, full-bleed. Two
          crops of the same picture serve the two shapes: a portrait phone
          gets the 9:16 re-frame, anything landscape gets the 16:9
          original, so neither loses the masthead. ── */}
      <picture className="absolute inset-0 block">
        <source media="(orientation: portrait)" srcSet="/1790790680751_edit_358157209464778.png" />
        <img
          src="/veritas-hero.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </picture>

      {/* ── Top rule ── */}
      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />

      {/* ── Minimal navigation — the name, nothing else ── */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <button
          onClick={() => navigate("/desk")}
          className="group flex items-baseline gap-3"
          aria-label="Veritas — go to the desk"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#6F7074] transition-colors duration-500 group-hover:text-[#C9C3B7]">
            V/
          </span>
          <span className="font-masthead text-[10px] uppercase tracking-[0.34em] text-[#A5A5A1] transition-colors duration-500 group-hover:text-[#F1F0EA]">
            Veritas
          </span>
        </button>
      </header>

      {/* ── The live layer ──
           The opening line returns to the DOM, set larger than the
           lettering it replaces and placed exactly where that line
           stood. Below it, a fill matched to the near-black backdrop
           hides the pill's baked outline, and the real control sits on
           top of it so the way in works. ── */}
      <main className="relative z-10 flex-1">
        {/* The opening line — the examined claim, in soft ivory. */}
        <div className="absolute inset-x-0 top-[51%] -translate-y-1/2 landscape:top-[51.5%]">
          <OpeningQuote />
        </div>

        {/* Covers the pill drawn into the artwork. The backdrop there is
            measured at rgb(12,12,10) portrait and rgb(8,8,7) landscape,
            so the fill is the colour already there. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[54.2%] h-[4.8%] w-[30%] -translate-x-1/2 bg-[#0C0C0A] landscape:top-[57.6%] landscape:h-[4.9%] landscape:w-[34%] landscape:bg-[#080807]"
        />

        {/* ── The way in ── */}
        <motion.button
          type="button"
          onClick={() => navigate("/desk")}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          className="group absolute left-1/2 top-[56.6%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full border border-[#C9C3B7]/40 bg-black/25 px-7 py-3 text-[11px] uppercase tracking-[0.26em] text-[#F1F0EA] backdrop-blur-sm transition-colors duration-500 hover:border-[#C9C3B7]/75 hover:bg-[#151410]/60 landscape:top-[60%] landscape:px-9 landscape:py-3.5 landscape:text-[12px]"
        >
          Enter Veritas
          <span className="block text-[13px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-[4px]">
            →
          </span>
        </motion.button>
      </main>

      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}