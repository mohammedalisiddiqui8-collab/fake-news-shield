import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ExpandableClaimProps {
  claimNumber: string;
  claimText: string;
  status: "supported" | "unverified" | "misleading";
  confidence: number;
  details?: string;
  className?: string;
}

const statusConfig = {
  supported: { icon: CheckCircle2, color: "#7F9278", label: "SUPPORTED" },
  unverified: { icon: AlertTriangle, color: "#8A6A45", label: "UNVERIFIED" },
  misleading: { icon: XCircle, color: "#A85C4D", label: "MISLEADING" },
};

/**
 * Expandable claim card for the results page.
 * Shows claim number, text, status badge, confidence — tap to expand details.
 *
 * Usage:
 *   <ExpandableClaim
 *     claimNumber="01"
 *     claimText="Scientists discovered a new species"
 *     status="supported"
 *     confidence={86}
 *     details="Claim is supported by..."
 *   />
 */
export function ExpandableClaim({
  claimNumber,
  claimText,
  status,
  confidence,
  details,
  className = "",
}: ExpandableClaimProps) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: "#241C15",
        border: "1px solid #46382A",
        borderRadius: "2px",
        borderColor: expanded ? `${config.color}33` : undefined,
      }}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full cursor-pointer text-left px-4 py-3 flex items-start gap-3"
        style={{ background: "transparent" }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[8px] font-bold tracking-[0.2em]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A6A45" }}
            >
              CLAIM {claimNumber}
            </span>
            <span
              className="text-[8px] font-bold tracking-[0.1em] px-1.5 py-0.5 flex items-center gap-1"
              style={{
                background: `${config.color}15`,
                color: config.color,
                borderRadius: "1px",
              }}
            >
              <Icon className="w-2.5 h-2.5" />
              {config.label}
            </span>
          </div>
          <p
            className="text-[11px] leading-relaxed italic"
            style={{ color: "#EDE6D9" }}
          >
            "{claimText}"
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-[9px] font-mono"
              style={{ color: "#B39977" }}
            >
              CONFIDENCE
            </span>
            <div
              className="h-[2px] flex-1 max-w-[80px] rounded-full overflow-hidden"
              style={{ background: "#292A27" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: config.color, opacity: 0.7 }}
              />
            </div>
            <span
              className="text-[10px] font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: config.color }}
            >
              {confidence}%
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "#B39977" }} />
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
            <div
              className="px-4 pb-4 pt-1"
              style={{ borderTop: "1px solid #46382A" }}
            >
              <p className="text-[10px] leading-[1.7]" style={{ color: "#B39977" }}>
                {details}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
