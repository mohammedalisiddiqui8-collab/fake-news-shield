import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * The marker that opens each chapter of the desk: a folio number, a title
 * set in the masthead face, and a one-sentence standfirst. Chapters are
 * separated by a wide margin so each one reads as a new part of the
 * publication rather than a block on a dashboard.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function ChapterMarker({
  no,
  title,
  standfirst,
  aside,
  children,
}: {
  no: string;
  title: string;
  standfirst: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="report-sec" id={`chapter-${title.toLowerCase()}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* ── Folio number / rule / aside ── */}
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="kicker shrink-0" style={{ color: "#C9C3B7" }}>
            {no}
          </span>
          <motion.span
            className="h-px flex-1 origin-left"
            style={{ background: "#3A3B3E" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
          />
          {aside && <div className="hidden shrink-0 sm:block">{aside}</div>}
        </div>

        {/* ── Title — masthead face, the loudest line in the chapter ── */}
        <h2 className="mt-5 font-masthead text-[clamp(1.9rem,5vw,3rem)] leading-none tracking-[0.03em] text-[#F1F0EA]">
          {title}
        </h2>

        <p
          className="mt-5 max-w-[58ch] text-[14px] leading-[1.8] text-muted-foreground"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          {standfirst}
        </p>

        <div className="mt-10 sm:mt-12">{children}</div>
      </motion.div>
    </section>
  );
}
