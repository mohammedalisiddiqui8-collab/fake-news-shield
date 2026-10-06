import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

/* ─── PAGE 01 · Title page ────────────────────────────────────────────
   The scene is the supplied reference artwork, left exactly as provided:
   no overlay, filter or effect on top of the photograph. Its own
   masthead is the largest element on the page and stays part of the
   image. What a photograph cannot do is change or respond, so the two
   elements beneath it are live: the opening line that rotates, and the
   way in. The line and pill the picture bakes in are covered, and only
   by fills matched to the near-black backdrop already behind them.
   ─────────────── */

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
          className="whitespace-nowrap text-center font-quote text-[17px] leading-none tracking-[0.03em] text-[#F1F0EA] sm:text-[21px] lg:text-[25px]"
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
    <div className="veritas-night relative flex min-h-screen flex-col overflow-hidden bg-[#080807] text-[#F1F0EA]">
      {/* ── The scene — the supplied reference artwork, full-bleed. Two
          crops of the same picture serve the two shapes: a portrait phone
          gets the 9:16 re-frame, anything landscape gets the 16:9
          original, so neither loses the masthead. ── */}
      <picture className="absolute inset-0 block">
        <source media="(orientation: portrait)" srcSet="/1790790680751_edit_358901019924703.png" />
        <img
          src="/veritas-hero.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </picture>

      {/* ── The scan line ──
           One 1px rule travelling across the photograph: it enters at the
           left edge, crosses at a constant pace, fades out at the right and
           starts again. It is layered over the artwork but under every piece
           of live content (the chrome, the quote and the button all sit at
           z-10), so it never crosses a word. Quieter still on a phone. */}
      <div aria-hidden="true" className="hero-scan-line z-[5]" />

      {/* ── The picture's own duplicates, replaced ──
           The 16:9 landscape crop bakes in two pieces of furniture that
           duplicate what the live layer already provides: an old static
           opening line, and the old ENTER pill whose rounded border read
           as a stray white box above the button. They are pixels, not
           elements, so they can only be replaced, not re-styled — and the
           backdrop around both measures rgb(8,8,7), flat enough that a
           fill in that same colour takes their place invisibly. They hang
           off the root because that is the only box here whose origin is
           the top of the viewport: sized in vh, that is the coordinate
           space the artwork itself occupies, at any window height. Both
           bands sit under the live layer (z-10), so where one passes behind
           the live quote or button it vanishes into the same backdrop. The
           portrait crop carries neither piece. */}
      <div aria-hidden="true" className="absolute left-1/2 top-[49.6vh] z-[6] hidden h-[5vh] w-[34%] -translate-x-1/2 bg-[#080807] landscape:block" />
      <div aria-hidden="true" className="absolute left-1/2 top-[58.1vh] z-[6] hidden h-[13vh] w-[34%] -translate-x-1/2 bg-[#080807] landscape:block" />

      {/* ── Top rule ── */}
      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />

      {/* ── Minimal navigation — the name, nothing else ── */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <button
          onClick={() => navigate("/desk")}
          className="group flex items-baseline gap-3"
          aria-label="Veritas — go to the desk"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#6B6963] transition-colors duration-500 group-hover:text-[#F1F0EA]">
            V/
          </span>
          <span className="font-masthead text-[10px] uppercase tracking-[0.34em] text-[#A6A39B] transition-colors duration-500 group-hover:text-[#F1F0EA]">
            Veritas
          </span>
        </button>
      </header>

      {/* ── The live layer ──
           The opening line returns to the DOM, set larger than the
           lettering it replaces, and the real control sits beneath it so
           the way in works. Nothing else belongs here: the artwork's own
           duplicates are replaced above. ── */}
      <main className="relative z-10 flex-1">
        {/* The opening line — the examined claim, in soft ivory. */}
        <div className="absolute inset-x-0 top-[51%] -translate-y-1/2 landscape:top-[51.5%]">
          <OpeningQuote />
        </div>

        {/* ── The way in ── */}
        <motion.button
          type="button"
          onClick={() => navigate("/desk")}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          className="group absolute left-1/2 top-[62.5%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full border border-[#F1F0EA]/40 bg-black/25 px-7 py-3 text-[11px] uppercase tracking-[0.26em] text-[#F1F0EA] backdrop-blur-sm transition-colors duration-500 hover:border-[#F1F0EA]/75 hover:bg-[#101010]/60 landscape:top-[66%] landscape:px-9 landscape:py-3.5 landscape:text-[12px]"
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