import { motion } from "framer-motion";
import { AlertTriangle, Info, Eye } from "lucide-react";

export interface FramingSignal {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

const sevConfig: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  high: { color: "#A85A50", bg: "rgba(168,90,80,0.06)", icon: AlertTriangle },
  medium: { color: "#A8906E", bg: "rgba(168,144,110,0.06)", icon: Eye },
  low: { color: "#A8A098", bg: "rgba(168,160,152,0.04)", icon: Info },
};

export function FramingSignals({ signals }: { signals: FramingSignal[] }) {
  if (!signals || signals.length === 0) {
    return <p className="text-[10px] text-muted-foreground italic py-2">No framing signals detected.</p>;
  }

  return (
    <div className="space-y-1.5">
      {signals.map((signal, i) => {
        const cfg = sevConfig[signal.severity] || sevConfig.low;
        const Icon = cfg.icon;
        return (
          <motion.div key={signal.type + i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="flex items-start gap-2.5 p-2.5 rounded" style={{ background: cfg.bg, border: "1px solid #1E1E1E" }}>
            <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: cfg.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: cfg.color }}>{signal.type}</span>
                <span className="text-[7px] px-1 py-0 rounded uppercase tracking-wider"
                  style={{ color: cfg.color, background: cfg.bg, border: "1px solid #1E1E1E" }}>{signal.severity}</span>
              </div>
              <p className="text-[9px] leading-relaxed" style={{ color: "#A8A098" }}>{signal.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
