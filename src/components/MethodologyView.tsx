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
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Our Approach</span>
        <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>How Veritas Works</h2>
        <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">We combine advanced AI with proven fact-checking methodologies to give you reliable results.</p>
      </motion.div>

      {/* Steps + Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#174A45", color: "#FFFCF6" }}>
                <span className="text-xs font-bold">{step.num}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-0.5" style={{ fontFamily: "'DM Serif Display', serif" }}>{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Landscape illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-xl overflow-hidden border border-border"
          style={{ background: "linear-gradient(180deg, #c8c0b0 0%, #b8b0a0 50%, #a8a090 100%)", height: 240 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 500 240" preserveAspectRatio="xMidYMid slice">
            <rect width="500" height="240" fill="url(#mSky)" />
            <defs>
              <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4cdc0" />
                <stop offset="100%" stopColor="#b8b0a0" />
              </linearGradient>
            </defs>
            {/* Mountains */}
            <path d="M0 140 L80 70 L160 100 L240 50 L320 90 L400 60 L500 110 L500 240 L0 240Z" fill="#6b6358" opacity="0.5" />
            <path d="M0 170 L60 110 L140 140 L220 90 L300 130 L380 100 L500 140 L500 240 L0 240Z" fill="#4a4238" opacity="0.75" />
            <path d="M0 190 L100 155 L200 175 L300 150 L400 170 L500 160 L500 240 L0 240Z" fill="#3a3228" />
            {/* Trees */}
            {[80, 180, 280, 380].map((x, i) => (
              <g key={i}>
                <rect x={x - 1.5} y={155 + (i % 2) * 10} width="3" height="16" fill="#2a2420" />
                <polygon points={`${x - 7},${160 + (i % 2) * 10} ${x},${147 + (i % 2) * 10} ${x + 7},${160 + (i % 2) * 10}`} fill="#4a4840" />
              </g>
            ))}
            {/* Fog */}
            <rect y="200" width="500" height="40" fill="url(#mFog)" />
            <defs>
              <linearGradient id="mFog" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(180,172,160,0)" />
                <stop offset="100%" stopColor="rgba(180,172,160,0.6)" />
              </linearGradient>
            </defs>
            {/* Magnifying glass */}
            <circle cx="350" cy="80" r="40" fill="none" stroke="#174A45" strokeWidth="3" opacity="0.6" />
            <line x1="378" y1="108" x2="410" y2="140" stroke="#174A45" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
            <circle cx="350" cy="80" r="35" fill="rgba(23,74,69,0.04)" />
          </svg>
        </motion.div>
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-lg p-4 text-center"
      >
        <p className="text-xs italic text-muted-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
          &ldquo;Better information leads to better decisions.&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
