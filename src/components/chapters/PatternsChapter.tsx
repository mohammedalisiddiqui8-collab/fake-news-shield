import { useState } from "react";
import { motion } from "framer-motion";

/**
 * CHAPTER 02 · PATTERNS
 *
 * The linguistic side of Veritas, shown as a signal spectrum rather than a
 * grid of cards. Selecting a signal reads it as a typographic cluster and
 * draws its position on the axis.
 *
 * Every figure displayed comes from the live analysis result passed in via
 * `values`. Nothing here is estimated: a signal with no measurement shows an
 * em dash and says so.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Left = measured presence, right = the caution it implies. */
const AXIS_LEFT = "Observed in the text";
const AXIS_RIGHT = "Not proof of truth";

export interface PatternSignal {
  key: string;
  name: string;
  /** What the detector looks for, in plain words. */
  reads: string;
  /** How the signal is treated once detected. */
  weight: string;
  /** Which side of the axis this signal sits on. */
  pole: "caution" | "balance";
}

export const PATTERN_SIGNALS: PatternSignal[] = [
  {
    key: "sensationalism",
    name: "Sensationalism",
    reads: "Language pushed past what the reporting supports — loaded nouns, escalating claims, exclamation where none is warranted.",
    weight: "Raises the warning load. Carried into the assessment as a signal only.",
    pole: "caution",
  },
  {
    key: "clickbait",
    name: "Clickbait",
    reads: "Headline framing that promises more than the article delivers, withholding the decisive part of the claim.",
    weight: "Marked as a presentation signal. It never adds or removes corroboration.",
    pole: "caution",
  },
  {
    key: "fear",
    name: "Fear-mongering",
    reads: "Urgency, threat or panic appeals used to move the reader before the evidence is given.",
    weight: "Counted as a warning signal and reported under language analysis.",
    pole: "caution",
  },
  {
    key: "conspiracy",
    name: "Conspiracy language",
    reads: "Assertion of a hidden cause presented without a source that could be checked.",
    weight: "Flagged. An unsourced assertion is treated as unverified, not as false.",
    pole: "caution",
  },
  {
    key: "anonymous",
    name: "Anonymous sourcing",
    reads: "Claims resting on unnamed or unattributable sources, which cannot be followed up.",
    weight: "Recorded in source metadata. Weakens corroboration; does not decide it.",
    pole: "caution",
  },
  {
    key: "attribution",
    name: "Attribution",
    reads: "Named sources, quoted officials, linked documents — assertions that can be traced to a person or record.",
    weight: "Strengthens the trail. Still not evidence until a claim is cross-checked.",
    pole: "balance",
  },
  {
    key: "temporal",
    name: "Temporal specificity",
    reads: "Concrete dates, times and durations instead of vague recency claims like 'recently'.",
    weight: "Improves checkability: a dated claim can be tested against a dated record.",
    pole: "balance",
  },
  {
    key: "balanced",
    name: "Balanced language",
    reads: "Multiple perspectives, hedged or attributed framing, and claims scaled to what is known.",
    weight: "Recorded as a positive signal — a marker of care, not a guarantee of accuracy.",
    pole: "balance",
  },
  {
    key: "structure",
    name: "Journalistic structure",
    reads: "Article length, paragraphing and the presence of reporting conventions.",
    weight: "A structural observation. Content can be long and still be untrue.",
    pole: "balance",
  },
];

