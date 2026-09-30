import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

/* ─── Atmospheric layer ───────────────────────────────────────────────
   The intro page's own artwork, borrowed as depth rather than as a
   picture: blurred, held to a tenth of its own brightness, and buried
   under a near-black wash so the photograph never reads as a photograph.
   The Desk takes it slightly stronger than the Analysis, because that
   page is a reading surface and this one is a working instrument.

   The image file is the same one the title page uses — nothing new is
   generated, resized or altered. Only the treatment around it differs.

   Parallax is desktop-only and barely there: two or three percent of
   drift across a long scroll. On a phone the layer is completely
   static, which keeps the compositor off the critical path and the
   page perfectly readable. Anyone who asks the OS for reduced motion
   gets the static layer too. ─────────────────────────────────────────── */

type Strength = "desk" | "analysis";

const TREATMENT: Record<Strength, { blur: string; opacity: string; wash: string; drift: string }> = {
  desk: { blur: "blur-[6px]", opacity: "opacity-[0.12]", wash: "bg-[#08080A]/85", drift: "3%" },
  analysis: { blur: "blur-[8px]", opacity: "opacity-[0.07]", wash: "bg-[#08080A]/92", drift: "2%" },
};

export default function HeroAtmosphere({ strength = "desk" }: { strength?: Strength }) {
  const reduce = useReducedMotion();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1400], ["0%", TREATMENT[strength].drift]);

  const t = TREATMENT[strength];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        style={desktop && !reduce ? { y } : undefined}
        className="absolute inset-0 motion-reduce:transform-none"
      >
        <picture>
          {/* The title page's two crops, reused as-is. */}
          <source media="(orientation: portrait)" srcSet="/1790790680751_edit_358901019924703.png" />
          <img
            src="/veritas-hero.png"
            alt=""
            className={`h-full w-full scale-110 object-cover ${t.blur} ${t.opacity}`}
          />
        </picture>
      </motion.div>
      {/* Near-black wash — the layer that keeps the page readable. */}
      <div className={`absolute inset-0 ${t.wash}`} />
    </div>
  );
}