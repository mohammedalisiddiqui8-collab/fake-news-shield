import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ExpandableClaimProps {
  claimNumber: string;
  claimText: string;
  status: "supported" | "unverified" | "misleading";
  /** Optional real confidence — omitted when no verified value exists. */
  confidence?: number;
  details?: string;
  className?: string;
  /**
   * "claim" (default) renders a factual claim: CLAIM nn + verification status.
   * "signal" renders a language/linguistic/structural observation as
   * "… SIGNAL — DETECTED". Language signals are NEVER presented as factual
   * claims and NEVER as proof that anything is true.
   */
  kind?: "claim" | "signal";
  /** e.g. "LANGUAGE SIGNAL", "LINGUISTIC SIGNAL", "STRUCTURAL SIGNAL". */
  signalLabel?: string;
}

const statusConfig = {
  supported: { icon: CheckCircle2, color: "#8FA58A", label: "SUPPORTED" },
  unverified: { icon: AlertTriangle, color: "#B7A47A", label: "UNVERIFIED" },
  misleading: { icon: XCircle, color: "#B3263E", label: "MISLEADING" },
};

/**
 * Editorial entry for the report — thin rules and whitespace instead of a
 * floating card. Shows label, status, quotation, confidence; tap to expand
 * the supporting detail.
 */
export function ExpandableClaim({
  claimNumber,
  claimText,
  status,
  confidence,
  details,
  className = "",
  kind = "claim",
  signalLabel,
}: ExpandableClaimProps) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[status];

  return (
    <div className={`border-b border-border/70 ${className}`}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full cursor-pointer text-left py-3.5 px-1 flex items-start gap-3 transition-colors hover:bg-[rgba(241,240,234,0.018)]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className="kicker"
              style={{ color: "#F1F0EA" }}
            >
              {kind === "signal"
                ? (signalLabel ?? "Language signal")
                : `Claim ${claimNumber}`}
            </span>
            <span
              className="kicker shrink-0 inline-flex items-center gap-1.5"
              style={{ color: config.color }}
            >
              <config.icon className="w-3 h-3" />
              {kind === "signal" ? "Detected" : config.label}
            </span>
          </div>
          <p
            className="font-quote mt-1.5 text-[12.5px] leading-relaxed"
            style={{ color: "#F1F0EA" }}
          >
            “{claimText}”
          </p>
          {confidence != null && (
            <div className="mt-2 flex items-center gap-2.5">
              <span className="kicker" style={{ opacity: 0.7 }}>Confidence</span>
              <span className="h-[2px] w-20" style={{ background: "#242424" }}>
                <motion.span
                  className="block h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: config.color }}
                />
              </span>
              <span
                className="text-[10.5px] tabular"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: config.color }}
              >
                {confidence}%
              </span>
            </div>
          )}
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "#A6A39B" }} />
        </motion.div>
      </button>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && details && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-4 pt-1 sm:pl-8">
              <p className="text-[11.5px] leading-[1.8] text-muted-foreground">{details}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
