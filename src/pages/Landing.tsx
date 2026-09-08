import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Sparkles, Globe, FileCheck, TrendingUp, Users,
  ChevronDown, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef } from "react";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { TypeWriter } from "@/components/TypeWriter";
import { TiltCard } from "@/components/TiltCard";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Data ─── */
const heroPhrases = [
  "With Precision",
  "Instantly",
  "With Transparency",
  "Reliably",
  "With Evidence",
];

const stats = [
  { value: "70+", label: "Patterns", icon: Search },
  { value: "12", label: "Red Flags", icon: AlertTriangle },
  { value: "9", label: "Green Flags", icon: CheckCircle2 },
  { value: "<1s", label: "Speed", icon: Zap },
];

const features = [
  { icon: Brain, title: "NLP Engine", description: "70+ weighted regex patterns across 21 categories for precision detection." },
  { icon: Search, title: "Content Inspection", description: "Scrutinises tone, sourcing, statistics, and structure against known misinformation patterns." },
  { icon: BarChart3, title: "Visual Breakdown", description: "Charts showing exactly how each category contributed to the final verdict." },
  { icon: Eye, title: "Transparent AI", description: "No black box. Every flag is explainable with exact triggered keywords." },
  { icon: Zap, title: "Real-Time", description: "Paste any article and get a verdict in under 1 second. No API keys needed." },
  { icon: Globe, title: "Universal", description: "News articles, social media posts, WhatsApp forwards, blog entries." },
];

const steps = [
  { step: "01", title: "Ingest", description: "Paste any news article, post, or text content for verification.", icon: Search },
  { step: "02", title: "Analyze", description: "NLP engine scans 70+ patterns across 12 red flag and 9 green flag categories.", icon: Brain },
  { step: "03", title: "Verdict", description: "Clear verdict with confidence score, highlighted keywords, and breakdown.", icon: Shield },
];

const verdictExamples = [
  { verdict: "likely_real" as const, label: "Likely Real", icon: CheckCircle2, accent: "#34d399", confidence: 92, sample: "BBC reports on government climate policy with named officials, cited data, and balanced perspectives." },
  { verdict: "uncertain" as const, label: "Uncertain", icon: AlertTriangle, accent: "#fbbf24", confidence: 54, sample: "Article mixes verified facts with unverified claims from unnamed sources." },
  { verdict: "likely_fake" as const, label: "Likely Fake", icon: XCircle, accent: "#f87171", confidence: 87, sample: "Sensational headline with no source, anonymous 'experts', and unverifiable statistics." },
];

const techStack = [
  { name: "React 19", desc: "UI Framework" },
  { name: "TypeScript", desc: "Type Safety" },
  { name: "Convex", desc: "Serverless Backend" },
  { name: "Tailwind", desc: "Styling" },
  { name: "Framer Motion", desc: "Animation" },
  { name: "Recharts", desc: "Data Viz" },
];

