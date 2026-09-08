import { motion, useInView } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users, Stamp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef } from "react";

/* ─── Editorial Newspaper Verification Composition ─── */
function VerificationComposition() {
  return (
    <div className="relative w-full" style={{ minHeight: 380 }}>
      {/* ── Main newspaper clipping ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded border overflow-hidden"
        style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}
      >
        {/* Masthead */}
        <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "#D8D2C5" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#174A45" }}>The Veritas Dispatch</span>
            <span className="text-[7px]" style={{ color: "#6B7268" }}>Vol. XLII — No. 8 — September 2026</span>
          </div>
          <div className="h-px w-full" style={{ background: "#1E2522" }} />
          <div className="h-px w-full mt-px" style={{ background: "#1E2522", opacity: 0.3 }} />
        </div>

        {/* Two-column article layout */}
        <div className="px-4 py-3">
          <h4 className="text-[11px] font-bold leading-tight mb-2" style={{ color: "#1E2522", fontFamily: "'DM Serif Display', serif" }}>
            Scientists Confirm New Species Discovery in Deep Ocean Expedition
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Left column */}
            <div className="space-y-1">
              <div className="h-[2px] w-full rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[90%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[85%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[95%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[70%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[88%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[75%] rounded" style={{ background: "#E8E3D8" }} />
            </div>
            {/* Right column */}
            <div className="space-y-1">
              <div className="h-[2px] w-[80%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[92%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[78%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[85%] rounded" style={{ background: "#E8E3D8" }} />
              <div className="h-[2px] w-[65%] rounded" style={{ background: "#E8E3D8" }} />
            </div>
          </div>
          {/* Source label */}
          <div className="mt-2 pt-2 border-t flex items-center gap-2" style={{ borderColor: "#D8D2C5" }}>
            <span className="text-[7px] font-medium" style={{ color: "#6B7268" }}>Source: University of Oxford — Journal of Marine Biology</span>
            <span className="text-[7px]" style={{ color: "#D8D2C5" }}>|</span>
            <span className="text-[7px]" style={{ color: "#6B7268" }}>March 15, 2025</span>
          </div>
        </div>
      </motion.div>

      {/* ── Evidence card: Verified ── */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute top-2 right-0 rounded border p-3 shadow-sm"
        style={{ background: "#FFFCF6", borderColor: "#174A45", width: 140 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "#174A4510" }}>
            <CheckCircle2 className="w-3 h-3" style={{ color: "#174A45" }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#174A45" }}>Verified</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold" style={{ color: "#174A45", fontFamily: "'DM Serif Display', serif" }}>92%</span>
          <span className="text-[7px] uppercase tracking-wider" style={{ color: "#6B7268" }}>confidence</span>
        </div>
        <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: "#E8E3D8" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "92%" }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="h-full rounded-full"
            style={{ background: "#174A45" }}
          />
        </div>
      </motion.div>

      {/* ── Evidence card: Red Flags ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-16 left-0 rounded border p-2.5 shadow-sm"
        style={{ background: "#FFFCF6", borderColor: "#B34A3C", width: 150 }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertTriangle className="w-3 h-3" style={{ color: "#B34A3C" }} />
          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#B34A3C" }}>3 Red Flags</span>
        </div>
        <div className="space-y-0.5">
          {["Sensational language", "Missing citations", "Anonymous sources"].map((f) => (
            <div key={f} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: "#B34A3C" }} />
              <span className="text-[7px]" style={{ color: "#6B7268" }}>{f}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Verification stamp ── */}
      <motion.div
        initial={{ opacity: 0, rotate: -8, scale: 0.8 }}
        animate={{ opacity: 1, rotate: -6, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
        className="absolute bottom-2 right-4 border-2 rounded px-3 py-1.5"
        style={{ borderColor: "#174A45", transform: "rotate(-6deg)" }}
      >
        <div className="flex items-center gap-1.5">
          <Stamp className="w-3.5 h-3.5" style={{ color: "#174A45" }} />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] block" style={{ color: "#174A45" }}>VERIFIED</span>
            <span className="text-[6px] block" style={{ color: "#6B7268" }}>by Veritas NLP Engine</span>
          </div>
        </div>
      </motion.div>

      {/* ── Source label tag ── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="absolute top-32 -left-2 rounded-sm px-2 py-1 shadow-sm"
        style={{ background: "#174A45" }}
      >
        <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: "#FFFCF6" }}>Credible Source</span>
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
      <section className="relative pt-20 pb-16 px-5 paper-texture">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Editorial text */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: "#174A45" }}>Fake News Detection</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-1"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Veritas</motion.h1>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-6"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Truth over noise.</motion.h2>
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

            {/* Right: Newspaper verification composition */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <VerificationComposition />
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
