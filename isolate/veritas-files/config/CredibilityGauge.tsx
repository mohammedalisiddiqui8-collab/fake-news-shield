import { motion } from "framer-motion";

interface CredibilityGaugeProps {
  confidence: number;
  verdict: "likely_real" | "likely_fake" | "uncertain";
  size?: number;
}

const verdictColors: Record<string, { stroke: string; track: string }> = {
  likely_real: {
    stroke: "#174A45",
    track: "#E8E3D8",
  },
  uncertain: {
    stroke: "#B8873A",
    track: "#E8E3D8",
  },
  likely_fake: {
    stroke: "#B34A3C",
    track: "#E8E3D8",
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
          stroke={colors.track}
          strokeWidth={strokeWidth}
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
        />
      </svg>

      {/* Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl font-bold tracking-tight"
          style={{ color: colors.stroke, fontFamily: "'DM Serif Display', serif" }}
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
