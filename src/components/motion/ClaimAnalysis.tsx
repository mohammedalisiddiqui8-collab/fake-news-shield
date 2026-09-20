"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

/* ─── Types ─── */
export interface Claim {
  id: number;
  text: string;
  status: "verified" | "uncertain" | "contradicted" | "needs_verification";
  confidence: number;
  evidence: string;
  sources: string[];
  contradictingSources: string[];
  explanation: string;
}

interface ClaimAnalysisProps {
  claims: Claim[];
}

/* ─── Status Config ─── */
const statusConfig: Record<
  Claim["status"],
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  verified: {
    icon: CheckCircle2,
    color: "#A8906E",
    label: "VERIFIED",
  },
  uncertain: {
    icon: HelpCircle,
    color: "#8A6A45",
    label: "UNCERTAIN",
  },
  contradicted: {
    icon: XCircle,
    color: "#A85A50",
    label: "CONTRADICTED",
  },
  needs_verification: {
    icon: AlertTriangle,
    color: "#A8A098",
    label: "NEEDS VERIFICATION",
  },
};

/**
 * Claim-by-claim analysis extracted from an article.
 * Each claim is expandable to show evidence, sources, and reasoning.
 */
export function ClaimAnalysis({ claims }: ClaimAnalysisProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (claims.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-[10px]" style={{ color: "#A8A098" }}>
          No distinct claims could be extracted from this content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {claims.map((claim) => {
        const config = statusConfig[claim.status];
        const Icon = config.icon;
        const isExpanded = expandedId === claim.id;

        return (
          <div key={claim.id}>
            {/* Claim header */}
            <button
              type="button"
              className="w-full text-left cursor-pointer flex items-start gap-3 py-3 px-0 transition-colors hover:bg-white/[0.015]"
              style={{ borderBottom: "1px solid #1E1E1E" }}
              onClick={() =>
                setExpandedId(isExpanded ? null : claim.id)
              }
            >
              {/* Status icon */}
              <div
                className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: isExpanded
                    ? `${config.color}12`
                    : "#0A0A0A",
                  border: `1px solid ${isExpanded ? `${config.color}30` : "#1E1E1E"}`,
                }}
              >
                <Icon
                  className="w-3 h-3"
                  style={{ color: config.color }}
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Claim number + status badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[8px] font-bold tracking-[0.2em]"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#8A6A45",
                    }}
                  >
                    CLAIM {String(claim.id).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[7px] font-bold tracking-[0.1em] px-1.5 py-0.5"
                    style={{
                      background: `${config.color}15`,
                      color: config.color,
                      borderRadius: "1px",
                    }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Claim text */}
                <p
                  className="text-[11px] leading-relaxed italic"
                  style={{ color: "#F5F0E8" }}
                >
                  "{claim.text}"
                </p>

                {/* Confidence bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[8px] tracking-wider"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#A8A098",
                    }}
                  >
                    CONFIDENCE
                  </span>
                  <div
                    className="h-[2px] flex-1 max-w-[60px] rounded-full overflow-hidden"
                    style={{ background: "#1E1E1E" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${claim.confidence}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-full rounded-full"
                      style={{
                        background: config.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: config.color,
                    }}
                  >
                    {claim.confidence}%
                  </span>
                </div>
              </div>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 mt-1"
              >
                <ChevronDown
                  className="w-3.5 h-3.5"
                  style={{ color: "#A8A098" }}
                />
              </motion.div>
            </button>

            {/* Expanded evidence */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 pb-4 pt-3 pl-12"
                    style={{ borderTop: "1px solid #1E1E1E" }}
                  >
                    {/* Evidence */}
                    <div className="mb-3">
                      <p
                        className="text-[8px] font-bold tracking-[0.15em] uppercase mb-1"
                        style={{ color: "#A8906E" }}
                      >
                        Evidence
                      </p>
                      <p
                        className="text-[10px] leading-relaxed"
                        style={{ color: "#A8A098" }}
                      >
                        {claim.evidence}
                      </p>
                    </div>

                    {/* Supporting sources */}
                    {claim.sources.length > 0 && (
                      <div className="mb-3">
                        <p
                          className="text-[8px] font-bold tracking-[0.15em] uppercase mb-1"
                          style={{ color: "#A8906E" }}
                        >
                          Supporting Sources
                        </p>
                        <div className="space-y-1">
                          {claim.sources.map((src, j) => (
                            <div
                              key={j}
                              className="flex items-center gap-1.5"
                            >
                              <ExternalLink
                                className="w-2.5 h-2.5 shrink-0"
                                style={{ color: "#A8906E" }}
                              />
                              <span
                                className="text-[9px]"
                                style={{ color: "#A8A098" }}
                              >
                                {src}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contradicting sources */}
                    {claim.contradictingSources.length > 0 && (
                      <div className="mb-3">
                        <p
                          className="text-[8px] font-bold tracking-[0.15em] uppercase mb-1"
                          style={{ color: "#A85A50" }}
                        >
                          Contradicting Sources
                        </p>
                        <div className="space-y-1">
                          {claim.contradictingSources.map((src, j) => (
                            <div
                              key={j}
                              className="flex items-center gap-1.5"
                            >
                              <XCircle
                                className="w-2.5 h-2.5 shrink-0"
                                style={{ color: "#A85A50" }}
                              />
                              <span
                                className="text-[9px]"
                                style={{ color: "#A8A098" }}
                              >
                                {src}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <p
                        className="text-[8px] font-bold tracking-[0.15em] uppercase mb-1"
                        style={{ color: "#A8906E" }}
                      >
                        Reasoning
                      </p>
                      <p
                        className="text-[10px] leading-relaxed"
                        style={{ color: "#A8A098" }}
                      >
                        {claim.explanation}
                      </p>
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
