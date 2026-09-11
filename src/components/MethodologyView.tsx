import { motion } from "framer-motion";
import { Search, Brain, BarChart3, Shield } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Text Processing",
    description: "We clean and structure the input text using NLP techniques.",
    icon: Search,
  },
  {
    num: 2,
    title: "Multi-Layer Analysis",
    description: "We check for linguistic patterns, source credibility, logical consistency and more.",
    icon: Brain,
  },
  {
    num: 3,
    title: "Risk Scoring",
    description: "Our model assigns a credibility score based on multiple factors.",
    icon: BarChart3,
  },
  {
    num: 4,
    title: "Final Verdict",
    description: "You get a clear, easy-to-understand result with detailed insights.",
    icon: Shield,
  },
];

export function MethodologyView() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#607568" }}>Our Approach</span>
        <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#0B0D0C" }}>How Veritas Works</h2>
        <p className="mt-2 text-xs max-w-md mx-auto" style={{ color: "#9A9E98" }}>We combine advanced AI with proven fact-checking methodologies to give you reliable results.</p>
      </motion.div>

      {/* Steps */}
      <div className="max-w-lg mx-auto space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex items-start gap-4 rounded border p-4"
            style={{ background: "#F1F2EE", borderColor: "#292A27" }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#607568", color: "#F1F2EE" }}>
              <span className="text-sm font-bold">{step.num}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-0.5" style={{ fontFamily: "'DM Serif Display', serif", color: "#0B0D0C" }}>{step.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#9A9E98" }}>{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded border p-4 text-center"
        style={{ background: "#F1F2EE", borderColor: "#292A27" }}
      >
        <p className="text-xs italic" style={{ fontFamily: "'DM Serif Display', serif", color: "#9A9E98" }}>
          &ldquo;Better information leads to better decisions.&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
