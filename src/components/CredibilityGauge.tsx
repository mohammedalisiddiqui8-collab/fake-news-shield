import { motion } from "framer-motion";

interface CredibilityGaugeProps {
  confidence: number;
  verdict: "likely_real" | "likely_fake" | "uncertain";
  size?: number;
}

const verdictColors: Record<string, { stroke: string; glow: string; bg: string }> = {
  likely_real: {
    stroke: "#34d399",
    glow: "rgba(52, 211, 153, 0.25)",
    bg: "rgba(52, 211, 153, 0.06)",
  },
  uncertain: {
    stroke: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.25)",
    bg: "rgba(251, 191, 36, 0.06)",
  },
  likely_fake: {
    stroke: "#f87171",
    glow: "rgba(248, 113, 113, 0.25)",
    bg: "rgba(248, 113, 113, 0.06)",
  },
};

export function CredibilityGauge({
  confidence,
  verdict,
  size = 160,
}: CredibilityGaugeProps) {
  const colors = verdictColors[verdict];
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (confidence / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Soft glow */}
      <div
        className="absolute rounded-full blur-xl"
        style={{ width: size * 0.65, height: size * 0.65, background: colors.glow }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative -rotate-90"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/15"
        />

        {/* Progress */}
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
          style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
        />
      </svg>

      {/* Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl font-extrabold tracking-tight text-gradient"
        >
          {confidence}%
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider"
        >
          confidence
        </motion.span>
      </div>
    </div>
  );
}
