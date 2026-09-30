import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Quote,
  Globe,
  Layers,
  Scale,
  Gavel,
  type LucideIcon,
} from "lucide-react";

/**
 * CHAPTER 03 · SCRUTINY
 *
 * The strongest chapter: one claim, followed all the way to a verdict.
 *
 * The five stations — CLAIM → SOURCE → EVIDENCE → CROSS-CHECK → ASSESSMENT —
 * are laid out as a vertical investigative path. Selecting a stage draws the
 * connecting rule toward the next station and opens its case file directly
 * below it, so the reader always sees the stage in the context of the path.
 *
 * The example claim and outcomes are illustrative of the process, and are
 * labelled as such: the numbers shown are the shapes this system actually
 * produces, not a claim about any real article.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export interface ScrutinyStage {
  key: string;
  label: string;
  icon: LucideIcon;
  /** The question this stage of the investigation answers. */
  question: string;
  /** What the stage receives from the one before it. */
  receives: string;
  /** What it hands on. */
  produces: string;
  /** The illustrative body of the worked example. */
  example: string;
  /** The three verdicts this stage can end in — only shown on the last. */
  outcomes?: { label: string; tone: string; note: string }[];
}

export const SCRUTINY_STAGES: ScrutinyStage[] = [
  {
    key: "claim",
    label: "Claim",
    icon: Quote,
    question: "What exactly is being asserted?",
    receives: "The article as filed.",
    produces: "One checkable statement, isolated from its surroundings.",
    example:
      "“The new policy takes effect on 1 January.” — a specific, dated assertion. It is either true or false, which means it can be checked. “Concerns about the policy remain high” is not a claim; it is a characterisation, and it is not carried forward.",
  },
  {
    key: "source",
    label: "Source",
    icon: Globe,
    question: "Who else reported on this?",
    receives: "The isolated claim, used as a search.",
    produces: "Independent external coverage retrieved live.",
    example:
      "A search on the claim returns coverage from three publications that examined the same policy. Each is recorded with its name, date and link — and none of them is the original article being checked.",
  },
  {
    key: "evidence",
    label: "Evidence",
    icon: Layers,
    question: "What did they actually find?",
    receives: "Retrieved coverage for this claim.",
    produces: "Relevant passages marked supports / contradicts / partial / does not address.",
    example:
      "Two outlets report the commencement date as published. One notes the date was moved by an amendment and quotes the minister. That third passage contradicts the claim as written, and is marked as such rather than averaged away.",
  },
  {
    key: "crosscheck",
    label: "Cross-check",
    icon: Scale,
    question: "Do the independent sources agree with each other?",
    receives: "Marked evidence from every retrieved source.",
    produces: "A per-claim status and a confidence figure.",
    example:
      "Claim 01 is contradicted by retrieved coverage. Claim 02, on the amendment process, is corroborated. Claim 03, on consultation figures, is addressed by only one source and is left as partial — the gap is reported, not filled.",
  },
  {
    key: "assessment",
    label: "Assessment",
    icon: Gavel,
    question: "What follows from the evidence?",
    receives: "Every claim status and the sources behind it.",
    produces: "A verdict, a confidence figure, and the reasoning that led to both.",
    example:
      "The verdict follows from the contradicted claim, not from the tone of the writing. The reasoning is published alongside it, so the route to the result can be checked.",
    outcomes: [
      { label: "Credible", tone: "#8A9A82", note: "Key claims corroborated by retrieved independent coverage." },
      { label: "Uncertain", tone: "#B0A183", note: "Evidence insufficient, mixed, or unavailable." },
      { label: "Misleading", tone: "#B08479", note: "Key claims contradicted by retrieved independent coverage." },
    ],
  },
];

