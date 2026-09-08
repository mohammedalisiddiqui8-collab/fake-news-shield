import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users,
  ChevronRight, BookOpen, Newspaper,
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
      <span className="inline-block w-[2px] h-[0.8em] bg-primary ml-0.5 align-middle animate-pulse" />
    </span>
  );
}

/* ─── Editorial Newspaper Illustration ─── */
function NewspaperVisual() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back newspaper peeking */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="bg-[#f0ede4] border border-[#d8d2c5] rounded-sm shadow-sm overflow-hidden ml-6 mr-4 mb-[-60px] relative z-[1]"
      >
        <div className="p-3">
          <div className="border-b border-[#bfb8a8] pb-1.5 mb-1.5">
            <p className="text-[5px] uppercase tracking-[0.25em] text-[#8a8478] text-center font-semibold">The Daily Chronicle</p>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-[#d8d2c5]/80 rounded w-full" />
            <div className="h-1 bg-[#d8d2c5]/80 rounded w-4/5" />
            <div className="h-1 bg-[#d8d2c5]/80 rounded w-full" />
          </div>
        </div>
      </motion.div>

      {/* Main newspaper */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="bg-[#fffcf6] border border-[#d8d2c5] rounded-sm shadow-xl overflow-hidden relative z-[2]"
      >
        {/* Masthead */}
        <div className="border-b-2 border-[#1e2522]/80 px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-[5px] text-[#8a8478] uppercase tracking-[0.2em]">Vol. CXII — No. 34,891</p>
            <p className="text-[5px] text-[#8a8478] uppercase tracking-[0.2em]">Monday, Sep 8, 2026</p>
          </div>
          <h3 className="text-center text-xl sm:text-2xl tracking-tight mt-1 text-[#1e2522]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            NEWS
          </h3>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <div className="h-px bg-[#1e2522]/20 flex-1" />
            <p className="text-[6px] uppercase tracking-[0.2em] text-[#8a8478] italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Truth Matters
            </p>
            <div className="h-px bg-[#1e2522]/20 flex-1" />
          </div>
        </div>

        {/* Article with press photo */}
        <div className="p-5">
          <h4 className="text-xs sm:text-sm font-bold leading-snug mb-3 text-[#1e2522]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Scientists Confirm New Species Discovered in Deep Ocean Expedition
          </h4>

          {/* Press photo - Newsroom scene */}
          <div className="w-full h-32 sm:h-44 rounded overflow-hidden mb-3 relative bg-[#2a2d28]">
            <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="spotlight" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#8a9180" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2a2d28" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Dark background */}
              <rect width="500" height="200" fill="#2a2d28" />
              <rect width="500" height="200" fill="url(#spotlight)" />
              {/* Back wall with shelves/frames */}
              <rect x="20" y="10" width="460" height="60" fill="#353832" rx="2" />
              <rect x="40" y="18" width="50" height="35" fill="#4a4d46" rx="1" />
              <rect x="100" y="18" width="50" height="35" fill="#4a4d46" rx="1" />
              <rect x="160" y="18" width="50" height="35" fill="#4a4d46" rx="1" />
              {/* Person 1 - reading newspaper (silhouette) */}
              <circle cx="120" cy="100" r="12" fill="#4a4d46" />
              <rect x="108" y="112" width="24" height="40" rx="4" fill="#4a4d46" />
              {/* Newspaper in hands */}
              <rect x="90" y="120" width="35" height="25" rx="1" fill="#d8d2c5" transform="rotate(-8 107 132)" />
              <line x1="93" y1="125" x2="122" y2="122" stroke="#8a8478" strokeWidth="0.5" />
              <line x1="93" y1="128" x2="120" y2="125" stroke="#8a8478" strokeWidth="0.5" />
              <line x1="93" y1="131" x2="118" y2="128" stroke="#8a8478" strokeWidth="0.5" />
              {/* Person 2 - typing at desk */}
              <circle cx="250" cy="95" r="12" fill="#5a5d56" />
              <rect x="238" y="107" width="24" height="42" rx="4" fill="#5a5d56" />
              {/* Typing hands */}
              <rect x="230" y="145" width="40" height="3" rx="1" fill="#6b7268" />
              <rect x="225" y="148" width="50" height="2" rx="1" fill="#4a4d46" />
              {/* Person 3 - standing with clipboard */}
              <circle cx="380" cy="90" r="13" fill="#4a4d46" />
              <rect x="367" y="103" width="26" height="45" rx="4" fill="#4a4d46" />
              {/* Clipboard */}
              <rect x="390" y="115" width="18" height="24" rx="1" fill="#d8d2c5" />
              <line x1="393" y1="120" x2="405" y2="120" stroke="#8a8478" strokeWidth="0.5" />
              <line x1="393" y1="123" x2="403" y2="123" stroke="#8a8478" strokeWidth="0.5" />
              <line x1="393" y1="126" x2="404" y2="126" stroke="#8a8478" strokeWidth="0.5" />
              {/* Desk surface */}
              <rect x="200" y="150" width="120" height="4" rx="1" fill="#5a5d56" />
              {/* Microphone on desk */}
              <line x1="260" y1="135" x2="260" y2="150" stroke="#6b7268" strokeWidth="2" />
              <ellipse cx="260" cy="133" rx="5" ry="4" fill="#6b7268" />
              {/* Camera/tripod in background */}
              <line x1="320" y1="100" x2="320" y2="150" stroke="#4a4d46" strokeWidth="1.5" />
              <rect x="315" y="96" width="10" height="8" rx="1" fill="#5a5d56" />
              {/* Ambient light particles */}
              <circle cx="180" cy="50" r="1" fill="#8a9180" opacity="0.3" />
              <circle cx="350" cy="40" r="1.5" fill="#8a9180" opacity="0.2" />
              <circle cx="420" cy="55" r="1" fill="#8a9180" opacity="0.25" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1e2522]/80 to-transparent px-3 py-1.5">
              <p className="text-[6px] text-white/80 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>Press room — Journalists covering breaking news, 2025</p>
            </div>
          </div>

          {/* Two-column text */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-4/5" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-3/4" />
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-5/6" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-3/4" />
              <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-3">
          <div className="border-t border-[#d8d2c5] pt-1.5 flex items-center justify-between">
            <span className="text-[5px] text-[#a09a8e] uppercase tracking-[0.15em]">Page A1</span>
            <div className="flex items-center gap-1 bg-[#174a45]/10 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-2 h-2 text-[#174a45]" />
              <span className="text-[5px] text-[#174a45] font-semibold uppercase tracking-wider">Verified by Veritas</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action cards row */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="flex gap-2 justify-center mt-4">
        {["VERIFY", "ANALYZE", "STAY INFORMED"].map((text, i) => (
          <motion.div key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.7 + i * 0.08 }}
            className="bg-[#fffcf6] border border-[#d8d2c5] rounded px-2 py-1 shadow-sm flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-[#174a45]" />
            <span className="text-[6px] font-semibold uppercase tracking-wider text-[#174a45]">{text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Score cards row */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="flex gap-2 justify-center mt-3">
        <div className="bg-[#fffcf6] border border-[#d8d2c5] rounded-lg p-2.5 shadow-md">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded bg-[#174a45]/10 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-[#174a45]" />
            </div>
            <span className="text-[7px] font-semibold text-[#174a45] uppercase tracking-wider">Credibility</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-[#174a45]" style={{ fontFamily: "'DM Serif Display', serif" }}>92%</span>
            <span className="text-[7px] text-[#8a8478]">Likely Credible</span>
          </div>
          <div className="mt-1 h-1 rounded-full bg-[#e8e3d8] overflow-hidden w-24">
            <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-[#174a45]" />
          </div>
        </div>
        <div className="bg-[#fffcf6] border border-[#b34a3c]/20 rounded-lg p-2.5 shadow-md">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-[#b34a3c]" />
            <span className="text-[7px] font-semibold text-[#b34a3c]">3 Red Flags</span>
          </div>
          <p className="text-[6px] text-[#8a8478] mt-0.5 leading-relaxed">Sensationalism, anonymous sources</p>
        </div>
      </motion.div>
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
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.97]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ─── Navigation ─── */}
      <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-5 py-3">
          <div className="glass-strong rounded-lg px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold tracking-wide uppercase" style={{ fontFamily: "'DM Serif Display', serif" }}>Veritas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Home</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Analyze</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>History</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Statistics</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Methodology</Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs border-0 rounded" onClick={() => navigate("/dashboard")}>
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-28 pb-12 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="max-w-xl">
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-4">Fake News Detection</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-2"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Veritas</motion.h1>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-6 min-h-[1.3em]" style={{ color: "#1E2522" }}>
                <AnimatedTagline />
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed mb-8">
                In a world full of information, Veritas helps you verify what's real. Our system analyzes news content, detects misleading patterns, and helps you make informed decisions.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }} className="flex flex-col sm:flex-row items-start gap-3">
                <Button size="lg" className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-7 h-11 text-sm border-0 rounded" onClick={() => navigate("/dashboard")}>
                  Start Analyzing <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="cursor-pointer border-border hover:bg-muted gap-2 px-7 h-11 text-sm rounded" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  Learn More
                </Button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.75 }} className="mt-10 flex items-center gap-6">
                {[{ value: "Real-time", label: "Analysis" }, { value: "95%+", label: "Accuracy Rate" }, { value: "70+", label: "Patterns Detected" }].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block leading-tight">{s.value}</span>
                      <span className="text-[10px] text-muted-foreground">{s.label}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <NewspaperVisual />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

      <Section className="py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {verdictExamples.map((v, i) => (
              <motion.div key={v.verdict} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="glass-card rounded-lg p-5 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: v.color }} />
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `${v.color}10` }}>
                      <v.icon className="w-4 h-4" style={{ color: v.color }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: v.color, fontFamily: "'DM Serif Display', serif" }}>{v.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-bold" style={{ color: v.color }}>{v.confidence}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.sample}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-20 px-5" id="how-it-works">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Our Approach</span>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>How Veritas Works</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">We combine advanced AI with proven fact-checking methodologies to give you reliable results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div key={s.step} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="glass-card rounded-lg p-6 group hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Step {s.step}</span>
                  <h3 className="mt-1 text-lg font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>{s.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

      <Section className="py-20 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Capabilities</span>
            <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Built for Media Literacy</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">A comprehensive toolkit for identifying misinformation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="glass-card rounded-lg p-5 group hover:shadow-md transition-shadow duration-300">
                  <div className="w-9 h-9 rounded bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-primary/12 transition-colors">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card rounded-lg p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20" />
            <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center mx-auto mb-5">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>Academically Grounded</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-7 leading-relaxed">Detection heuristics informed by research from leading institutions in misinformation detection.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {references.map((ref) => (
                <span key={ref} className="text-xs px-3 py-1.5 rounded bg-muted text-muted-foreground border border-border">{ref}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[{ icon: Users, label: "Named Sources", desc: "Credibility tracking" }, { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" }, { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" }, { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" }].map((item, i) => (
                <motion.div key={item.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <div className="rounded-lg p-3 bg-muted/50">
                    <item.icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
                    <span className="text-[11px] font-semibold block">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-20 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-strong rounded-lg px-8 py-14 sm:px-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10" />
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-5">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Ready to Fact-Check?</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">Start analyzing articles with our detection engine. No sign-up required.</p>
            <Button size="lg" className="cursor-pointer mt-7 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 h-11 text-sm border-0 rounded" onClick={() => navigate("/dashboard")}>
              Launch Veritas <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      <footer className="py-6 px-5 border-t border-border">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ fontFamily: "'DM Serif Display', serif" }}>Veritas</span>
          </div>
          <p className="text-[10px] text-muted-foreground">BSc Data Science Third Year Project — NLP-Based Misinformation Detection</p>
        </div>
      </footer>
    </div>
  );
}
