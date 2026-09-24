import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, HelpCircle, ExternalLink, ChevronDown } from "lucide-react";
import { claimSourceRefs } from "@/lib/investigationStats";

export interface CrossCheckSource {
  name: string;
  headline: string;
  date: string;
  excerpt: string;
  relationship: "supports" | "contradicts" | "partial" | "insufficient";
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
  supports: { label: "SUPPORTS", icon: CheckCircle2, color: "#D4C4A8", bg: "rgba(212,196,168,0.08)" },
  contradicts: { label: "CONTRADICTS", icon: AlertTriangle, color: "#A85A50", bg: "rgba(168,90,80,0.08)" },
  partial: { label: "PARTIAL", icon: HelpCircle, color: "#A8A098", bg: "rgba(168,160,152,0.06)" },
  insufficient: { label: "INSUFFICIENT", icon: HelpCircle, color: "#A8A098", bg: "rgba(168,160,152,0.06)" },
};

export function SourceCrossCheck({ crossCheck }: { crossCheck: CrossCheckClaim[] }) {
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);

  if (!crossCheck || crossCheck.length === 0) {
    return <p className="text-[10px] text-muted-foreground italic py-2">No cross-check data available.</p>;
  }

  return (
    <div className="space-y-2">
      {crossCheck.map((claim, ci) => {
        const isOpen = expandedClaim === claim.claimId;
        const supports = claim.sources.filter(s => s.relationship === "supports").length;
        const contradicts = claim.sources.filter(s => s.relationship === "contradicts").length;
        // Same rule as the aggregate: only real retrieved sources count —
        // sentinel notices are not references. Sum over claims == aggregate.
        const refs = claimSourceRefs(claim.sources);
        return (
          <motion.div key={claim.claimId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: ci * 0.05 }}>
            <button type="button"
              className="w-full text-left p-3 rounded cursor-pointer transition-all duration-200 hover:border-[#A8906E]/15"
              style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}
              onClick={() => setExpandedClaim(isOpen ? null : claim.claimId)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] tracking-[0.15em] uppercase font-semibold block mb-1" style={{ color: "#A8A098" }}>
                    CLAIM {String(claim.claimId).padStart(2, "0")}
                  </span>
                  <p className="text-[11px] leading-snug line-clamp-2" style={{ color: "#F5F0E8" }}>{claim.claimText}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {supports > 0 && <span className="text-[8px] font-semibold" style={{ color: "#D4C4A8" }}>{supports} SUPPORTS</span>}
                    {contradicts > 0 && <span className="text-[8px] font-semibold" style={{ color: "#A85A50" }}>{contradicts} CONTRADICTS</span>}
                    <span className="text-[8px]" style={{ color: "#A8A098" }}>{refs > 0 ? `${refs} claim-source reference(s)` : claim.sources.length > 0 ? "0 references — search notice, no source retrieved" : "0 references"}</span>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-1">
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: "#A8A098" }} />
                </motion.div>
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="px-3 pb-3 pt-2 space-y-1.5">
                    {claim.sources.map((src, si) => {
                      const rc = relConfig[src.relationship] || relConfig.insufficient;
                      const Icon = rc.icon;
                      return (
                        <div key={si} className="p-2 rounded flex items-start gap-2" style={{ background: rc.bg, border: "1px solid #1E1E1E" }}>
                          <Icon className="w-3 h-3 shrink-0 mt-0.5" style={{ color: rc.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[9px] font-semibold" style={{ color: rc.color }}>{rc.label}</span>
                              <span className="text-[8px]" style={{ color: "#A8A098" }}>{src.name}</span>
                              {domainOf(src.url) && domainOf(src.url) !== src.name && (
                                <span className="text-[8px]" style={{ color: "#A8A098", opacity: 0.6 }}>· {domainOf(src.url)}</span>
                              )}
                            </div>
                            <p className="text-[9px] font-semibold leading-snug mb-0.5" style={{ color: "#F5F0E8" }}>{src.headline}</p>
                            <p className="text-[9px] leading-relaxed" style={{ color: "#A8A098" }}>{src.excerpt}</p>
                            {src.url ? (
                              <a href={src.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-[8px] hover:underline" style={{ color: "#A8906E" }}>
                                <ExternalLink className="w-2.5 h-2.5" />Open retrieved source
                              </a>
                            ) : null}
                            {src.date !== "N/A" && <span className="text-[8px] mt-0.5 block" style={{ color: "#A8A098", opacity: 0.6 }}>{src.date}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
