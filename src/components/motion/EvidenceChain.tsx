"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  FileText,
  Search,
  Brain,
  Target,
  Link2,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface EvidenceChainProps {
  verdict: string;
  confidence: number;
  redFlags: string[];
  greenFlags: string[];
  triggeredKeywords: string[];
  categoryBreakdown: Array<{
    category: string;
    type: "red" | "green";
    score: number;
    maxScore: number;
    findings: string[];
  }>;
  /* Real investigation data — every item optional so the component stays honest
     when data is unavailable (history loads, failed searches). */
  wordCount?: number;
  claimsCount?: number;
  sourceName?: string;
  /** Real independent source results retrieved in the live cross-check. */
  externalSources?: number;
  supportingSources?: number;
  contradictingSources?: number;
  corroboratedClaims?: number;
  contradictedClaims?: number;
  uncertainClaims?: number;
  unverifiedClaims?: number;
  crossCheckedClaims?: number;
  /** CLAIM–SOURCE REFERENCES — one source cited by N claims counts N times. */
  claimSourceRefs?: number;
  searchFailed?: boolean;
  /** URL retrieval failed — no investigation occurred. The chain is replaced
   *  by INPUT → RETRIEVAL FAILED with every stage disabled. */
  retrievalFailed?: boolean;
  failureReason?: string;
}

const chainSteps = [
  { key: "claim", label: "CLAIM", icon: FileText },
  { key: "source", label: "SOURCE", icon: Search },
  { key: "language", label: "LANGUAGE", icon: Brain },
  { key: "consistency", label: "CONSISTENCY", icon: Target },
  { key: "crosscheck", label: "CROSS-CHECK", icon: Link2 },
  { key: "verdict", label: "VERDICT", icon: Shield },
];

function getStepDetail(
  step: string,
  p: EvidenceChainProps
): { title: string; items: string[] } {
  const external = p.externalSources ?? 0;
  const refs = p.claimSourceRefs ?? 0;
  const supporting = p.supportingSources ?? 0;
  const contradicting = p.contradictingSources ?? 0;
  const checked = p.crossCheckedClaims ?? 0;
  const searchFailed = p.searchFailed ?? false;
  const hasClaims = (p.claimsCount ?? 0) > 0;

  const searchStatement = searchFailed
    ? "External source search unavailable — insufficient evidence available"
    : checked === 0
      ? "External source search not performed — no claims were available to cross-check"
      : external > 0
        ? external + " unique independent source(s) retrieved via live search (" + refs + " claim–source reference(s))"
        : "NO INDEPENDENT CORROBORATION FOUND";

  switch (step) {
    case "claim":
      return {
        title: "Claim Analysis",
        items: [
          p.wordCount != null ? p.wordCount + " words analyzed" : "Content length unavailable",
          hasClaims
            ? (p.claimsCount + " factual claim(s) extracted from the submitted content")
            : "No factual claims extracted — insufficient evidence available",
          p.categoryBreakdown.length > 0
            ? p.categoryBreakdown.length + " signal categories evaluated"
            : "No signal categories available",
        ],
      };
    case "source":
      return {
        title: "Source Verification",
        items: [
          p.sourceName && p.sourceName !== "NOT AVAILABLE"
            ? "Named source detected in text: " + p.sourceName
            : "No named source detected in text",
          searchStatement,
          supporting > 0
            ? supporting + " claim–source reference(s) support extracted claims"
            : "No retrieved source supports the extracted claims",
        ],
      };
    case "language":
      return {
        title: "Language Analysis",
        items: [
          p.redFlags.length + " warning and " + p.greenFlags.length + " positive linguistic patterns detected",
          p.triggeredKeywords.length > 0
            ? p.triggeredKeywords.length + " warning keyword(s) flagged for review"
            : "No warning keywords flagged",
          "Linguistic analysis is supplementary to external evidence — it does not verify facts",
        ],
      };
    case "consistency":
      return {
        title: "Claim Consistency",
        items: hasClaims
          ? [
              (p.corroboratedClaims ?? 0) + " corroborated · " + (p.contradictedClaims ?? 0) + " contradicted · " + (p.uncertainClaims ?? 0) + " uncertain · " + (p.unverifiedClaims ?? 0) + " unverified",
              checked > 0
                ? checked + " claim(s) cross-checked against live external sources"
                : "No claims were cross-checked — insufficient evidence available",
              "Absence of corroboration is not proof of falsity",
            ]
          : ["No claims to assess — insufficient evidence available"],
      };
    case "crosscheck":
      return {
        title: "Cross-Reference",
        items: [
          external > 0 || refs > 0
            ? external + " unique source(s) across " + refs + " claim–source reference(s)"
            : "No independent sources retrieved",
          contradicting > 0
            ? contradicting + " claim–source reference(s) contradict extracted claims"
            : "No retrieved source contradicts the extracted claims",
          supporting > 0
            ? supporting + " claim–source reference(s) support extracted claims"
            : "NO INDEPENDENT CORROBORATION FOUND",
          checked > 0
            ? searchFailed
              ? "Source search unavailable for at least one claim"
              : checked + " claim(s) searched against live news coverage"
            : "No cross-check performed for this analysis",
        ],
      };
    case "verdict":
      return {
        title: "Final Assessment",
        items: [
          `Confidence: ${p.confidence}%`,
          `Positive signals: ${p.greenFlags.length} · Warning signals: ${p.redFlags.length}`,
          supporting + contradicting > 0
            ? "Verdict derived from retrieved claims and external evidence"
            : "Insufficient external evidence — verdict limited to linguistic pattern analysis",
        ],
      };
    default:
      return { title: "", items: [] };
  }
}

