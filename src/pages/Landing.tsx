import { motion } from "framer-motion";
import { useNavigate } from "react-router";

/* ─── PAGE 01 · Title page ────────────────────────────────────────────
   The scene is the supplied reference image, placed full-bleed and
   left exactly as provided — no overlay, filter or effect on top of it.
   Its own artwork already carries the masthead and the opening line, so
   the live layer above it is reduced to what the image cannot do: the
   header and the working way in. ────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="veritas-night relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ── The scene — the supplied reference image, full-bleed and
          untouched. No overlay, filter, gradient or effect on top: the
          photograph is the visual, exactly as provided. ── */}
      <img
        src="/veritas-hero.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

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
        {/* The way in, staged as before — quick enough to feel set, slow
            enough to feel placed. */}
        <motion.div
          initial="rest"
          animate="in"
          className="flex w-full max-w-3xl flex-col items-center">
          {/* ── The way in: a framed control, quiet until touched ── */}
          <motion.div
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
