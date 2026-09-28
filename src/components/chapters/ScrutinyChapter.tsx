import { useState } from "react";
import { motion } from "framer-motion";
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
 * A worked example of the real Veritas flow — CLAIM → SOURCE → EVIDENCE →
 * CROSS-CHECK → ASSESSMENT — with the stages laid out as a case file. Only
 * the selected stage is open; the rest stay as quiet numbered stations so the
 * reader can see the whole path at once.
 *
 * The example claim and outcome are illustrative of the process, and are
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
  const stage = SCRUTINY_STAGES[active];
  const StageIcon = stage.icon;

  return (
    <div>
      {/* ── The path: five stations, one active ── */}
      <div className="relative">
        {/* The connecting rule; the travelled portion is drawn over it */}
        <div className="absolute left-0 right-0 top-[26px] hidden h-px lg:block" style={{ background: "#3A3B3E" }} />
        <motion.div
          className="absolute left-0 top-[26px] hidden h-px origin-left lg:block"
          style={{ background: "#C9C3B7" }}
          initial={false}
          animate={{ width: `${(active / (SCRUTINY_STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 0.55, ease: EASE }}
        />

        <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
          {SCRUTINY_STAGES.map((s, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <li key={s.key} className="min-w-0">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className="group flex w-full flex-col items-start text-left lg:items-center lg:pr-4"
                >
                  <span
                    className="relative flex h-[52px] w-[52px] items-center justify-center border transition-colors duration-300"
                    style={{
                      borderColor: isActive ? "#C9C3B7" : isDone ? "#6F7074" : "#3A3B3E",
                      background: isActive ? "rgba(201,195,183,0.08)" : "transparent",
                    }}
                  >
                    <s.icon
                      className="h-4 w-4 transition-colors duration-300"
                      style={{ color: isActive ? "#F1F0EA" : isDone ? "#A5A5A1" : "#6F7074" }}
                    />
                    <span
                      className="num-marker absolute -top-2.5 left-2"
                      style={{ color: isActive ? "#C9C3B7" : "#5C5D61" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span
                    className="mt-3 text-[13px] uppercase tracking-[0.2em] transition-colors duration-300"
                    style={{ color: isActive ? "#F1F0EA" : "#8E8E8A" }}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── The case file for the selected stage ── */}
      <div className="mt-14 border-t border-border pt-7">
        <motion.div
          key={stage.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span
              className="text-[clamp(1.4rem,3.4vw,1.9rem)] leading-none tracking-[0.02em]"
              style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}
            >
              {stage.label}
            </span>
            <span className="flex items-center gap-2">
              <StageIcon className="h-3.5 w-3.5" style={{ color: "#C9C3B7" }} />
              <span className="text-[13px] italic text-muted-foreground" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {stage.question}
              </span>
            </span>
          </div>

          <div className="mt-8 grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            {/* The worked example */}
            <div>
              <p className="kicker mb-3" style={{ opacity: 0.5 }}>Worked example</p>
              <p
                className="text-[14px] leading-[1.85] text-[#F1F0EA]"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {stage.example}
              </p>

              {stage.outcomes && (
                <div className="mt-8">
                  <p className="kicker mb-3" style={{ opacity: 0.5 }}>Reached by evidence, never by tone</p>
                  <ul className="border-t border-border/70">
                    {stage.outcomes.map((o) => (
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
              <div className="grid gap-6">
                <div>
                  <p className="kicker mb-2" style={{ opacity: 0.5 }}>Receives</p>
                  <p className="text-[12px] leading-[1.75] text-muted-foreground">{stage.receives}</p>
                </div>
                <div className="border-t border-border/70 pt-5">
                  <p className="kicker mb-2" style={{ opacity: 0.5 }}>Produces</p>
                  <p className="text-[12px] leading-[1.75] text-muted-foreground">{stage.produces}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2.5 border-t border-border/70 pt-5">
                <FileText className="h-3 w-3 shrink-0" style={{ color: "#6F7074" }} />
                <p className="text-[10.5px] leading-relaxed text-muted-foreground" style={{ opacity: 0.75 }}>
                  This is the real Veritas sequence. The stage you select in a report shows the actual
                  claims, sources and passages from your own investigation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