export function EvidenceChain(props: EvidenceChainProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  /* ── RETRIEVAL FAILED: the investigation never ran. Show the stop point
     on the same timeline, with every real stage marked as not executed. ── */
  if (props.retrievalFailed) {
    return (
      <div className="border-t border-border">
        <div className="flex items-center gap-4 py-4">
          <span className="num-marker shrink-0" style={{ color: "#B08479" }}>00</span>
          <span className="kicker flex-1" style={{ color: "#B08479" }}>
            Input → retrieval failed
          </span>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: "#B08479" }} />
        </div>
        <p className="pb-5 pl-9 sm:pl-12 text-[12px] leading-[1.75] text-muted-foreground max-w-2xl">
          Reason: {props.failureReason || "URL could not be accessed or article content could not be retrieved."}{" "}
          The investigation stopped here — claim extraction, source search, evidence collection,
          cross-checking, framing analysis, confidence calculation and verdict generation were not executed.
        </p>
        {chainSteps.map((step, i) => (
          <div
            key={step.key}
            className="flex items-center gap-4 py-4 border-t border-border/60 opacity-40"
            aria-disabled="true"
          >
            <span className="num-marker shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <span className="kicker flex-1">{step.label}</span>
            <span className="kicker shrink-0" style={{ opacity: 0.7 }}>Not executed</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ol className="relative">
      {/* One hairline spine running the length of the chain */}
      <span
        className="absolute left-[15px] top-3 bottom-3 w-px sm:left-[17px]"
        style={{ background: "#3A3B3E" }}
        aria-hidden="true"
      />

      {chainSteps.map((step, i) => {
        const detail = getStepDetail(step.key, props);
        const isExpanded = expandedStep === step.key;
        const isLast = i === chainSteps.length - 1;

        return (
          <li key={step.key} className="relative">
            <button
              type="button"
              onClick={() => setExpandedStep(isExpanded ? null : step.key)}
              aria-expanded={isExpanded}
              className="group relative flex w-full items-center gap-4 py-5 text-left transition-colors duration-300 hover:bg-[rgba(241,240,234,0.02)]"
            >
              <span className="relative z-10 shrink-0">
                <span
                  className="flex h-[31px] w-[31px] items-center justify-center text-[9px] tabular transition-colors duration-300 sm:h-[35px] sm:w-[35px]"
                  style={{
                    background: isExpanded ? "#C9C3B7" : "#202124",
                    border: `1px solid ${isExpanded ? "#C9C3B7" : "#3A3B3E"}`,
                    color: isExpanded ? "#151618" : "#A5A5A1",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>

              <span className="flex-1 min-w-0">
                <span
                  className="block font-serif-editorial text-[16px] sm:text-[18px] leading-tight transition-colors duration-300"
                  style={{ color: isExpanded ? "#F1F0EA" : "#CFCEC8" }}
                >
                  {step.label}
                </span>
                <span className="kicker mt-1.5 block" style={{ opacity: 0.5 }}>
                  {detail.title}
                </span>
              </span>

              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0"
              >
                <ChevronDown className="w-3.5 h-3.5" style={{ color: "#6F7074" }} />
              </motion.span>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-7 pl-[47px] sm:pl-[55px] pr-2">
                    <ul className="space-y-2.5 max-w-2xl">
                      {detail.items.map((item, j) => {
                        const negative =
                          item.includes("Insufficient") ||
                          item.includes("unavailable") ||
                          item.includes("NO INDEPENDENT") ||
                          item.includes("No retrieved") ||
                          item.includes("No named source") ||
                          item.includes("No factual claims") ||
                          item.includes("No claims") ||
                          item.includes("concerns") ||
                          item.includes("gaps") ||
                          item.includes("No verifiable");
                        return (
                          <motion.li
                            key={j}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: j * 0.05, duration: 0.25 }}
                            className="flex items-start gap-3"
                          >
                            <span
                              className="mt-[7px] h-px w-3 shrink-0"
                              style={{ background: negative ? "#B08479" : "#5C5D61" }}
                            />
                            <span
                              className="text-[12.5px] leading-[1.7]"
                              style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: negative ? "#D8C6C1" : "#A5A5A1",
                              }}
                            >
                              {item}
                            </span>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isExpanded && !isLast && <span className="block h-px w-full" style={{ background: "transparent" }} />}
          </li>
        );
      })}
    </ol>
  );
}
