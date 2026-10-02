import { motion } from "framer-motion";

const steps = [
  {
    num: 1,
    title: "Text Processing",
    description: "We clean and structure the input text using NLP techniques.",
  },
  {
    num: 2,
    title: "Multi-Layer Analysis",
    description: "We check for linguistic patterns, source credibility, logical consistency and more.",
  },
  {
    num: 3,
    title: "Risk Scoring",
    description: "Our model assigns a credibility score based on multiple factors.",
  },
  {
    num: 4,
    title: "Final Verdict",
    description: "You get a clear, easy-to-understand result with detailed insights.",
  },
];

export function MethodologyView() {
  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <span className="kicker" style={{ color: "#F1F0EA" }}>Our approach</span>
        <span className="h-px flex-1" style={{ background: "#242424" }} />
      </motion.div>

      <h2
        className="mt-8 font-serif-editorial text-[clamp(1.8rem,5vw,2.6rem)] leading-[1.08]"
        style={{ color: "#F1F0EA" }}
      >
        How Veritas Works
      </h2>
      <p className="mt-5 text-[13.5px] leading-[1.75] text-muted-foreground max-w-[52ch]">
        We combine advanced AI with proven fact-checking methodologies to give you reliable results.
      </p>

      {/* Steps — a numbered method, set on a single vertical rule */}
      <div className="mt-14 lg:mt-20 max-w-3xl">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className="relative flex gap-5 sm:gap-8 pb-10 sm:pb-14 last:pb-0"
          >
            {/* The rule continues through every step but the last */}
            {i < steps.length - 1 && (
              <span
                className="absolute left-[13px] top-8 bottom-0 w-px sm:left-[15px]"
                style={{ background: "#242424" }}
                aria-hidden="true"
              />
            )}

            <span className="relative z-10 shrink-0 w-[27px] sm:w-[31px] text-center num-marker pt-[5px]">
              {String(step.num).padStart(2, "0")}
            </span>

            <div className="min-w-0 pt-0.5">
              <h3
                className="font-serif-editorial text-[19px] sm:text-[22px] leading-tight"
                style={{ color: "#F1F0EA" }}
              >
                {step.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-[1.7] text-muted-foreground max-w-[54ch]">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Closing note — set as a line in the margin, not a card */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-14 lg:mt-20 pt-6 border-t border-border font-serif-editorial italic text-[15px] text-muted-foreground max-w-[46ch]"
      >
        &ldquo;Better information leads to better decisions.&rdquo;
      </motion.p>
    </div>
  );
}
