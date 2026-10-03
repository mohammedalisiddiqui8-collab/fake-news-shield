import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Analysis {
  verdict: "likely_real" | "likely_fake" | "uncertain";
  confidence: number;
  createdAt: number;
  redFlags: string[];
  greenFlags: string[];
}

interface StatsViewProps {
  analyses: Analysis[];
}

/* Muted, printed semantics — three quiet tones, never a traffic light. */
const COLORS = {
  likely_real: "var(--v-green)",
  uncertain: "var(--v-brass)",
  likely_fake: "var(--v-crimson)",
};

const VERDICT_LABELS = {
  likely_real: "Likely Credible",
  uncertain: "Uncertain",
  likely_fake: "Likely Misleading",
};

export function StatsView({ analyses }: StatsViewProps) {
  if (analyses.length === 0) return null;

  const totalAnalyses = analyses.length;
  const verdictCounts = { likely_real: 0, uncertain: 0, likely_fake: 0 };

  for (const a of analyses) {
    verdictCounts[a.verdict]++;
  }

  const pct = (n: number) => Math.round((n / totalAnalyses) * 1000) / 10;

  const pieData = (Object.keys(verdictCounts) as Array<keyof typeof verdictCounts>).map(
    (key) => ({ name: VERDICT_LABELS[key], value: verdictCounts[key], color: COLORS[key] }),
  ).filter((d) => d.value > 0);

  // Top warning signs from red flags
  const flagCounts: Record<string, number> = {};
  for (const a of analyses) {
    for (const f of a.redFlags) {
      const cat = f.length > 30 ? f.slice(0, 30) + "..." : f;
      flagCounts[cat] = (flagCounts[cat] || 0) + 1;
    }
  }
  const topFlags = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.length > 25 ? name.slice(0, 25) + "..." : name,
      count,
      pct: Math.round((count / totalAnalyses) * 100),
    }));

  /* One editorial strip: figures set in serif against a kicker, divided by hairlines. */
  const statCells = [
    { label: "Total articles analyzed", value: totalAnalyses, sub: "", color: "var(--v-ink)" },
    { label: "Likely credible", value: verdictCounts.likely_real, sub: `${pct(verdictCounts.likely_real)}%`, color: COLORS.likely_real },
    { label: "Likely misleading", value: verdictCounts.likely_fake, sub: `${pct(verdictCounts.likely_fake)}%`, color: COLORS.likely_fake },
    { label: "Uncertain", value: verdictCounts.uncertain, sub: `${pct(verdictCounts.uncertain)}%`, color: COLORS.uncertain },
  ];

  return (
    <div>
      {/* Figures — typography and rules, never KPI boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-b border-border">
        {statCells.map((cell, i) => (
          <motion.div
            key={cell.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={`py-6 sm:py-7 ${i % 2 === 1 ? "border-l border-border pl-5" : "pr-5"} ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l sm:border-border sm:pl-5" : ""} ${i === 3 ? "sm:border-l sm:border-border sm:pl-5" : ""}`}
          >
            <p
              className="font-serif-editorial text-[32px] sm:text-[38px] leading-none tabular"
              style={{ color: cell.color }}
            >
              {cell.value}
            </p>
            {cell.sub && <p className="kicker mt-2.5">{cell.sub} of archive</p>}
            <p className="kicker mt-2.5" style={{ opacity: 0.65, letterSpacing: "0.16em" }}>{cell.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Distribution + warning signs — two quiet columns on one hairline field */}
      <div className="mt-16 lg:mt-24 grid lg:grid-cols-2 gap-12 lg:gap-16">
        {pieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2.5">
              <h3 className="text-[17px] leading-none">Verdict distribution</h3>
              <span className="kicker" style={{ opacity: 0.55 }}>{totalAnalyses} filed</span>
            </div>
            <div className="mt-7 flex items-center justify-center">
              <ResponsiveContainer width={190} height={190}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={86}
                    dataKey="value"
                    stroke="var(--v-bg)"
                    strokeWidth={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--v-surface)",
                      border: "1px solid var(--v-rule)",
                      borderRadius: "2px",
                      fontSize: "11px",
                      color: "var(--v-ink)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-7">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-3 py-2.5 border-b border-border/70">
                  <span className="w-2 h-2 shrink-0" style={{ background: d.color }} />
                  <span className="flex-1 text-[12.5px]" style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
                    {d.name}
                  </span>
                  <span className="font-mono text-[11px] tabular" style={{ color: d.color }}>{d.value}</span>
                  <span className="kicker tabular w-12 text-right" style={{ opacity: 0.6 }}>
                    {pct(d.value)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {topFlags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2.5">
              <h3 className="text-[17px] leading-none">Top warning signs</h3>
              <span className="kicker" style={{ opacity: 0.55 }}>Most frequent</span>
            </div>
            <div className="mt-2">
              {topFlags.map((flag, i) => (
                <div key={i} className="py-4 border-b border-border/70">
                  <div className="flex items-baseline justify-between gap-4 mb-2.5">
                    <span className="num-marker shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className="flex-1 text-[13.5px] leading-snug"
                      style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
                    >
                      {flag.name}
                    </span>
                    <span className="font-mono text-[10px] tabular shrink-0" style={{ color: COLORS.likely_fake }}>
                      {flag.pct}%
                    </span>
                  </div>
                  <div className="h-[2px] w-full" style={{ background: "var(--v-rule)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${flag.pct}%` }}
                      transition={{ duration: 0.7, delay: 0.3 + i * 0.05 }}
                      className="h-full"
                      style={{ background: COLORS.likely_fake }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
