import { motion } from "framer-motion";

export interface FreshnessItem {
  claimId: number;
  claimText: string;
  status: "current" | "recent" | "outdated" | "historical" | "unknown";
  sourceDate: string;
  ageDays: number;
  newerAvailable: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  current: { label: "CURRENT", color: "#8FA58A" },
  recent: { label: "RECENT", color: "#A6A39B" },
  outdated: { label: "STALE", color: "#B3263E" },
  historical: { label: "HISTORICAL", color: "#A6A39B" },
  unknown: { label: "DATE NOT FOUND", color: "#A6A39B" },
};

/**
 * Information freshness as editorial rows — one claim per hairline entry with
 * an immediately readable status label. Status colours carry the meaning.
 */
export function FreshnessIndicator({ freshness }: { freshness: FreshnessItem[] }) {
  if (!freshness || freshness.length === 0) {
    return <p className="text-[11px] text-muted-foreground italic py-2">Freshness data unavailable.</p>;
  }

  return (
    <div className="border-t border-border">
      {freshness.map((item, i) => {
        const cfg = statusConfig[item.status] || statusConfig.recent;
        return (
          <motion.div
            key={item.claimId}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="py-3 border-b border-border/70 flex items-start gap-3 sm:gap-4"
          >
            <span className="num-marker shrink-0 mt-1">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="kicker" style={{ opacity: 0.65 }}>
                  Claim {String(item.claimId).padStart(2, "0")}
                </span>
                <span
                  className="shrink-0 text-[8.5px] font-semibold tracking-[0.16em]"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
              <p
                className="mt-1 text-[12.5px] leading-snug"
                style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#F1F0EA" }}
              >
                {item.claimText}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                {item.sourceDate !== "NOT AVAILABLE" && (
                  <span className="kicker" style={{ opacity: 0.6 }}>Source: {item.sourceDate}</span>
                )}
                {item.newerAvailable && (
                  <span className="kicker" style={{ color: "#B7A47A" }}>Newer information available</span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
