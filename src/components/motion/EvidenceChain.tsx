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
  props: EvidenceChainProps
): { title: string; items: string[] } {
  switch (step) {
    case "claim":
      return {
        title: "Claim Analysis",
        items: [
          `Content length: ${props.triggeredKeywords.length > 0 ? "Sufficient" : "Minimal"}`,
          props.triggeredKeywords.length > 0
            ? `${props.triggeredKeywords.length} keywords flagged for review`
            : "Insufficient keyword density detected",
          props.categoryBreakdown.length > 0
            ? `${props.categoryBreakdown.length} signal categories evaluated`
            : "Insufficient evidence available",
        ],
      };
    case "source":
      return {
        title: "Source Verification",
        items: [
          props.redFlags.length === 0
            ? "Source attribution detected"
            : `${props.redFlags.length} source-related concerns identified`,
          props.greenFlags.length > 0
            ? "Named sources present in content"
            : "No verifiable source attribution found",
          "Cross-referencing against known outlets",
        ],
      };
    case "language":
      return {
        title: "Language Analysis",
        items: [
          props.triggeredKeywords.length > 3
            ? "Sensational language patterns detected"
            : "Neutral tone maintained",
          props.redFlags.length > 2
            ? "Emotional manipulation signals present"
            : "Limited emotional appeals found",
          "Syntax and grammar patterns evaluated",
        ],
      };
    case "consistency":
      return {
        title: "Logical Consistency",
        items: [
          props.confidence > 70
            ? "Claims internally consistent"
            : "Inconsistencies detected in narrative",
          props.greenFlags.length > props.redFlags.length
            ? "Supporting evidence outweighs concerns"
            : "Multiple logical gaps identified",
          "Statistical claims cross-checked",
        ],
      };
    case "crosscheck":
      return {
        title: "Cross-Reference",
        items: [
          props.confidence > 80
            ? "Content aligns with verified reporting"
            : "Partial alignment with known sources",
          props.redFlags.length === 0
            ? "No contradictions with established facts"
            : `${props.redFlags.length} contradictions found`,
          "Pattern matching against known misinformation",
        ],
      };
    case "verdict":
      return {
        title: "Final Assessment",
        items: [
          `Confidence: ${props.confidence}%`,
          `Positive signals: ${props.greenFlags.length}`,
          `Warning signals: ${props.redFlags.length}`,
          props.confidence > 70
            ? "Overall assessment: Credible content"
            : props.confidence > 40
              ? "Assessment: Mixed reliability"
              : "Assessment: Significant concerns",
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
