import { useState } from "react";
import { motion } from "framer-motion";

/**
 * CHAPTER 01 · TRACE
 *
 * The investigation trail. Six stations, one hairline spine, numbers doing
 * the work of cards. The spine draws itself down once as the chapter is read;
 * the active station is the only one that opens.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

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

  return (
    <div className="relative">
      {/* The spine — one hairline that draws itself down the chapter */}
      <motion.span
        className="absolute left-[7px] top-2 bottom-2 w-px origin-top hidden sm:block"
        style={{ background: "#3A3B3E" }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
        transition={{ duration: 1.6, ease: EASE }}
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
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : station.no)}
                className="group flex w-full items-baseline gap-5 py-5 text-left sm:gap-7"
              >
                {/* Station marker on the spine */}
                <span className="relative hidden w-[15px] shrink-0 self-center sm:block">
                  <motion.span
                    className="absolute left-1/2 top-1/2 block h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background: isOpen ? "#C9C3B7" : "#202124",
                      border: "1px solid #6F7074",
                    }}
                    animate={{ borderColor: isOpen ? "#C9C3B7" : "#6F7074" }}
                    transition={{ duration: 0.3 }}
                  />
                </span>

                <span
                  className="num-marker w-7 shrink-0 transition-colors duration-300 sm:w-8"
                  style={{ color: isOpen ? "#C9C3B7" : "#6F7074" }}
                >
                  {station.no}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span
                      className="text-[19px] sm:text-[22px] leading-none tracking-[0.02em] transition-colors duration-300"
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        color: isOpen ? "#F1F0EA" : "#C9C3B7",
                      }}
                    >
                      {station.label}
                    </span>
                    <span className="kicker" style={{ opacity: 0.55 }}>
                      {station.verb}
                    </span>
                  </span>
                </span>

                {/* The indicator is a rule, not a chevron */}
                <span className="relative mt-2 hidden h-px w-10 shrink-0 sm:block" style={{ background: "#3A3B3E" }}>
                  <motion.span
                    className="absolute inset-0 origin-left"
                    style={{ background: "#C9C3B7" }}
                    initial={false}
                    animate={{ scaleX: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </span>
              </button>

              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <p
                  className="pb-7 pl-12 pr-4 text-[12.5px] leading-[1.8] text-muted-foreground max-w-[62ch] sm:pl-16"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {station.detail}
                </p>
              </motion.div>

              {/* Hairline between stations */}
              {i < TRACE_STATIONS.length - 1 && (
                <div className="hidden h-px sm:block" style={{ background: "#3A3B3E", opacity: 0.4 }} />
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
