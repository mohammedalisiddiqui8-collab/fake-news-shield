import { useNavigate } from "react-router";

/* ─── PAGE 01 · Title page ────────────────────────────────────────────
   The scene is the supplied reference image, placed full-bleed and
   left exactly as provided — no overlay, filter or effect on top of it.
   Its own artwork already carries the masthead, the opening line and the
   "ENTER VERITAS" pill, so none of those are drawn again here — only the
   header survives as a live layer. ─────────────────────────────────── */

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="veritas-night relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ── The scene — the supplied reference image, placed as large as
          it can go without cutting the wordmark. On a portrait screen
          the frame is held to 4:5 so the picture fills most of the
          display and only the outermost edges are trimmed; on a
          landscape screen it goes full-bleed. No overlay, filter,
          gradient or effect on top: the photograph is the visual,
          exactly as provided. ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-[4/5] w-full [@media(min-aspect-ratio:1/1)]:aspect-auto [@media(min-aspect-ratio:1/1)]:h-full">
          <img
            src="/veritas-hero.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

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

      {/* ── Centred composition ──
           Intentionally empty: the wordmark, the opening line and the
           way in all live inside the reference image itself. Nothing is
           drawn on top of it. */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10" />

      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}
