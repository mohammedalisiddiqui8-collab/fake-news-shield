"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
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
  status: "supported" | "uncertain" | "contradicted" | "needs_verification";
  confidence: number;
  evidence: string;
  sources: string[];
  contradictingSources: string[];
  explanation: string;
}

interface ClaimAnalysisProps {
  claims: Claim[];
}

/* ─── Status Config — muted printed palette, never glowing ─── */
const statusConfig: Record<
  Claim["status"],
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  supported: { icon: CheckCircle2, color: "#8A9A82", label: "SUPPORTED" },
  uncertain: { icon: HelpCircle, color: "#B0A183", label: "UNCERTAIN" },
  contradicted: { icon: XCircle, color: "#B08479", label: "CONTRADICTED" },
  needs_verification: { icon: AlertTriangle, color: "#A5A5A1", label: "NEEDS VERIFICATION" },
};

/**
 * Claim-by-claim analysis rendered as an investigative document:
 * editorial numbering, thin rules, generous whitespace — no floating cards.
 * Each claim expands to show evidence, sources and reasoning.
 */
export function ClaimAnalysis({ claims }: ClaimAnalysisProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (claims.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[10.5px] text-muted-foreground">
          No distinct claims could be extracted from this content.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {claims.map((claim) => {
        const config = statusConfig[claim.status];
        const isExpanded = expandedId === claim.id;

        return (
          <div key={claim.id} className="border-b border-border">
            {/* Claim header — number, status, quotation, confidence */}
            <button
              type="button"
              aria-expanded={isExpanded}
              className="w-full cursor-pointer text-left py-6 transition-colors hover:bg-[rgba(241,240,234,0.018)]"
              onClick={() => setExpandedId(isExpanded ? null : claim.id)}
            >
              <div className="flex items-baseline justify-between gap-4 px-1">
                <span className="num-marker" style={{ color: "#C9C3B7" }}>
                  Claim {String(claim.id).padStart(2, "0")}
                </span>
                <span
                  className="kicker shrink-0 inline-flex items-center gap-1.5"
                  style={{ color: config.color }}
                >
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-4 px-1">
                <p
                  className="flex-1 min-w-0 text-[15px] sm:text-[16px] leading-[1.65] italic"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
                >
                  “{claim.text}”
                </p>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 mt-1.5"
                >
                  <ChevronDown className="w-4 h-4" style={{ color: "#A5A5A1" }} />
                </motion.div>
              </div>

              <div className="mt-3.5 flex items-center gap-3 px-1">
                <span className="kicker" style={{ opacity: 0.7 }}>Confidence</span>
                <span className="h-[2px] w-24 sm:w-32" style={{ background: "#3A3B3E" }}>
                  <motion.span
                    className="block h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${claim.confidence}%` }}
                    transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ background: config.color }}
                  />
                </span>
                <span
                  className="text-[11px] tabular"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: config.color }}
                >
                  {claim.confidence}%
                </span>
              </div>
            </button>

            {/* Expanded evidence — indented document block, revealed with a
                small status flourish: the verdict chip re-affirms itself as
                the evidence opens, so the state change is felt, not just seen */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-1 pb-7 pt-2 sm:pl-10 space-y-5">
                    <motion.span
                      className="block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span
                        className="kicker"
                        style={{ color: config.color, border: `1px solid ${config.color}55`, padding: "3px 8px" }}
                      >
                        {config.label} · {claim.confidence}% CONFIDENCE
                      </span>
                    </motion.span>
                    <div>
                      <p className="kicker" style={{ color: "#C9C3B7" }}>Evidence</p>
                      <p
                        className="mt-2 text-[13px] leading-[1.8]"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
                      >
                        {claim.evidence}
                      </p>
                    </div>

                    {claim.sources.length > 0 && (
                      <div>
                        <p className="kicker" style={{ color: "#8A9A82" }}>Supporting sources</p>
                        <div className="mt-2 space-y-1.5">
                          {claim.sources.map((src, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#8A9A82" }} />
                              <span className="text-[12px] leading-relaxed text-muted-foreground">{src}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {claim.contradictingSources.length > 0 && (
                      <div>
                        <p className="kicker" style={{ color: "#B08479" }}>Contradicting sources</p>
                        <div className="mt-2 space-y-1.5">
                          {claim.contradictingSources.map((src, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <XCircle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#B08479" }} />
                              <span className="text-[12px] leading-relaxed text-muted-foreground">{src}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="kicker" style={{ color: "#C9C3B7" }}>Reasoning</p>
                      <p
                        className="mt-2 text-[13px] leading-[1.8]"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
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
