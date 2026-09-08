import { motion, useInView } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect } from "react";

/* ─── Animated Tagline ─── */
const taglines = [
  "Truth over noise.",
  "Clarity over chaos.",
  "Facts over fiction.",
  "Evidence over opinion.",
  "Insight over impulse.",
];

function AnimatedTagline() {
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const currentPhrase = taglines[index];

  useEffect(() => {
    if (!isDeleting) {
      if (displayed.length < currentPhrase.length) {
        const timer = setTimeout(() => setDisplayed(currentPhrase.slice(0, displayed.length + 1)), 50);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setIsDeleting(true), 2200);
        return () => clearTimeout(timer);
      }
    } else {
      if (displayed.length > 0) {
        const timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % taglines.length);
      }
    }
  }, [displayed, isDeleting, currentPhrase, index]);

  return (
    <span style={{ fontFamily: "'DM Serif Display', serif" }}>
      {displayed}
      <span className="inline-block w-[2px] h-[0.8em] ml-0.5 align-middle animate-pulse" style={{ background: "#174A45" }} />
    </span>
  );
}

/* ─── Cityscape Photo (grayscale press photo) ─── */
function CityscapePhoto() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      {/* Sky */}
      <rect width="400" height="220" fill="#9a9590" />
      <rect y="0" width="400" height="80" fill="url(#csSky)" />
      <defs>
        <linearGradient id="csSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0a898" />
          <stop offset="100%" stopColor="#9a9590" />
        </linearGradient>
      </defs>
      {/* Clouds */}
      <ellipse cx="80" cy="30" rx="40" ry="12" fill="rgba(200,195,185,0.5)" />
      <ellipse cx="300" cy="45" rx="35" ry="10" fill="rgba(200,195,185,0.4)" />
      {/* Far buildings */}
      <rect x="20" y="80" width="35" height="100" fill="#7a7570" />
      <rect x="65" y="60" width="30" height="120" fill="#6a6560" />
      <rect x="105" y="90" width="25" height="90" fill="#8a8580" />
      {/* Main tall building */}
      <rect x="145" y="30" width="50" height="150" fill="#5a5550" />
      {/* Windows on main building */}
      {[0,1,2,3,4,5,6,7].map(row => [0,1,2].map(col => (
        <rect key={`w1-${row}-${col}`} x={152 + col * 15} y={40 + row * 17} width="8" height="10" fill={(row + col) % 3 === 0 ? "#b8b0a0" : "#4a4540"} rx="0.5" />
      )))}
      {/* Spire */}
      <polygon points="170,30 175,5 180,30" fill="#4a4540" />
      {/* Office building */}
      <rect x="210" y="55" width="45" height="125" fill="#6a6560" />
      {[0,1,2,3,4,5,6].map(row => [0,1,2].map(col => (
        <rect key={`w2-${row}-${col}`} x={216 + col * 14} y={65 + row * 16} width="7" height="9" fill={row % 2 === 0 ? "#a8a090" : "#5a5550"} rx="0.5" />
      )))}
      {/* Domed building */}
      <rect x="270" y="85" width="40" height="95" fill="#7a7570" />
      <ellipse cx="290" cy="85" rx="20" ry="12" fill="#7a7570" />
      {/* Church with steeple */}
      <rect x="325" y="70" width="30" height="110" fill="#6a6560" />
      <polygon points="340,70 340,45 355,70" fill="#5a5550" />
      {/* Cross */}
      <line x1="340" y1="40" x2="340" y2="50" stroke="#4a4540" strokeWidth="2" />
      <line x1="336" y1="43" x2="344" y2="43" stroke="#4a4540" strokeWidth="2" />
      {/* Arched windows */}
      {[0,1,2].map(i => (
        <ellipse key={`aw-${i}`} cx={335 + i * 8} cy={90} rx="3" ry="5" fill="#8a8580" />
      ))}
      {/* Foreground building */}
      <rect x="365" y="100" width="35" height="80" fill="#5a5550" />
      {[0,1,2,3].map(row => [0,1].map(col => (
        <rect key={`w3-${row}-${col}`} x={370 + col * 14} y={110 + row * 17} width="7" height="9" fill={row % 2 === col % 2 ? "#a8a090" : "#4a4540"} rx="0.5" />
      )))}
      {/* Trees */}
      {[50, 130, 260, 350].map((x, i) => (
        <g key={`tree-${i}`}>
          <rect x={x - 1.5} y={165 + (i % 2) * 5} width="3" height="15" fill="#3a3530" />
          <ellipse cx={x} cy={160 + (i % 2) * 5} rx="10" ry="12" fill="#4a5040" />
          <ellipse cx={x - 3} cy={158 + (i % 2) * 5} rx="7" ry="9" fill="#5a6050" />
        </g>
      ))}
      {/* Road */}
      <rect y="185" width="400" height="35" fill="#6a6560" />
      {/* Lane markings */}
      {[20, 60, 100, 140, 180, 220, 260, 300, 340].map((x, i) => (
        <rect key={`lane-${i}`} x={x} y="198" width="20" height="2" fill="#8a8580" rx="1" />
      ))}
      {/* Car 1 */}
      <rect x="60" y="180" width="28" height="10" fill="#4a4540" rx="2" />
      <rect x="65" y="175" width="18" height="8" fill="#5a5550" rx="1" />
      <circle cx="67" cy="192" r="3" fill="#3a3530" />
      <circle cx="83" cy="192" r="3" fill="#3a3530" />
      {/* Car 2 */}
      <rect x="280" y="182" width="25" height="9" fill="#5a5550" rx="2" />
      <rect x="284" y="177" width="16" height="7" fill="#6a6560" rx="1" />
      <circle cx="287" cy="193" r="2.5" fill="#3a3530" />
      <circle cx="300" cy="193" r="2.5" fill="#3a3530" />
      {/* Street lights */}
      {[100, 200, 310].map((x, i) => (
        <g key={`light-${i}`}>
          <rect x={x} y="170" width="1.5" height="20" fill="#4a4540" />
          <ellipse cx={x + 2} cy="169" rx="4" ry="2" fill="#4a4540" />
        </g>
      ))}
      {/* Haze overlay */}
      <rect y="150" width="400" height="70" fill="url(#csHaze)" />
      <defs>
        <linearGradient id="csHaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(154,149,144,0)" />
          <stop offset="100%" stopColor="rgba(154,149,144,0.4)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Full Newspaper Visual ─── */
