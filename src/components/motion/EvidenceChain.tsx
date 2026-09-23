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
  searchFailed?: boolean;
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
  const supporting = p.supportingSources ?? 0;
  const contradicting = p.contradictingSources ?? 0;
  const checked = p.crossCheckedClaims ?? 0;
  const searchFailed = p.searchFailed ?? false;
  const hasClaims = (p.claimsCount ?? 0) > 0;

  const searchStatement = searchFailed
    ? "External source search unavailable — insufficient evidence available"
    : external > 0
      ? external + " independent source result(s) retrieved via live search"
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
            ? supporting + " retrieved result(s) support extracted claims"
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
          contradicting > 0
            ? contradicting + " retrieved source(s) contradict extracted claims"
            : "No retrieved source contradicts the extracted claims",
          supporting > 0
            ? supporting + " retrieved source(s) support extracted claims"
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

  return (
    <div className="space-y-0">
      {chainSteps.map((step, i) => {
        const detail = getStepDetail(step.key, props);
        const isExpanded = expandedStep === step.key;

        return (
          <div key={step.key}>
            {/* Step header */}
            <button
              type="button"
              className="w-full flex items-center gap-3 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.02]"
              style={{
                borderBottom: "1px solid #1E1E1E",
              }}
              onClick={() =>
                setExpandedStep(isExpanded ? null : step.key)
              }
            >
              <div
                className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0"
                style={{
                  background: isExpanded
                    ? "rgba(168,144,110,0.08)"
                    : "#111111",
                  border: `1px solid ${isExpanded ? "rgba(168,144,110,0.2)" : "#1E1E1E"}`,
                }}
              >
                <step.icon
                  className="w-3 h-3"
                  style={{
                    color: isExpanded ? "#A8906E" : "#A8A098",
                  }}
                />
              </div>
              <span
                className="text-[9px] font-bold tracking-[0.2em] flex-1 text-left"
                style={{
                  color: isExpanded ? "#F5F0E8" : "#A8A098",
                }}
              >
                {step.label}
              </span>
              <span
                className="text-[8px] mr-1"
                style={{ color: "#A8A098", opacity: 0.5 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  className="w-3 h-3"
                  style={{ color: "#A8A098" }}
                />
              </motion.div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="py-3 pl-9 pr-4">
                    <p
                      className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-2"
                      style={{ color: "#A8906E" }}
                    >
                      {detail.title}
                    </p>
                    <div className="space-y-1.5">
                      {detail.items.map((item, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.05, duration: 0.2 }}
                          className="flex items-start gap-2"
                        >
                          <span
                            className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                            style={{
                              background:
                                item.includes("Insufficient") ||
                                item.includes("unavailable") ||
                                item.includes("NO INDEPENDENT") ||
                                item.includes("No retrieved") ||
                                item.includes("No named source") ||
                                item.includes("No factual claims") ||
                                item.includes("No claims") ||
                                item.includes("concerns") ||
                                item.includes("gaps") ||
                                item.includes("No verifiable")
                                  ? "#A85A50"
                                  : "#A8906E",
                            }}
                          />
                          <span
                            className="text-[10px] leading-relaxed"
                            style={{ color: "#A8A098" }}
                          >
                            {item}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
