import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface MorphingPanelProps {
  /** Collapsed preview content */
  preview: React.ReactNode;
  /** Expanded detail content */
  detail: React.ReactNode;
  /** Label for the expand trigger */
  triggerLabel?: string;
  className?: string;
  accentColor?: string;
}

/**
 * A panel that morphs from a compact preview to an expanded detail view.
 * Smooth height transition with staggered children.
 *
 * Usage:
 *   <MorphingPanel
 *     preview={<span>Article headline</span>}
 *     detail={<p>Detailed analysis of this article...</p>}
 *     triggerLabel="VIEW ANALYSIS"
 *   />
 */
export function MorphingPanel({
  preview,
  detail,
  triggerLabel = "VIEW DETAILS",
  className = "",
  accentColor = "#7F9278",
}: MorphingPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: "#241C15",
        border: "1px solid #46382A",
        borderRadius: "2px",
        borderColor: expanded ? `${accentColor}25` : "#46382A",
      }}
    >
      {/* Preview — always shown */}
      <div className="px-4 py-3">{preview}</div>

      {/* Expand trigger */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full cursor-pointer px-4 py-2 flex items-center gap-1.5 transition-colors"
        style={{
          borderTop: "1px solid #46382A",
          color: accentColor,
          background: "transparent",
        }}
      >
        <span className="text-[9px] font-semibold tracking-[0.15em] uppercase">
          {expanded ? "COLLAPSE" : triggerLabel}
        </span>
        <motion.span
          animate={{ x: expanded ? 0 : 4, rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight className="w-3 h-3" />
        </motion.span>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: 8 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-4 pb-4 pt-2"
              style={{ borderTop: "1px solid #46382A" }}
            >
              {detail}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
