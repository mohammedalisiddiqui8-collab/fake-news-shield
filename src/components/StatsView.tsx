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
  likely_real: "#174A45",
  uncertain: "#B8873A",
  likely_fake: "#B34A3C",
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
  let totalConfidence = 0;
  let totalRedFlags = 0;
  let totalGreenFlags = 0;

  for (const a of analyses) {
    verdictCounts[a.verdict]++;
    totalConfidence += a.confidence;
    totalRedFlags += a.redFlags.length;
    totalGreenFlags += a.greenFlags.length;
  }

  const avgConfidence = Math.round(totalConfidence / totalAnalyses);

  const pieData = (Object.keys(verdictCounts) as Array<keyof typeof verdictCounts>).map(
    (key) => ({ name: VERDICT_LABELS[key], value: verdictCounts[key], color: COLORS[key] }),
  ).filter((d) => d.value > 0);

  const confBuckets = [
    { range: "35-50%", count: 0, fill: "#6B7268" },
    { range: "50-65%", count: 0, fill: "#B8873A" },
    { range: "65-80%", count: 0, fill: "#356B63" },
    { range: "80-95%", count: 0, fill: "#174A45" },
  ];
  for (const a of analyses) {
    if (a.confidence < 50) confBuckets[0].count++;
    else if (a.confidence < 65) confBuckets[1].count++;
    else if (a.confidence < 80) confBuckets[2].count++;
    else confBuckets[3].count++;
  }

  const statCards = [
    { label: "Total Analyzed", value: totalAnalyses, icon: BarChart3, color: "text-primary", bg: "bg-primary/8" },
    { label: "Avg. Confidence", value: `${avgConfidence}%`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/8" },
    { label: "Red Flags", value: totalRedFlags, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/8" },
    { label: "Green Flags", value: totalGreenFlags, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/8" },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="glass-card rounded-lg p-3.5"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-6 h-6 rounded ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-3 h-3 ${card.color}`} />
              </div>
              <span className="text-[10px] text-muted-foreground">{card.label}</span>
            </div>
            <span className="text-lg font-bold" style={{ color: card.color === "text-primary" ? "#174A45" : card.color === "text-accent" ? "#B8873A" : "#B34A3C" }}>{card.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="flex flex-wrap justify-center gap-2.5 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {confBuckets.some((b) => b.count > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="glass-card rounded-lg p-5"
          >
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
              Confidence Distribution
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={confBuckets}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#6B7268" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7268" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFCF6",
                    border: "1px solid #D8D2C5",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#1E2522",
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {confBuckets.map((entry) => (
                    <Cell key={entry.range} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
