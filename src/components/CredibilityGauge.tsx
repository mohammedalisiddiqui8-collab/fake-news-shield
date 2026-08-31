import { motion } from "framer-motion";

interface CredibilityGaugeProps {
  confidence: number;
  verdict: "likely_real" | "likely_fake" | "uncertain";
  size?: number;
}

const verdictColors: Record<string, { stroke: string; glow: string; text: string }> = {
  likely_real: {
    stroke: "#10b981",
    glow: "rgba(16, 185, 129, 0.3)",
    text: "text-emerald-600",
  },
  uncertain: {
    stroke: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.3)",
    text: "text-amber-600",
  },
  likely_fake: {
    stroke: "#ef4444",
    glow: "rgba(239, 68, 68, 0.3)",
    text: "text-red-600",
  },
};

export function CredibilityGauge({
  confidence,
  verdict,
  size = 180,
}: CredibilityGaugeProps) {
  const colors = verdictColors[verdict];
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (confidence / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow behind */}
      <div
        className="absolute rounded-full blur-xl"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: colors.glow,
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />

        {/* Animated progress arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${colors.glow})` }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-3xl font-extrabold tracking-tight"
        >
          {confidence}%
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="text-[11px] text-muted-foreground font-medium"
        >
          confidence
        </motion.span>
      </div>
    </div>
  );
}