export function PatternsChapter({
  values,
}: {
  /** Real measurements keyed by signal key. A missing key is shown as "—". */
  values: Record<string, number | null | undefined>;
}) {
  const [active, setActive] = useState(0);
  const signal = PATTERN_SIGNALS[active];
  const value = values?.[signal.key];
  const hasValue = typeof value === "number";

  return (
    <div>
      {/* ── The spectrum ── */}
      <div className="flex items-center gap-4">
        <span className="kicker shrink-0" style={{ opacity: 0.5 }}>{AXIS_LEFT}</span>
        <motion.span
          className="h-px flex-1 origin-left"
          style={{ background: "#3A3B3E" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.2, ease: EASE }}
        />
        <span className="kicker shrink-0 text-right" style={{ opacity: 0.5 }}>{AXIS_RIGHT}</span>
      </div>

      {/* ── Two clusters of typographic labels, connected by a rule ── */}
      <div className="mt-9 grid gap-x-14 gap-y-10 lg:grid-cols-2">
        {(["caution", "balance"] as const).map((pole) => {
          const group = PATTERN_SIGNALS.filter((s) => s.pole === pole);
          const tone = pole === "caution" ? "#B08479" : "#8A9A82";
          return (
            <div key={pole}>
              <div className="flex items-baseline justify-between gap-3 border-b pb-2">
                <span className="kicker" style={{ color: tone }}>
                  {pole === "caution" ? "Warning signals" : "Positive signals"}
                </span>
                <span className="kicker tabular" style={{ opacity: 0.5 }}>
                  {group.length} categories
                </span>
              </div>

              <ul className="mt-1">
                {group.map((s) => {
                  const i = PATTERN_SIGNALS.findIndex((x) => x.key === s.key);
                  const isActive = i === active;
                  const v = values?.[s.key];
                  return (
                    <li key={s.key} className="border-b border-border/60">
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        onClick={() => setActive(i)}
                        className="group flex w-full items-center gap-3 py-2.5 text-left min-h-[36px]"
                      >
                        {/* A compact signal bar whose weight follows the measured
                            value, when there is one — it breathes up to full
                            weight when its signal is selected */}
                        <span className="relative block h-[9px] w-9 shrink-0 overflow-visible">
                          <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" style={{ background: "#3A3B3E" }} />
                          {typeof v === "number" && v > 0 && (
                            <motion.span
                              className="absolute top-1/2 h-px -translate-y-1/2"
                              style={{ background: tone, opacity: 0.85 }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.max(6, Math.min(100, v))}%` }}
                              viewport={{ once: true, margin: "-6%" }}
                              animate={{ scaleY: isActive ? 2.5 : 1 }}
                              transition={{
                                scaleY: { type: "spring", stiffness: 300, damping: 22 },
                                width: { duration: 0.9, delay: 0.15 + i * 0.05, ease: EASE },
                              }}
                            />
                          )}
                        </span>
                        <span
                          className="flex-1 text-[12.5px] tracking-[0.01em] transition-all duration-300"
                          style={{
                            color: isActive ? "#F1F0EA" : "#A5A5A1",
                            transform: isActive ? "translateX(2px)" : "translateX(0)",
                          }}
                        >
                          {s.name}
                        </span>
                        <span
                          className="kicker tabular shrink-0 transition-colors duration-300"
                          style={{ color: isActive ? tone : "#6F7074" }}
                        >
                          {typeof v === "number" ? `${v}%` : "—"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── The reading panel — one signal at a time ── */}
      <div className="mt-12 border-t border-border pt-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span
            className="text-[15px] leading-none tracking-[0.04em]"
            style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}
          >
            {signal.name}
          </span>
          <span
            className="kicker"
            style={{ color: signal.pole === "caution" ? "#B08479" : "#8A9A82" }}
          >
            {signal.pole === "caution" ? "Warning signal" : "Positive signal"}
          </span>
          <span className="kicker tabular ml-auto" style={{ opacity: 0.5 }}>
            {hasValue ? `${value}% of this analysis` : "Not measured for this analysis"}
          </span>
        </div>

        <div className="mt-5 grid gap-x-14 gap-y-6 sm:grid-cols-2">
          <div>
            <p className="kicker mb-2" style={{ opacity: 0.5 }}>What it reads</p>
            <p
              className="text-[12.5px] leading-[1.8] text-muted-foreground"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {signal.reads}
            </p>
          </div>
          <div>
            <p className="kicker mb-2" style={{ opacity: 0.5 }}>What it is worth</p>
            <p
              className="text-[12.5px] leading-[1.8] text-muted-foreground"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {signal.weight}
            </p>
          </div>
        </div>
      </div>

      {/* ── The distinction, stated once and plainly ── */}
      <div className="mt-10 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-baseline sm:gap-4">
        <span className="kicker shrink-0" style={{ color: "#B0A183" }}>
          Language patterns are not proof
        </span>
        <p className="text-[12px] leading-[1.75] text-muted-foreground max-w-[68ch]">
          Veritas measures how an article is written and reports it as a signal. A verdict is only ever
          produced from factual claims cross-checked against retrieved independent coverage.
        </p>
      </div>
    </div>
  );
}
