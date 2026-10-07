import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * CHAPTER 01 · TRACE
 *
 * The investigation trail. Six stations, one hairline spine, numbers doing
 * the work of cards. The spine draws itself down once as the chapter is read;
 * the active station is the only one that opens.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/* Station states — the row reads through colour and one pixel of travel.
   "quiet" is every row that is not the one being read; the open row keeps
   full ink. Reduced motion: colours still settle, travel does not. */
const rowVariants = {
  closed: { opacity: 1 },
  hover: { opacity: 1 },
  open: { opacity: 1 },
  quiet: { opacity: 0.6 },
};
const numVariants = {
  closed: { color: "var(--v-ink-dim)" },
  hover: { color: "var(--v-ink-dim)" },
  open: { color: "var(--v-ink)" },
};
const labelVariants = {
  closed: { color: "var(--v-ink)", y: 0 },
  hover: { color: "var(--v-ink)", y: 0 },
  open: { color: "var(--v-ink)", y: -1 },
};

export interface TraceStation {
  no: string;
  label: string;
  verb: string;
  detail: string;
}

export const TRACE_STATIONS: TraceStation[] = [
  {
    no: "01",
    label: "Article",
    verb: "received",
    detail:
      "A URL is fetched and read, or a pasted text is accepted as filed. Nothing is judged at this stage — the article is only taken in as the subject of the investigation.",
  },
  {
    no: "02",
    label: "Claims",
    verb: "extracted",
    detail:
      "Veritas pulls the checkable factual statements out of the text. Opinion, framing and tone are deliberately left out of this step: only assertions that could be true or false are carried forward.",
  },
  {
    no: "03",
    label: "Sources",
    verb: "retrieved",
    detail:
      "Each claim is used to search live independent coverage. The aim is to find reporting that examined the same assertion, not to find articles that repeat the original wording.",
  },
  {
    no: "04",
    label: "Evidence",
    verb: "collected",
    detail:
      "The retrieved coverage is read against each claim. Relevant passages are recorded with their publication and date, and marked as supporting, contradicting, partial, or not addressing the claim at all.",
  },
  {
    no: "05",
    label: "Cross-check",
    verb: "weighed",
    detail:
      "Every claim is measured against the sources found for it. Where corroboration is missing or mixed, that is reported as a gap rather than resolved in the article's favour.",
  },
  {
    no: "06",
    label: "Verdict",
    verb: "reached",
    detail:
      "A verdict and a confidence figure are produced from the claim statuses and the evidence behind them. Language signals are reported alongside, never as the basis of the verdict.",
  },
];

export function TraceChapter() {
  const [open, setOpen] = useState<string | null>(null);

  // The spine is drawn by the reader's own scroll: it fills as the chapter
  // enters the viewport and completes by the time the stations are centred —
  // the investigation advances only as far as the page has been read.
  const pathRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pathRef,
    offset: ["start 0.92", "start 0.28"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });
  // Readers who ask the system to minimise motion get the finished spine
  // immediately — the information is identical, it simply does not travel.
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-[85svh] sm:min-h-0" ref={pathRef}>
      {/* The spine — one hairline that draws itself down the chapter as it
          is scrolled; framer resolves it instantly under reduced motion */}
      <motion.span
        className="absolute left-[7px] top-2 bottom-2 w-px hidden origin-top sm:block"
        style={{ background: "var(--v-ink)", opacity: 0.55, scaleY: reduceMotion ? 1 : drawn }}
        aria-hidden="true"
      />

      <ol className="relative">
        {TRACE_STATIONS.map((station, i) => {
          const isOpen = open === station.no;
          return (
            <motion.li
              key={station.no}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
              className="relative"
            >
              <motion.button
                type="button"
                onClick={() => setOpen(isOpen ? null : station.no)}
                className="flex w-full items-baseline gap-5 py-5 text-left sm:gap-7"
                whileTap={{ scale: 0.995 }}
                variants={rowVariants}
                animate={isOpen ? "open" : open !== null ? "quiet" : "closed"}
                whileHover={isOpen ? undefined : "hover"}
              >
                {/* Station marker on the spine */}
                <span className="relative hidden w-[15px] shrink-0 self-center sm:block">
                  <motion.span
                    className="absolute left-1/2 top-1/2 block h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2"
                    style={{ border: "1px solid var(--v-ink-dim)", background: "var(--v-bg)" }}
                    initial={false}
                    animate={{
                      borderColor: isOpen ? "var(--v-ink)" : "var(--v-ink-dim)",
                      backgroundColor: isOpen ? "var(--v-ink)" : "var(--v-bg)",
                      scale: isOpen ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                </span>

                <motion.span className="num-marker w-7 shrink-0 sm:w-8" variants={numVariants}>
                  {station.no}
                </motion.span>

                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    {i === 0 && (
                      <span className="kicker text-[8.5px] sm:hidden" style={{ opacity: 0.5 }}>
                        Tap for details
                      </span>
                    )}
                    <motion.span
                      className="text-[19px] sm:text-[22px] leading-none tracking-[0.02em]"
                      style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
                      variants={labelVariants}
                    >
                      {station.label}
                    </motion.span>
                    <span
                      className="kicker transition-opacity duration-300"
                      style={{ opacity: isOpen ? 0.85 : 0.55 }}
                    >
                      {station.verb}
                    </span>
                  </span>
                </span>

                {/* Mobile affordance — a phone has neither spine nor rule, so
                    expansion is spelled once and dotted throughout */}
                <span
                  className="shrink-0 self-center font-mono text-[13px] leading-none text-[var(--v-ink-dim)] sm:hidden"
                  aria-hidden="true"
                >
                  …
                </span>

                {/* The indicator is a rule, not a chevron */}
                <span className="relative mt-2 hidden h-px w-10 shrink-0 sm:block" style={{ background: "var(--v-rule)" }}>
                  <motion.span
                    className="absolute inset-0 origin-left"
                    style={{ background: "var(--v-ink)" }}
                    initial={false}
                    animate={{ scaleX: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </span>
              </motion.button>

              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <motion.p
                  className="pb-7 pl-12 pr-4 text-[12.5px] leading-[1.8] text-muted-foreground max-w-[62ch] sm:pl-16"
                  style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
                  initial={false}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -6 }}
                  transition={{ duration: 0.45, ease: EASE, delay: isOpen ? 0.08 : 0 }}
                >
                  {station.detail}
                </motion.p>
              </motion.div>

              {/* Hairline between stations */}
              {i < TRACE_STATIONS.length - 1 && (
                <div className="hidden h-px sm:block" style={{ background: "var(--v-rule)", opacity: 0.4 }} />
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
