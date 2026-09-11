import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

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

const COLORS = {
  likely_real: "#607568",
  uncertain: "#A58B5B",
  likely_fake: "#A9574D",
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
  let totalRedFlags = 0;
  let totalGreenFlags = 0;

  for (const a of analyses) {
    verdictCounts[a.verdict]++;
    totalRedFlags += a.redFlags.length;
    totalGreenFlags += a.greenFlags.length;
  }

  const crediblePct = Math.round((verdictCounts.likely_real / totalAnalyses) * 1000) / 10;
  const misleadingPct = Math.round((verdictCounts.likely_fake / totalAnalyses) * 1000) / 10;
  const uncertainPct = Math.round((verdictCounts.uncertain / totalAnalyses) * 1000) / 10;

  const pieData = (Object.keys(verdictCounts) as Array<keyof typeof verdictCounts>).map(
    (key) => ({ name: VERDICT_LABELS[key], value: verdictCounts[key], color: COLORS[key] }),
  ).filter((d) => d.value > 0);

  // Top warning signs from red flags
  const flagCounts: Record<string, number> = {};
  for (const a of analyses) {
    for (const f of a.redFlags) {
      // Extract first few words as category
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

  const statCards = [
    { label: "Total Articles Analyzed", value: totalAnalyses, icon: BarChart3, color: "#607568", trend: "+12%", trendUp: true },
    { label: "Likely Credible", value: verdictCounts.likely_real, pct: `${crediblePct}%`, icon: CheckCircle2, color: "#607568", trend: `${crediblePct}%`, trendUp: true },
    { label: "Likely Misleading", value: verdictCounts.likely_fake, pct: `${misleadingPct}%`, icon: AlertTriangle, color: "#A9574D", trend: `${misleadingPct}%`, trendUp: false },
    { label: "Uncertain", value: verdictCounts.uncertain, pct: `${uncertainPct}%`, icon: TrendingUp, color: "#A58B5B", trend: `${uncertainPct}%`, trendUp: false },
  ];

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <div />
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Last 30 Days</span>
          <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5l3 3 3-3" /></svg>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="glass-card rounded-lg p-4"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}10` }}>
                <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
              <span className="text-[10px] text-muted-foreground leading-tight">{card.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: card.color, fontFamily: "'DM Serif Display', serif" }}>{card.value}</span>
              <div className="flex items-center gap-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" style={{ color: card.trendUp ? "#607568" : "#A9574D" }} />
                <span className="text-[9px] font-medium" style={{ color: card.trendUp ? "#607568" : "#A9574D" }}>{card.trend}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="glass-card rounded-lg p-5"
          >
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
              Verdict Distribution
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#FFFCF6",
                      border: "1px solid #D8D2C5",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "#1E2522",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {topFlags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="glass-card rounded-lg p-5"
          >
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
              Top Warning Signs
            </h3>
            <div className="space-y-3">
              {topFlags.map((flag, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-medium truncate mr-2">{flag.name}</span>
                    <span className="text-muted-foreground shrink-0">{flag.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${flag.pct}%` }}
                      transition={{ duration: 0.5, delay: 0.35 + i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: "#A9574D" }}
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