export function ScrutinyChapter() {
  const [active, setActive] = useState(4);

  return (
    <div>
      {/* Kicker — what the interaction is for */}
      <p className="kicker mb-7" style={{ opacity: 0.5 }}>
        Select a stage to follow one claim through the system
      </p>

      {/* ── The vertical path: one rule, five stations, one case file open ── */}
      <div className="relative">
        {/* The spine — one hairline running the full length of the path */}
        <span
          className="absolute left-[7px] top-[30px] bottom-[27px] w-px"
          style={{ background: "#3A3B3E" }}
          aria-hidden="true"
        />

        <ol>
        {SCRUTINY_STAGES.map((s, i) => {
          const isActive = i === active;
          const isDone = i < active;
          const StageIcon = s.icon;
          const isLast = i === SCRUTINY_STAGES.length - 1;

          return (
            <li key={s.key} className="relative">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                className="group flex w-full items-baseline gap-5 py-4 text-left min-h-[44px]"
              >
                {/* Station marker on the vertical spine */}
                <span className="relative flex w-[15px] shrink-0 self-start pt-[7px]">
                  <motion.span
                    className="block h-[9px] w-[9px]"
                    animate={{
                      background: isActive ? "#C9C3B7" : isDone ? "#6F7074" : "#202124",
                      borderColor: isActive ? "#C9C3B7" : isDone ? "#6F7074" : "#3A3B3E",
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                    style={{ border: "1px solid #3A3B3E" }}
                    aria-hidden="true"
                  />
                </span>

                {/* Number, label, question */}
                <span className="num-marker w-7 shrink-0 pt-[5px] transition-colors duration-300" style={{ color: isActive ? "#C9C3B7" : isDone ? "#8A8A86" : "#6F7074" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span
                      className="text-[19px] sm:text-[22px] leading-none tracking-[0.02em] transition-colors duration-300"
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        color: isActive ? "#F1F0EA" : isDone ? "#C9C3B7" : "#A5A5A1",
                      }}
                    >
                      {s.label}
                    </span>
                    <StageIcon
                      className="h-3 w-3 self-center transition-colors duration-300"
                      style={{ color: isActive ? "#C9C3B7" : "#6F7074" }}
                    />
                    <span
                      className="text-[11.5px] italic transition-colors duration-300 sm:text-[12.5px]"
                      style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        color: isActive ? "#A5A5A1" : "#6F7074",
                      }}
                    >
                      {s.question}
                    </span>
                  </span>
                </span>

                {/* State tick — a rule that extends when the stage is active */}
                <span className="relative mt-1 hidden h-px w-10 shrink-0 sm:block" style={{ background: "#3A3B3E" }}>
                  <motion.span
                    className="absolute inset-0 origin-left"
                    style={{ background: "#C9C3B7" }}
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </span>
              </button>

              {/* The case file — opens directly beneath its stage */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="casefile"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="relative pb-8 pl-12 pr-1 sm:pl-16 sm:pr-4">
                      <div className="border-l border-border/70 pl-5 sm:pl-7">
                        <div className="grid gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                          {/* The worked example */}
                          <div>
                            <p className="kicker mb-3" style={{ opacity: 0.5 }}>Worked example</p>
                            <p
                              className="text-[13.5px] leading-[1.85] text-[#F1F0EA]"
                              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                            >
                              {s.example}
                            </p>

                            {s.outcomes && (
                              <div className="mt-7">
                                <p className="kicker mb-3" style={{ opacity: 0.5 }}>Reached by evidence, never by tone</p>
                                <ul className="border-t border-border/70">
                                  {s.outcomes.map((o) => (
                                    <li key={o.label} className="flex items-baseline gap-4 border-b border-border/70 py-3">
                                      <span
                                        className="w-[4px] h-[4px] shrink-0 translate-y-[-2px]"
                                        style={{ background: o.tone }}
                                      />
                                      <span className="text-[12.5px] uppercase tracking-[0.16em] shrink-0 w-24" style={{ color: o.tone }}>
                                        {o.label}
                                      </span>
                                      <span className="text-[11.5px] leading-relaxed text-muted-foreground">
                                        {o.note}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* What passes in and what comes out */}
                          <div>
                            <div className="grid gap-5">
                              <div>
                                <p className="kicker mb-2" style={{ opacity: 0.5 }}>Receives</p>
                                <p className="text-[12px] leading-[1.75] text-muted-foreground">{s.receives}</p>
                              </div>
                              <div className="border-t border-border/70 pt-4">
                                <p className="kicker mb-2" style={{ opacity: 0.5 }}>Produces</p>
                                <p className="text-[12px] leading-[1.75] text-muted-foreground">{s.produces}</p>
                              </div>
                            </div>

                            <div className="mt-5 flex items-center gap-2.5 border-t border-border/70 pt-4">
                              <FileText className="h-3 w-3 shrink-0" style={{ color: "#6F7074" }} />
                              <p className="text-[10.5px] leading-relaxed text-muted-foreground" style={{ opacity: 0.75 }}>
                                This is the real Veritas sequence. The stage you select in a report shows the actual
                                claims, sources and passages from your own investigation.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The connecting rule to the next station; the travelled
                  portion is drawn over the spine, stage by stage */}
              {!isLast && (
                <div
                  className="absolute left-[7px] top-[30px] bottom-[-27px] w-px"
                  aria-hidden="true"
                >
                  <motion.div
                    className="absolute inset-0 origin-top"
                    style={{ background: "rgba(201,195,183,0.5)" }}
                    initial={false}
                    animate={{ scaleY: isDone ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </div>
              )}
            </li>
          );
        })}
        </ol>
      </div>

      {/* A quiet closer beneath the path */}
      <p className="mt-8 max-w-[70ch] text-[11px] leading-relaxed text-muted-foreground" style={{ opacity: 0.75 }}>
        Follow the path from 01 to 05 and you have read the whole of a Veritas investigation — the
        same sequence every filed article takes, without exception.
      </p>
    </div>
  );
}
