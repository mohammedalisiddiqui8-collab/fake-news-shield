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
const AXIS_LEFT = "Observed";
const AXIS_RIGHT = "Not proof";

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
    reads: "Language pushed past what the reporting supports — loaded nouns, escalating claims.",
    weight: "Raises the warning load. Carried into the assessment as a signal only.",
    pole: "caution",
  },
  {
    key: "clickbait",
    name: "Clickbait",
    reads: "Headline framing that promises more than the article delivers.",
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
    reads: "A hidden cause asserted without a source that could be checked.",
    weight: "Flagged. An unsourced assertion is treated as unverified, not as false.",
    pole: "caution",
  },
  {
    key: "anonymous",
    name: "Anonymous sourcing",
    reads: "Claims resting on unnamed sources, which cannot be followed up.",
    weight: "Recorded in source metadata. Weakens corroboration; does not decide it.",
    pole: "caution",
  },
  {
    key: "attribution",
    name: "Attribution",
    reads: "Named sources, quoted officials, linked documents — assertions that can be traced.",
    weight: "Strengthens the trail. Still not evidence until a claim is cross-checked.",
    pole: "balance",
  },
  {
    key: "temporal",
    name: "Temporal specificity",
    reads: "Concrete dates, times and durations instead of vague recency claims.",
    weight: "Improves checkability: a dated claim can be tested against a dated record.",
    pole: "balance",
  },
  {
    key: "balanced",
    name: "Balanced language",
    reads: "Multiple perspectives and claims scaled to what is known.",
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
  const isMeasured = Object.values(values ?? {}).some((v) => typeof v === "number");

  return (
    <div>
      {/* ── The spectrum ── */}
      <div className="flex items-center gap-4">
        <span className="kicker shrink-0" style={{ opacity: 0.5 }}>{AXIS_LEFT}</span>
        <motion.span
          className="h-px flex-1 origin-left"
          style={{ background: "#242424" }}
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
          const tone = pole === "caution" ? "#B3263E" : "#8FA58A";
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
                          <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" style={{ background: "#242424" }} />
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
                            color: isActive ? "#F1F0EA" : "#A6A39B",
                            transform: isActive ? "translateX(2px)" : "translateX(0)",
                          }}
                        >
                          {s.name}
                        </span>
                        <span
                          className="kicker tabular shrink-0 transition-colors duration-300"
                          style={{ color: isActive ? tone : "#6B6963" }}
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

      {/* ── The reading — one line for the selected signal ── */}
      <div className="mt-10 border-t border-border pt-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span
            className="text-[15px] leading-none tracking-[0.04em]"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif", color: "#F1F0EA" }}
          >
            {signal.name}
          </span>
          <span
            className="kicker"
            style={{ color: signal.pole === "caution" ? "#B3263E" : "#8FA58A" }}
          >
            {signal.pole === "caution" ? "Warning signal" : "Positive signal"}
          </span>
          <span className="kicker tabular ml-auto" style={{ opacity: 0.5 }}>
            {hasValue ? `${value}% of this analysis` : isMeasured ? "Not detected" : "Not measured"}
          </span>
        </div>

        <p
          className="mt-4 max-w-[64ch] text-[13px] leading-[1.7]"
          style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#A6A39B" }}
        >
          {signal.reads} {signal.weight}
        </p>
      </div>

      {/* ── The disclaimer — small, bordered, impossible to miss ── */}
      <div
        className="mt-9 inline-flex max-w-full flex-col gap-1.5 border px-4 py-3"
        style={{ borderColor: "rgba(176,161,131,0.4)", background: "rgba(176,161,131,0.05)" }}
      >
        <span className="kicker" style={{ color: "#B7A47A", fontSize: "9.5px" }}>
          Language patterns are not proof of truth
        </span>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          A verdict is produced only from factual claims cross-checked against retrieved coverage.
        </p>
      </div>
    </div>
  );
}
