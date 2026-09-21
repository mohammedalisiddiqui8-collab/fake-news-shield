import { motion } from "framer-motion";
import { Clock, CheckCircle2, AlertTriangle, History } from "lucide-react";

export interface FreshnessItem {
  claimId: number;
  claimText: string;
  status: "current" | "recent" | "outdated" | "historical";
  sourceDate: string;
  ageDays: number;
  newerAvailable: boolean;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  current: { label: "CURRENT", icon: CheckCircle2, color: "#D4C4A8", bg: "rgba(212,196,168,0.06)" },
  recent: { label: "RECENT", icon: Clock, color: "#A8A098", bg: "rgba(168,160,152,0.06)" },
  outdated: { label: "OUTDATED", icon: AlertTriangle, color: "#A85A50", bg: "rgba(168,90,80,0.06)" },
  historical: { label: "HISTORICAL", icon: History, color: "#A8A098", bg: "rgba(168,160,152,0.04)" },
};

export function FreshnessIndicator({ freshness }: { freshness: FreshnessItem[] }) {
  if (!freshness || freshness.length === 0) {
    return <p className="text-[10px] text-muted-foreground italic py-2">Freshness data unavailable.</p>;
  }

  return (
    <div className="space-y-1.5">
      {freshness.map((item, i) => {
        const cfg = statusConfig[item.status] || statusConfig.recent;
        const Icon = cfg.icon;
        return (
          <motion.div key={item.claimId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="p-2.5 rounded" style={{ background: cfg.bg, border: "1px solid #1E1E1E" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] tracking-[0.12em] uppercase font-semibold" style={{ color: "#A8A098" }}>
                CLAIM {String(item.claimId).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1">
                <Icon className="w-2.5 h-2.5" style={{ color: cfg.color }} />
                <span className="text-[8px] font-bold tracking-[0.1em] uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            </div>
            <p className="text-[9px] leading-snug line-clamp-1 mb-1" style={{ color: "#F5F0E8" }}>{item.claimText}</p>
            <div className="flex items-center gap-2 text-[8px]" style={{ color: "#A8A098" }}>
              {item.sourceDate !== "NOT AVAILABLE" && <span>Source: {item.sourceDate}</span>}
              {item.newerAvailable && <span style={{ color: "#A8906E" }}>Newer info available</span>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
