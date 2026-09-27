import { motion } from "framer-motion";
import { AlertTriangle, Info, Eye } from "lucide-react";

export interface FramingSignal {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

const sevConfig: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  high: { color: "#B08479", icon: AlertTriangle },
  medium: { color: "#C9C3B7", icon: Eye },
  low: { color: "#A5A5A1", icon: Info },
};

/**
 * Framing signals as an analytical list — numbered hairline rows with a
 * restrained severity tag. Observations about presentation, never verdicts.
 */
export function FramingSignals({ signals }: { signals: FramingSignal[] }) {
  if (!signals || signals.length === 0) {
    return <p className="text-[11px] text-muted-foreground italic py-2">No framing signals detected.</p>;
  }

  return (
    <div className="border-t border-border">
      {signals.map((signal, i) => {
        const cfg = sevConfig[signal.severity] || sevConfig.low;
        return (
          <motion.div
            key={signal.type + i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="py-3 border-b border-border/70 flex items-start gap-3 sm:gap-4"
          >
            <span className="num-marker shrink-0 mt-1">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                <span className="text-[9px] font-semibold tracking-[0.16em] uppercase" style={{ color: cfg.color }}>
                  {signal.type}
                </span>
                <span
                  className="text-[7.5px] uppercase tracking-[0.18em] px-1.5 py-px border"
                  style={{ color: cfg.color, borderColor: `${cfg.color}55` }}
                >
                  {signal.severity}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "#A5A5A1" }}>
                {signal.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
