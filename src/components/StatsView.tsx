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
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
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
  likely_real: "#10b981",
  uncertain: "#f59e0b",
  likely_fake: "#ef4444",
};

const VERDICT_LABELS = {
  likely_real: "Likely Real",
  uncertain: "Uncertain",
  likely_fake: "Likely Fake",
};

export function StatsView({ analyses }: StatsViewProps) {
  if (analyses.length === 0) return null;

  // Calculate stats
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
    (key) => ({
      name: VERDICT_LABELS[key],
      value: verdictCounts[key],
      color: COLORS[key],
    }),
  ).filter((d) => d.value > 0);

  // Confidence distribution
  const confBuckets = [
    { range: "35-50%", count: 0, fill: "#94a3b8" },
    { range: "50-65%", count: 0, fill: "#f59e0b" },
    { range: "65-80%", count: 0, fill: "#3b82f6" },
    { range: "80-95%", count: 0, fill: "#10b981" },
  ];
  for (const a of analyses) {
    if (a.confidence < 50) confBuckets[0].count++;
    else if (a.confidence < 65) confBuckets[1].count++;
    else if (a.confidence < 80) confBuckets[2].count++;
    else confBuckets[3].count++;
  }

  const statCards = [
    {
      label: "Total Analyses",
      value: totalAnalyses,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Avg. Confidence",
      value: `${avgConfidence}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Red Flags Found",
      value: totalRedFlags,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-500/10",
    },
    {
      label: "Green Flags Found",
      value: totalGreenFlags,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {card.label}
              </span>
            </div>
            <span className="text-xl font-bold">{card.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Verdict distribution */}
        {pieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Verdict Distribution
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Confidence distribution */}
        {confBuckets.some((b) => b.count > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Confidence Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={confBuckets}>
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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