/* ─── Reusable Section ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} id={id}
      initial={{ opacity: 0, y: 40 }}
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
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.96]);

  return (
    <div className="min-h-screen gradient-bg text-foreground overflow-hidden">
      {/* ─── Particle Network Background ─── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <ParticleNetwork className="opacity-40" />
        {/* Ambient orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-float-slow" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full blur-[100px] animate-float" style={{ background: "oklch(0.58 0.10 65 / 5%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[350px] rounded-full bg-primary/3 blur-[130px] animate-float-delay" />
      </div>

      {/* ─── Navigation ─── */}
      <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-5 py-3">
          <div className="glass-strong rounded-2xl px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-cyan">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight">Veritas</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button className="cursor-pointer bg-primary hover:bg-primary/85 text-primary-foreground gap-1.5 text-xs shadow-lg shadow-primary/20 border-0"
                onClick={() => navigate("/dashboard")}>
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-28 pb-16 px-5">
        <div className="mx-auto max-w-5xl text-center">
          {/* Animated badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 border border-primary/15 glow-ring">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[11px] font-medium text-primary tracking-wide">BSc Data Science — Final Year Project</span>
          </motion.div>

          {/* Heading with typing effect */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            <span className="text-foreground">Detect Misinformation</span>
            <br />
            <span className="text-gradient">
              <TypeWriter phrases={heroPhrases} speed={55} deleteSpeed={25} pauseDuration={2500} />
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            NLP-powered linguistic analysis that detects misinformation patterns,
            source credibility issues, and logical inconsistencies — with full transparency.
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg"
              className="cursor-pointer bg-primary hover:bg-primary/85 text-primary-foreground gap-2 px-8 h-12 text-sm glow-cyan shadow-xl shadow-primary/20 animate-gradient border-0 hover-lift"
              onClick={() => navigate("/dashboard")}>
              <Sparkles className="w-4 h-4" /> Start Analyzing <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline"
              className="cursor-pointer glass border-primary/15 hover:bg-primary/5 gap-2 px-7 h-12 text-sm hover-lift"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              How It Works <ChevronDown className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={scaleIn} initial="hidden" animate="visible">
                <TiltCard className="glass-card rounded-xl p-3.5 text-center hover-shimmer">
                  <s.icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
                  <span className="text-xl font-extrabold text-gradient">{s.value}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Verdict Preview with Tilt */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {verdictExamples.map((v, i) => (
              <motion.div key={v.verdict} custom={i} variants={fadeUp} initial="hidden" animate="visible">
                <TiltCard className="glass-card rounded-xl p-4 text-left hover-glow group transition-all duration-300 relative overflow-hidden"
                  glareColor={v.accent}>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{ background: `${v.accent}18` }}>
                        <v.icon className="w-3.5 h-3.5" style={{ color: v.accent }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: v.accent }}>{v.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1.5">
                      <span className="text-lg font-bold text-gradient">{v.confidence}%</span>
                      <span className="text-[10px] text-muted-foreground">confidence</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{v.sample}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── How It Works ─── */}
      <Section className="py-24 px-5" id="how-it-works">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em]">Pipeline</span>
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">Three steps from suspicion to certainty.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <motion.div key={s.step} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <TiltCard className="glass-card rounded-xl p-6 text-center group hover-glow relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/12 group-hover:scale-105 transition-all duration-300">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-primary/50 uppercase tracking-[0.2em]">Step {s.step}</span>
                  <h3 className="mt-1.5 text-lg font-semibold text-gradient">{s.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Features ─── */}
      <Section className="py-24 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em]">Capabilities</span>
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-bold tracking-tight">Built for Media Literacy</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">A comprehensive toolkit for identifying misinformation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <TiltCard className="glass-card rounded-xl p-5 group hover-glow relative overflow-hidden" intensity={6}>
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-primary/12 group-hover:scale-105 transition-all duration-300">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-gradient mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Tech Stack ─── */}
      <Section className="py-24 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em]">Technology</span>
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-bold tracking-tight">Under the Hood</h2>
          </div>
          <div className="glass-card rounded-2xl p-8 sm:p-10 animated-border">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {techStack.map((t, i) => (
                <motion.div key={t.name} custom={i} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <TiltCard className="glass rounded-lg p-3 text-center hover-glow" intensity={5}>
                    <span className="text-xs font-bold">{t.name}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-border/40 pt-5">
              <h4 className="text-xs font-semibold mb-2.5">Detection Capabilities</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Severity-weighted regex pattern matching",
                  "12 red flag + 9 green flag categories",
                  "Confidence calibration (35-95%)",
                  "Category-level breakdown visualization",
                  "Triggered keyword extraction",
                  "Transparent, explainable AI decisions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Academic ─── */}
      <Section className="py-24 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden glow-ring">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5 animate-float-tilt">
              <FileCheck className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 text-gradient">Academically Grounded</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-7 leading-relaxed">
              Detection heuristics informed by research from MIT Media Lab, Stanford Internet Observatory,
              Reuters Institute, and the LIAR Dataset.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users, label: "Named Sources", desc: "Credibility tracking" },
                { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" },
                { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" },
                { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" },
              ].map((item, i) => (
                <motion.div key={item.label} custom={i} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <TiltCard className="glass rounded-lg p-3" intensity={4}>
                    <item.icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
                    <span className="text-[11px] font-semibold block">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="py-24 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-strong rounded-2xl px-8 py-14 sm:px-14 relative overflow-hidden animated-border">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-5 glow-cyan animate-pulse-glow">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">Ready to Fact-Check?</h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
                Start analyzing articles with NLP-powered detection. No sign-up required.
              </p>
              <Button size="lg"
                className="cursor-pointer mt-7 bg-primary hover:bg-primary/85 text-primary-foreground gap-2 px-8 h-12 text-sm glow-cyan shadow-xl shadow-primary/20 animate-gradient border-0 hover-lift"
                onClick={() => navigate("/dashboard")}>
                Launch Veritas <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="py-6 px-5 border-t border-border/30">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold">Veritas</span>
          </div>
          <p className="text-[10px] text-muted-foreground">BSc Data Science Third Year Project — NLP-Based Misinformation Detection</p>
        </div>
      </footer>
    </div>
  );
}
