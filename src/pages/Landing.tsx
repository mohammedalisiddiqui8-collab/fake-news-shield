import { motion, useScroll, useTransform } from "framer-motion";
import {
  Shield,
  Brain,
  Search,
  BarChart3,
  Eye,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Lock,
  TrendingUp,
  Users,
  FileCheck,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stats = [
  { value: "70+", label: "Detection Patterns", icon: Search },
  { value: "12", label: "Red Flag Categories", icon: AlertTriangle },
  { value: "9", label: "Green Flag Categories", icon: CheckCircle2 },
  { value: "<1s", label: "Analysis Speed", icon: Zap },
];

const features = [
  { icon: Brain, title: "NLP Pattern Engine", description: "70+ regex patterns weighted by severity across 21 categories for precision detection.", color: "from-blue-500/20 to-indigo-500/20" },
  { icon: Search, title: "Deep Content Inspection", description: "Scrutinises tone, sourcing, statistical claims, and headline integrity against misinformation patterns.", color: "from-violet-500/20 to-purple-500/20" },
  { icon: BarChart3, title: "Category Breakdown", description: "Visual chart showing exactly how much each category contributed to the final verdict.", color: "from-cyan-500/20 to-blue-500/20" },
  { icon: Eye, title: "100% Transparent", description: "No black box. Every flag is explainable — see the exact words that triggered detection.", color: "from-emerald-500/20 to-teal-500/20" },
  { icon: Zap, title: "Instant Analysis", description: "Paste any article and get a verdict in under 1 second. No API keys needed.", color: "from-amber-500/20 to-orange-500/20" },
  { icon: Globe, title: "Any Content Format", description: "News articles, social media posts, WhatsApp forwards, blog entries — works on everything.", color: "from-rose-500/20 to-pink-500/20" },
];

const steps = [
  { step: "01", title: "Paste Content", description: "Enter any news article, social media post, or text content you want to verify.", icon: Search },
  { step: "02", title: "NLP Analysis", description: "Our engine scans 70+ patterns across 12 red flag and 9 green flag categories.", icon: Brain },
  { step: "03", title: "Get Verdict", description: "Receive a clear verdict with confidence score, highlighted keywords, and detailed breakdown.", icon: Shield },
];

const verdictExamples = [
  { verdict: "likely_real", label: "Likely Real", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/15", border: "border-emerald-400/40", glow: "shadow-emerald-500/15", confidence: 92, sample: "BBC reports on government climate policy with named officials, cited data, and balanced perspectives." },
  { verdict: "uncertain", label: "Uncertain", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-400/15", border: "border-amber-400/40", glow: "shadow-amber-500/15", confidence: 54, sample: "Article mixes verified facts with unverified claims from unnamed sources." },
  { verdict: "likely_fake", label: "Likely Fake", icon: XCircle, color: "text-red-500", bg: "bg-red-500/15", border: "border-red-400/40", glow: "shadow-red-500/15", confidence: 87, sample: "Sensational headline with no source, anonymous 'experts', and unverifiable statistics." },
];

const techStack = [
  { name: "React 19", desc: "UI Framework" },
  { name: "TypeScript", desc: "Type Safety" },
  { name: "Convex", desc: "Serverless Backend" },
  { name: "Tailwind CSS", desc: "Styling" },
  { name: "Framer Motion", desc: "Animations" },
  { name: "Recharts", desc: "Data Viz" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <div className="min-h-screen gradient-bg text-foreground overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
        <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-chart-2/8 blur-[100px] animate-float-delay" />
        <div className="absolute bottom-0 left-1/4 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[140px] animate-float-slow" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
      </div>

      {/* Navigation */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[oklch(0.50_0.20_210)] to-[oklch(0.45_0.16_175)] flex items-center justify-center shadow-lg shadow-primary/30">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">Veritas</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex" onClick={() => navigate("/dashboard")}>Dashboard</Button>
              <Button className="cursor-pointer bg-gradient-to-r from-[oklch(0.50_0.18_220)] to-[oklch(0.48_0.16_195)] hover:opacity-90 text-primary-foreground gap-2 shadow-lg shadow-primary/30 border-0" onClick={() => navigate("/dashboard")}>
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 border border-emerald-400/30 shadow-lg shadow-emerald-500/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">BSc Data Science — Final Year Project</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
            <span className="text-foreground">Detect Fake News</span>
            <br />
            <span className="text-gradient">With Precision</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            An NLP-powered misinformation detection system that analyzes linguistic patterns,
            source credibility, and logical consistency — delivering transparent,
            explainable verdicts.
          </motion.p>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="cursor-pointer bg-gradient-to-r from-[oklch(0.50_0.20_210)] via-[oklch(0.48_0.18_195)] to-[oklch(0.45_0.16_175)] hover:opacity-90 text-primary-foreground gap-2 px-10 h-14 text-base glow-blue shadow-xl shadow-primary/30 animate-gradient border-0"
              onClick={() => navigate("/dashboard")}>
              <Sparkles className="w-5 h-5" /> Start Analyzing <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer glass border-primary/20 hover:bg-primary/5 gap-2 px-8 h-14 text-base"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works <ChevronDown className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={scaleIn} initial="hidden" animate="visible"
                className="glass-card rounded-xl p-4 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <span className="text-2xl font-extrabold text-gradient">{s.value}</span>
                <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Verdict preview cards */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {verdictExamples.map((v, i) => (
              <motion.div key={v.verdict} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                className={`glass-card rounded-2xl p-5 text-left border ${v.border} hover:shadow-lg hover:${v.glow} transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${v.bg} flex items-center justify-center`}>
                    <v.icon className={`w-4 h-4 ${v.color}`} />
                  </div>
                  <span className={`text-sm font-semibold ${v.color}`}>{v.label}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold">{v.confidence}%</span>
                  <span className="text-xs text-muted-foreground">confidence</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.sample}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Simple Process</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Three steps from suspicion to certainty.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.step} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="glass-card rounded-2xl p-8 text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Step {s.step}</span>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Capabilities</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">Built for Media Literacy</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">A comprehensive toolkit for identifying misinformation with precision.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Technology</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Under the Hood</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-10 sm:p-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {techStack.map((t, i) => (
                <motion.div key={t.name} custom={i} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="glass rounded-xl p-4 text-center hover:shadow-md transition-all duration-200">
                  <span className="text-sm font-bold">{t.name}</span>
                  <p className="text-[11px] text-muted-foreground mt-1">{t.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-6">
              <h4 className="text-sm font-semibold mb-3">Detection Capabilities</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Severity-weighted regex pattern matching",
                  "12 red flag + 9 green flag categories",
                  "Confidence calibration (35-95%)",
                  "Category-level breakdown visualization",
                  "Triggered keyword extraction",
                  "Transparent, explainable AI decisions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Academic Credibility */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-10 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-blue-500" />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Academically Grounded</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Detection heuristics informed by research from MIT Media Lab, Stanford Internet Observatory,
              Reuters Institute, and the LIAR Dataset (12.8K labeled statements).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: "Named Sources", desc: "Credibility tracking" },
                { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" },
                { icon: MessageSquare, label: "Explainable AI", desc: "Transparent verdicts" },
                { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" },
              ].map((item, i) => (
                <motion.div key={item.label} custom={i} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="glass rounded-xl p-4">
                  <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="text-xs font-semibold block">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="glass-strong rounded-3xl px-8 py-16 sm:px-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.50_0.20_210)] via-[oklch(0.48_0.18_195)] to-[oklch(0.45_0.16_175)] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30 animate-pulse-glow">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to Fact-Check?</h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                Start analyzing articles with NLP-powered detection. No sign-up required.
              </p>
              <Button size="lg" className="cursor-pointer mt-8 bg-gradient-to-r from-[oklch(0.50_0.20_210)] via-[oklch(0.48_0.18_195)] to-[oklch(0.45_0.16_175)] hover:opacity-90 text-primary-foreground gap-2 px-10 h-14 text-base glow-blue shadow-xl shadow-primary/30 animate-gradient border-0"
                onClick={() => navigate("/dashboard")}>
                Launch Veritas <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Veritas</span>
          </div>
          <p className="text-xs text-muted-foreground">BSc Data Science Third Year Project — NLP-Based Misinformation Detection</p>
        </div>
      </footer>
    </div>
  );
}
