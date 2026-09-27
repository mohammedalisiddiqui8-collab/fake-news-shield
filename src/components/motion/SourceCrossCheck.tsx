import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, HelpCircle, ExternalLink, ChevronDown } from "lucide-react";
import { claimSourceRefs } from "@/lib/investigationStats";

export interface CrossCheckSource {
  name: string;
  headline: string;
  date: string;
  excerpt: string;
  relationship: "supports" | "contradicts" | "partial" | "does_not_address" | "unverified" | "insufficient";
  url?: string;
}

export interface CrossCheckClaim {
  claimId: number;
  claimText: string;
  sources: CrossCheckSource[];
}

function domainOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const relConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  supports: { label: "SUPPORTS", icon: CheckCircle2, color: "#8A9A82", bg: "rgba(138,154,130,0.07)" },
  contradicts: { label: "CONTRADICTS", icon: AlertTriangle, color: "#B08479", bg: "rgba(176,132,121,0.07)" },
  partial: { label: "PARTIAL", icon: HelpCircle, color: "#B0A183", bg: "rgba(176,161,131,0.07)" },
  does_not_address: { label: "DOES NOT ADDRESS", icon: HelpCircle, color: "#A5A5A1", bg: "rgba(241,240,234,0.05)" },
  unverified: { label: "UNVERIFIED", icon: HelpCircle, color: "#A5A5A1", bg: "rgba(241,240,234,0.05)" },
  insufficient: { label: "INSUFFICIENT", icon: HelpCircle, color: "#A5A5A1", bg: "rgba(241,240,234,0.05)" },
};

const claimStatusConfig: Record<string, { label: string; color: string }> = {
  supported: { label: "CORROBORATED", color: "#8A9A82" },
  contradicted: { label: "CONTRADICTED", color: "#B08479" },
  uncertain: { label: "UNCERTAIN", color: "#B0A183" },
  needs_verification: { label: "UNVERIFIED", color: "#A5A5A1" },
};

/**
 * Source Cross-Check as an editorial evidence list: numbered claims on
 * hairline rows, expandable into numbered sources with subtle status pills.
 * No card grids — dividers, numbering and typography carry the structure.
 */
export function SourceCrossCheck({ crossCheck, claims }: {
  crossCheck: CrossCheckClaim[];
  /** Claim statuses from the same investigation — shown so each claim row
   *  states its corroborated / contradicted / unverified assessment. */
  claims?: Array<{ id: number; status: string }>;
}) {
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);

  if (!crossCheck || crossCheck.length === 0) {
    return <p className="text-[11px] text-muted-foreground italic py-2">No cross-check data available.</p>;
  }

  return (
    <div className="border-t border-border">
      {crossCheck.map((claim, ci) => {
        const isOpen = expandedClaim === claim.claimId;
        const supports = claim.sources.filter(s => s.relationship === "supports").length;
        const contradicts = claim.sources.filter(s => s.relationship === "contradicts").length;
        // Same rule as the aggregate: only real retrieved sources count —
        // sentinel notices are not references. Sum over claims == aggregate.
        const refs = claimSourceRefs(claim.sources);
        const status = claims?.find(c => c.id === claim.claimId)?.status;
        const statusBadge = status ? claimStatusConfig[status] : undefined;
        return (
          <div key={claim.claimId} className="border-b border-border">
            <button
              type="button"
              onClick={() => setExpandedClaim(isOpen ? null : claim.claimId)}
              className="w-full text-left py-3.5 -mx-2 px-2 row-hover"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="num-marker shrink-0 mt-1">{String(ci + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                    {statusBadge && (
                      <span className="text-[9.5px] font-semibold tracking-[0.14em]" style={{ color: statusBadge.color }}>
                        {statusBadge.label}
                      </span>
                    )}
                    {supports > 0 && (
                      <span className="text-[9.5px] font-semibold tracking-[0.14em]" style={{ color: "#8A9A82" }}>
                        {supports} SUPPORT{supports > 1 ? "S" : ""}
                      </span>
                    )}
                    {contradicts > 0 && (
                      <span className="text-[9.5px] font-semibold tracking-[0.14em]" style={{ color: "#B08479" }}>
                        {contradicts} CONTRADICT{contradicts > 1 ? "S" : ""}
                      </span>
                    )}
                    <span className="kicker" style={{ opacity: 0.7 }}>
                      {refs > 0
                        ? `${refs} source ref${refs > 1 ? "s" : ""}`
                        : claim.sources.length > 0
                          ? "0 refs — search notice, no source retrieved"
                          : "0 refs"}
                    </span>
                  </div>
                  <p
                    className="mt-1.5 text-[13px] leading-snug"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
                  >
                    {claim.claimText}
                  </p>
                </div>
                <span className="hidden sm:block kicker shrink-0 mt-1" style={{ opacity: 0.6 }}>
                  {claim.sources.length} source{claim.sources.length === 1 ? "" : "s"}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 mt-1"
                >
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: "#A5A5A1" }} />
                </motion.span>
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 sm:pl-9">
                    <p className="kicker mb-2">
                      {refs > 0
                        ? "Retrieved sources — each states whether it supports or contradicts the claim"
                        : "No independent source was retrieved for this claim"}
                    </p>
                    {claim.sources.length > 0 && (
                      <div className="border-t border-border/70">
                        {claim.sources.map((src, si) => {
                          const rc = relConfig[src.relationship] || relConfig.insufficient;
                          const Icon = rc.icon;
                          const dom = domainOf(src.url);
                          return (
                            <div key={si} className="py-3 border-b border-border/70 last:border-b-0">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-baseline gap-2.5 min-w-0">
                                  <span className="num-marker shrink-0" style={{ opacity: 0.65 }}>
                                    {String(si + 1).padStart(2, "0")}
                                  </span>
                                  <span className="text-[12px] font-medium truncate" style={{ color: "#F1F0EA" }}>
                                    {src.name}
                                  </span>
                                  {dom && dom !== src.name && (
                                    <span className="kicker truncate" style={{ opacity: 0.6 }}>{dom}</span>
                                  )}
                                </div>
                                <span
                                  className="shrink-0 inline-flex items-center gap-1 text-[8px] font-semibold tracking-[0.14em] px-1.5 py-0.5 border"
                                  style={{ color: rc.color, borderColor: `${rc.color}55`, background: rc.bg }}
                                >
                                  <Icon className="w-2.5 h-2.5" />
                                  {rc.label}
                                </span>
                              </div>
                              <p
                                className="mt-1.5 text-[12px] leading-snug"
                                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
                              >
                                {src.headline}
                              </p>
                              <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "#A5A5A1" }}>
                                {src.excerpt}
                              </p>
                              <div className="mt-1.5 flex items-center gap-4">
                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 kicker ul-hover transition-colors hover:text-foreground"
                                    style={{ color: "#C9C3B7" }}
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    Open source
                                  </a>
                                )}
                                {src.date !== "N/A" && (
                                  <span className="kicker" style={{ opacity: 0.55 }}>{src.date}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
