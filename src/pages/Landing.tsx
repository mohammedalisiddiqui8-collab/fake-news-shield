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
      {/* ── The scene — the supplied reference artwork, full-bleed on every
          screen. Two crops of the same picture serve the two shapes: a
          portrait phone gets the 9:16 re-frame, anything landscape
          gets the 16:9 original, so neither loses the wordmark. No
          overlay, filter, gradient or effect on top: the photograph is
          the visual, exactly as provided. ── */}
      <picture className="absolute inset-0 block">
        <source media="(orientation: portrait)" srcSet="/1790790680751_edit_352265298383536.png" />
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

      {/* ── Centred composition ──
           The wordmark, the opening line and the way in all live inside
           the reference image itself, so nothing is drawn on top of it.
           The one thing a photograph cannot do is respond to a tap, so
           the pill's position carries an invisible button: no pixels of
           its own, it only makes the baked-in control work. */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        <button
          type="button"
          onClick={() => navigate("/desk")}
          aria-label="Enter Veritas"
          className="absolute left-1/2 top-[57%] h-[9%] w-[38%] -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-transparent [@media(min-aspect-ratio:1/1)]:top-[61%] [@media(min-aspect-ratio:1/1)]:h-[8%]"
        />
      </main>

      <div className="relative z-10 h-px w-full bg-[#2A2B2E]" />
    </div>
  );
}
