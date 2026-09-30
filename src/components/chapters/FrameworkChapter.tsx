import { useState } from "react";
import { motion } from "framer-motion";

/**
 * CHAPTER 04 · FRAMEWORK
 *
 * What runs underneath the interface. This diagram describes only the
 * operations the product actually performs — retrieval, claim extraction,
 * external evidence, cross-checking, language signals and credibility
 * assessment. There are no capabilities here that Veritas does not use.
 *
 * Two tracks run in parallel — the claim track and the language track — and
 * only the claim track is allowed to reach the verdict. The separation is
 * drawn literally: the language track terminates at the assessment as an
 * annotated input, never as a decision.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export interface FrameworkNode {
  id: string;
  label: string;
  /** What this step actually does. */
  detail: string;
  /** The concrete output it produces, if any. */
  output: string;
}

export const FRAMEWORK_INPUT: FrameworkNode = {
  id: "input",
  label: "Input",
  detail:
    "An article URL is retrieved and read, or a pasted text is accepted as filed. Three analysis depths are available: quick, standard and deep.",
  output: "Article text",
};

export const FRAMEWORK_CLAIM_TRACK: FrameworkNode[] = [
  {
    id: "extract",
    label: "Claim extraction",
    detail:
      "Checkable factual statements are isolated from the article. Opinion, tone and framing are not treated as claims.",
    output: "Numbered claims",
  },
  {
    id: "retrieval",
    label: "Source retrieval",
    detail:
      "Each claim is searched against live news coverage to find independent reporting that examined the same assertion.",
    output: "Retrieved sources",
  },
  {
    id: "evidence",
    label: "External evidence",
    detail:
      "Relevant passages are extracted from what was retrieved, with publication, date and the relationship to the claim.",
    output: "supports / contradicts / partial / not addressed",
  },
  {
    id: "crosscheck",
    label: "Cross-checking",
    detail:
      "Every claim is measured against the sources found for it. Where corroboration is missing or mixed, the gap is reported rather than resolved.",
    output: "Per-claim status",
  },
];

export const FRAMEWORK_LANGUAGE_TRACK: FrameworkNode[] = [
  {
    id: "nlp",
    label: "NLP signal extraction",
    detail:
      "Category-based pattern matching measures sensationalism, clickbait, fear appeals, conspiracy framing, anonymous sourcing, attribution, temporal specificity, balanced language and journalistic structure.",
    output: "Warning and positive signals",
  },
  {
    id: "framing",
    label: "Framing analysis",
    detail:
      "Narrative and rhetorical choices are reported separately, describing how the piece is presented rather than what it asserts.",
    output: "Framing signals",
  },
];

function Node({
  node,
  i,
  tone = "#C9C3B7",
}: {
  node: FrameworkNode;
  i: number;
  tone?: string;
}) {
  // The pipeline is read top to bottom: each stage appears in sequence and
  // the connecting rule is drawn from its node to the next as the chapter
  // scrolls into view — the diagram assembles itself in process order.
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px -6% 0px" }}
      transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
      className="relative pb-8 pl-7 last:pb-0"
    >
      {/* The track spine and its node */}
      <motion.span
        className="absolute left-0 top-[5px] block h-[7px] w-[7px]"
        style={{ background: "#202124", border: `1px solid ${tone}` }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-6% 0px -6% 0px" }}
        transition={{ duration: 0.4, delay: i * 0.12, ease: EASE }}
        aria-hidden="true"
      />
      <motion.span
        className="absolute left-[3px] top-[16px] bottom-[-8px] w-px origin-top"
        style={{ background: "#3A3B3E" }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-6% 0px -6% 0px" }}
        transition={{ duration: 0.5, delay: 0.06 + i * 0.12, ease: EASE }}
        aria-hidden="true"
      />

      <p className="text-[14px] leading-none tracking-[0.02em]" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}>
        {node.label}
      </p>
      <p
        className="mt-2.5 text-[12px] leading-[1.75] text-muted-foreground max-w-[58ch]"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        {node.detail}
      </p>
      <p className="kicker mt-2.5" style={{ color: tone, opacity: 0.8 }}>
        → {node.output}
      </p>
    </motion.li>
  );
}