function NewspaperVisual() {
  return (
    <div className="relative w-full">
      {/* Back newspaper (peeking behind) */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded border overflow-hidden mx-3"
        style={{ background: "#FFFCF6", borderColor: "#D8D2C5", marginBottom: -60, paddingBottom: 16 }}
      >
        <div className="px-4 pt-2 pb-1 border-b" style={{ borderColor: "#D8D2C5" }}>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: "#6B7268" }}>The Daily Chronicle</span>
            <span className="text-[6px]" style={{ color: "#6B7268" }}>Est. 1847</span>
          </div>
        </div>
        <div className="px-4 py-2 space-y-1">
          {[90, 75, 85, 60, 80].map((w, i) => (
            <div key={i} className="h-[2px] rounded" style={{ width: `${w}%`, background: "#E8E3D8" }} />
          ))}
        </div>
      </motion.div>

      {/* Main newspaper */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="rounded border overflow-hidden relative z-10"
        style={{ background: "#FFFCF6", borderColor: "#D8D2C5", boxShadow: "0 4px 20px rgba(30,37,34,0.08)" }}
      >
        {/* Masthead */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] uppercase tracking-[0.15em]" style={{ color: "#6B7268" }}>Vol. CXII — No. 34,891</span>
            <span className="text-[8px] uppercase tracking-[0.1em]" style={{ color: "#6B7268" }}>Monday, Sep 8, 2026</span>
          </div>
          <div className="text-center py-2">
            <h2 className="text-3xl sm:text-4xl tracking-wide" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522", fontWeight: 400 }}>NEWS</h2>
          </div>
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: "#1E2522" }} />
            <span className="text-[8px] uppercase tracking-[0.3em] font-medium" style={{ color: "#6B7268" }}>Truth Matters</span>
            <div className="flex-1 h-px" style={{ background: "#1E2522" }} />
          </div>
        </div>

        {/* Article headline */}
        <div className="px-5 pt-3 pb-2">
          <h3 className="text-lg sm:text-xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
            Scientists Confirm New Species Discovered in Deep Ocean Expedition
          </h3>
        </div>

        {/* Cityscape photo */}
        <div className="mx-5 rounded overflow-hidden" style={{ height: 180 }}>
          <CityscapePhoto />
        </div>
        <p className="px-5 py-1.5 text-[8px] italic" style={{ color: "#6B7268" }}>
          Downtown financial district — Aerial survey, September 2025
        </p>

        {/* Two-column article text */}
        <div className="px-5 pb-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              {[95, 88, 92, 78, 85, 90, 72, 88, 95, 80].map((w, i) => (
                <div key={i} className="h-[2px] rounded" style={{ width: `${w}%`, background: "#E8E3D8" }} />
              ))}
            </div>
            <div className="space-y-1">
              {[85, 92, 78, 90, 82, 88, 75, 92, 85].map((w, i) => (
                <div key={i} className="h-[2px] rounded" style={{ width: `${w}%`, background: "#E8E3D8" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t flex items-center justify-between" style={{ borderColor: "#D8D2C5" }}>
          <span className="text-[7px] uppercase tracking-wider" style={{ color: "#6B7268" }}>Page A1</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: "#174A4510" }}>
            <CheckCircle2 className="w-2.5 h-2.5" style={{ color: "#174A45" }} />
            <span className="text-[7px] font-semibold uppercase tracking-wider" style={{ color: "#174A45" }}>Verified by Veritas</span>
          </div>
        </div>
      </motion.div>

      {/* Action cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="flex justify-center gap-2 mt-4 relative z-10"
      >
        {["VERIFY", "ANALYZE", "STAY INFORMED"].map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
            className="rounded border px-3 py-1.5 flex items-center gap-1.5"
            style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174A45" }} />
            <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: "#174A45" }}>{text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Score cards */}
      <div className="grid grid-cols-2 gap-3 mt-3 relative z-10">
        {/* Credibility card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="rounded border p-3"
          style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3 h-3" style={{ color: "#174A45" }} />
            <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: "#174A45" }}>Credibility</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold" style={{ color: "#174A45", fontFamily: "'DM Serif Display', serif" }}>92%</span>
            <span className="text-[9px]" style={{ color: "#6B7268" }}>Likely Credible</span>
          </div>
          <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: "#E8E3D8" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "92%" }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="h-full rounded-full"
              style={{ background: "#174A45" }}
            />
          </div>
        </motion.div>

        {/* Red flags card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="rounded border p-3"
          style={{ background: "#FFFCF6", borderColor: "#B34A3C30" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3 h-3" style={{ color: "#B34A3C" }} />
            <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: "#B34A3C" }}>3 Red Flags</span>
          </div>
          <p className="text-[9px] leading-relaxed" style={{ color: "#6B7268" }}>
            Sensationalism, anonymous sources
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Data ─── */
const steps = [
  { step: "01", title: "Ingest", description: "Paste any news article, post, or text content for verification.", icon: Search },
  { step: "02", title: "Analyze", description: "Our NLP engine scans 70+ patterns across 21 categories of misinformation signals.", icon: Brain },
  { step: "03", title: "Verdict", description: "Clear verdict with confidence score, highlighted keywords, and detailed breakdown.", icon: Shield },
];

const features = [
  { icon: Brain, title: "NLP Engine", description: "70+ weighted regex patterns across 21 categories for precision detection." },
  { icon: Search, title: "Content Inspection", description: "Scrutinises tone, sourcing, statistics, and structure against known misinformation patterns." },
  { icon: BarChart3, title: "Visual Breakdown", description: "Charts showing exactly how each category contributed to the final verdict." },
  { icon: Eye, title: "Transparent AI", description: "No black box. Every flag is explainable with exact triggered keywords." },
  { icon: Zap, title: "Real-Time", description: "Paste any article and get a verdict in under 1 second. No API keys needed." },
  { icon: Globe, title: "Universal", description: "News articles, social media posts, WhatsApp forwards, blog entries." },
];

const verdictExamples = [
  { verdict: "likely_real" as const, label: "Likely Credible", icon: CheckCircle2, color: "#174A45", confidence: 92, sample: "Named officials, cited statistics, balanced perspectives from multiple sources." },
  { verdict: "uncertain" as const, label: "Uncertain", icon: AlertTriangle, color: "#B8873A", confidence: 54, sample: "Mixes verified facts with unverified claims from unnamed sources." },
  { verdict: "likely_fake" as const, label: "Likely Misleading", icon: XCircle, color: "#B34A3C", confidence: 87, sample: "Sensational headline, anonymous 'experts', unverifiable statistics." },
];

const references = [
  "MIT Media Lab",
  "Stanford Internet Observatory",
  "Reuters Institute",
  "LIAR Dataset (Wang, 2017)",
];

/* ─── Section wrapper ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.section>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ─── Navigation — Dark Green Bar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "#174A45" }}>
        <div className="mx-auto max-w-6xl px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5" style={{ color: "#FFFCF6" }} />
            <span className="text-sm font-bold tracking-wide uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#FFFCF6" }}>Veritas</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>Home</Button>
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>Analyze</Button>
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>History</Button>
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>Statistics</Button>
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>Methodology</Button>
            <div className="w-px h-4 mx-1" style={{ background: "rgba(255,252,246,0.2)" }} />
            <Button className="cursor-pointer text-xs h-8 px-4 rounded" style={{ background: "#FFFCF6", color: "#174A45" }} onClick={() => navigate("/dashboard")}>
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-12 px-5 paper-texture">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Editorial text */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: "#174A45" }}>Fake News Detection</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-1"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Veritas</motion.h1>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-6 min-h-[1.3em]"
                style={{ color: "#1E2522" }}>
                <AnimatedTagline />
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm sm:text-base max-w-md leading-relaxed mb-8" style={{ color: "#6B7268" }}>
                Veritas detects misinformation using NLP pattern analysis, source credibility scoring, and logical consistency evaluation. Paste any article and get an evidence-backed verdict in seconds.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }} className="flex flex-col sm:flex-row items-start gap-3">
                <Button size="lg" className="cursor-pointer gap-2 px-7 h-11 text-sm border-0 rounded" style={{ background: "#174A45", color: "#FFFCF6" }} onClick={() => navigate("/dashboard")}>
                  Start Analyzing <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="cursor-pointer gap-2 px-7 h-11 text-sm rounded border" style={{ borderColor: "#D8D2C5", color: "#1E2522" }} onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  Learn More
                </Button>
              </motion.div>
              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.75 }} className="mt-10 flex items-center gap-6">
                {[{ value: "Real-time", label: "Analysis" }, { value: "95%+", label: "Accuracy Rate" }, { value: "70+", label: "Patterns Detected" }].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174A45" }} />
                    <div>
                      <span className="text-xs font-semibold block leading-tight" style={{ color: "#1E2522" }}>{s.value}</span>
                      <span className="text-[10px]" style={{ color: "#6B7268" }}>{s.label}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Newspaper with cityscape */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <NewspaperVisual />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

      {/* ─── Verdict Examples ─── */}
      <Section className="py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#174A45" }}>Detection Results</span>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>What You'll Get</h2>
            <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "#6B7268" }}>Every analysis delivers a clear, evidence-backed verdict.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {verdictExamples.map((v, i) => (
              <motion.div key={v.verdict} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="rounded border p-5 relative overflow-hidden group hover:shadow-md transition-shadow duration-300" style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: v.color }} />
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `${v.color}10` }}>
                      <v.icon className="w-4 h-4" style={{ color: v.color }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: v.color, fontFamily: "'DM Serif Display', serif" }}>{v.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-bold" style={{ color: v.color }}>{v.confidence}%</span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "#6B7268" }}>Confidence</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#6B7268" }}>{v.sample}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── How It Works ─── */}
      <Section className="py-20 px-5" id="how-it-works">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#174A45" }}>Our Approach</span>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>How Veritas Works</h2>
            <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "#6B7268" }}>We combine advanced NLP with proven fact-checking methodologies to give you reliable results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div key={s.step} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="rounded border p-6 group hover:shadow-md transition-shadow duration-300" style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "#174A4510" }}>
                    <s.icon className="w-5 h-5" style={{ color: "#174A45" }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#174A45", opacity: 0.5 }}>Step {s.step}</span>
                  <h3 className="mt-1 text-lg font-semibold" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "#6B7268" }}>{s.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

      {/* ─── Features ─── */}
      <Section className="py-20 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#174A45" }}>Capabilities</span>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Built for Media Literacy</h2>
            <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "#6B7268" }}>A comprehensive toolkit for identifying misinformation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="rounded border p-5 group hover:shadow-md transition-shadow duration-300" style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}>
                  <div className="w-9 h-9 rounded flex items-center justify-center mb-3" style={{ background: "#174A4510" }}>
                    <f.icon className="w-4 h-4" style={{ color: "#174A45" }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#1E2522" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#6B7268" }}>{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Academic References ─── */}
      <Section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="rounded border p-8 sm:p-10 text-center relative overflow-hidden" style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "#174A45", opacity: 0.15 }} />
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-5" style={{ background: "#174A4510" }}>
              <FileCheck className="w-5 h-5" style={{ color: "#174A45" }} />
            </div>
            <h2 className="text-xl sm:text-2xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Academically Grounded</h2>
            <p className="text-sm max-w-lg mx-auto mb-7 leading-relaxed" style={{ color: "#6B7268" }}>Detection heuristics informed by research from leading institutions in misinformation detection.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {references.map((ref) => (
                <span key={ref} className="text-xs px-3 py-1.5 rounded" style={{ background: "#EDE8DE", color: "#6B7268", border: "1px solid #D8D2C5" }}>{ref}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[{ icon: Users, label: "Named Sources", desc: "Credibility tracking" }, { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" }, { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" }, { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" }].map((item, i) => (
                <motion.div key={item.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <div className="rounded-lg p-3" style={{ background: "#EDE8DE" }}>
                    <item.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#174A45" }} />
                    <span className="text-[11px] font-semibold block" style={{ color: "#1E2522" }}>{item.label}</span>
                    <span className="text-[9px]" style={{ color: "#6B7268" }}>{item.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="py-20 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded border px-8 py-14 sm:px-14 relative overflow-hidden" style={{ background: "#174A45", borderColor: "#174A45" }}>
            <Shield className="w-8 h-8 mx-auto mb-5" style={{ color: "#FFFCF6" }} />
            <h2 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#FFFCF6" }}>Ready to Fact-Check?</h2>
            <p className="mt-3 text-sm max-w-sm mx-auto" style={{ color: "rgba(255,252,246,0.7)" }}>Start analyzing articles with our detection engine. No sign-up required.</p>
            <Button size="lg" className="cursor-pointer mt-7 gap-2 px-8 h-11 text-sm border-0 rounded" style={{ background: "#FFFCF6", color: "#174A45" }} onClick={() => navigate("/dashboard")}>
              Launch Veritas <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="py-6 px-5 border-t" style={{ borderColor: "#D8D2C5" }}>
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: "#174A45" }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Veritas</span>
          </div>
          <p className="text-[10px]" style={{ color: "#6B7268" }}>BSc Data Science Third Year Project — NLP-Based Misinformation Detection</p>
        </div>
      </footer>
    </div>
  );
}
