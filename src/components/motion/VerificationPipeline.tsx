import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Brain, Target, Shield, CheckCircle2, Loader2 } from "lucide-react";

const pipelineSteps = [
  { key: "ingest", label: "TEXT PROCESSING", sublabel: "Parsing content structure", icon: FileText },
  { key: "language", label: "NLP ANALYSIS", sublabel: "Pattern recognition", icon: Search },
  { key: "signals", label: "SOURCE CHECK", sublabel: "Credibility signals", icon: Brain },
  { key: "logic", label: "CLAIM ANALYSIS", sublabel: "Logical consistency", icon: Target },
  { key: "verdict", label: "FINAL VERDICT", sublabel: "Generating result", icon: Shield },
];

interface VerificationPipelineProps {
  currentStep: number;
  isComplete?: boolean;
  className?: string;
}

/**
 * Animated verification pipeline shown during analysis.
 * Each step activates sequentially with a connecting line.
 *
 * Usage:
 *   <VerificationPipeline currentStep={2} />
 *   <VerificationPipeline currentStep={5} isComplete />
 */
export function VerificationPipeline({
  currentStep,
  isComplete = false,
  className = "",
}: VerificationPipelineProps) {
  return (
    <div className={`space-y-0 ${className}`}>
      {pipelineSteps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep || isComplete;

        return (
          <div key={step.key} className="flex items-stretch gap-3">
            {/* Vertical line + node */}
            <div className="flex flex-col items-center">
              {/* Node */}
              <motion.div
                initial={false}
                animate={{
                  background: isDone
                    ? "#8FA59615"
                    : isActive
                      ? "#8FA59610"
                      : "#141615",
                  borderColor: isDone
                    ? "#8FA59630"
                    : isActive
                      ? "#8FA59625"
                      : "#292A27",
                }}
                transition={{ duration: 0.4 }}
                className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0 z-10"
                style={{ border: "1px solid" }}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#8FA596" }} />
                  </motion.div>
                ) : isActive ? (
                  <Loader2
                    className="w-3.5 h-3.5 animate-spin"
                    style={{ color: "#8FA596" }}
                  />
                ) : (
                  <step.icon className="w-3.5 h-3.5" style={{ color: "#9A9E9840" }} />
                )}
              </motion.div>

              {/* Connecting line */}
              {i < pipelineSteps.length - 1 && (
                <div className="relative w-px flex-1 min-h-[24px]">
                  <div
                    className="absolute inset-0"
                    style={{ background: "#292A27" }}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: isDone || isActive ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-0 left-0 w-full"
                    style={{ background: "#8FA59650" }}
                  />
                </div>
              )}
            </div>

            {/* Step content */}
            <motion.div
              initial={false}
              animate={{
                opacity: isDone ? 0.6 : isActive ? 1 : 0.25,
                x: isActive ? 4 : 0,
              }}
              transition={{ duration: 0.4 }}
              className="py-1.5 flex-1"
            >
              <span
                className="text-[9px] font-bold tracking-[0.15em] block"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: isActive ? "#8FA596" : isDone ? "#9A9E98" : "#9A9E98",
                }}
              >
                {step.label}
              </span>
              <span
                className="text-[9px] block mt-0.5"
                style={{ color: "#9A9E98" }}
              >
                {step.sublabel}
              </span>

              {/* Active step shimmer */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60px" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-[1px] mt-1.5 overflow-hidden"
                    style={{
                      background: "linear-gradient(90deg, #8FA596, transparent)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Active step pulse indicator */}
              {isActive && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1 h-1 rounded-full" style={{ background: "#8FA596", animation: "blink 1s step-end infinite" }} />
                  <span className="text-[8px] tracking-wider" style={{ color: "#8FA596", opacity: 0.7 }}>Processing...</span>
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