export function FrameworkChapter() {
  const [tab, setTab] = useState<"claims" | "language">("claims");
  const track = tab === "claims" ? FRAMEWORK_CLAIM_TRACK : FRAMEWORK_LANGUAGE_TRACK;
  const tone = tab === "claims" ? "#C9C3B7" : "#B0A183";

  return (
    <div>
      {/* ── Input ── */}
      <div className="border border-border p-5 sm:p-6" style={{ background: "#252629" }}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="kicker" style={{ color: "#C9C3B7" }}>Input</span>
          <span className="text-[15px] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}>
            {FRAMEWORK_INPUT.label}
          </span>
          <span className="kicker ml-auto" style={{ color: "#C9C3B7" }}>
            → {FRAMEWORK_INPUT.output}
          </span>
        </div>
        <p
          className="mt-3 text-[12.5px] leading-[1.75] text-muted-foreground max-w-[70ch]"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          {FRAMEWORK_INPUT.detail}
        </p>
      </div>

      {/* ── The two tracks ── */}
      <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-2">
        {/* Track switch */}
        <div className="lg:col-span-2 flex items-center gap-6">
          <div className="flex items-center border border-border">
            {(["claims", "language"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="relative px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors"
                style={{ color: tab === t ? "#F1F0EA" : "#7E7F83" }}
              >
                {t === "claims" ? "Claim track" : "Language track"}
                {tab === t && (
                  <motion.span
                    layoutId="framework-tab"
                    className="absolute left-0 right-0 bottom-0 h-[1.5px]"
                    style={{ background: "#C9C3B7" }}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground max-w-[52ch]">
            {tab === "claims"
              ? "The claim track is the only path to a verdict. It is the whole of the verification method."
              : "The language track runs alongside and reports on how the article is written. It is annotated, never decisive."}
          </p>
        </div>

        {/* The active track */}
        <motion.ul
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="relative"
        >
          <li className="relative pb-8 pl-7">
            <span className="absolute left-0 top-[5px] block h-[7px] w-[7px]" style={{ background: "#202124", border: `1px solid ${tone}` }} />
            <p className="kicker" style={{ opacity: 0.5 }}>Track</p>
            <p className="mt-2 text-[15px] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}>
              {tab === "claims" ? "Factual verification" : "Language & framing"}
            </p>
          </li>
          {track.map((node, i) => (
            <Node key={node.id} node={node} i={i + 1} tone={tone} />
          ))}
        </motion.ul>

        {/* The assessment, and the convergence */}
        <div className="lg:pl-8">
          <div className="border-t border-border pt-6">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="kicker" style={{ opacity: 0.5 }}>Both tracks report to</span>
              <span className="text-[15px] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}>
                Credibility assessment
              </span>
            </div>
            <p
              className="mt-3 text-[12.5px] leading-[1.75] text-muted-foreground max-w-[56ch]"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              Four factors are reported: source reliability, claim consistency, language signal and evidence
              strength. Each is shown with the figures it was computed from, and each can be opened to read
              its basis.
            </p>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="kicker" style={{ opacity: 0.5 }}>Produced by the claim track only</span>
              <span className="text-[15px] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}>
                Verdict &amp; confidence
              </span>
            </div>
            <p
              className="mt-3 text-[12.5px] leading-[1.75] text-muted-foreground max-w-[56ch]"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              A verdict and a confidence figure, published with the reasoning that produced them. When
              evidence is missing or mixed, the result is uncertainty — not a guess.
            </p>

            {/* The separation, drawn */}
            <div
              className="mt-6 flex items-start gap-3 border p-4"
              style={{ borderColor: "rgba(176,161,131,0.3)", background: "rgba(176,161,131,0.05)" }}
            >
              <span className="mt-[6px] block h-[7px] w-[7px] shrink-0" style={{ background: "#B0A183" }} />
              <p className="text-[11.5px] leading-[1.7] text-muted-foreground">
                The language track stops here. It is reported beside the verdict as an observation about
                writing, and it cannot produce one on its own.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
