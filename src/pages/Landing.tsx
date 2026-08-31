import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Advanced language models evaluate linguistic patterns, logical consistency, and source credibility in real time.",
  },
  {
    icon: Search,
    title: "Deep Content Inspection",
    description:
      "Scrutinises tone, sourcing, statistical claims, and headline integrity against known misinformation patterns.",
  },
  {
    icon: BarChart3,
    title: "Credibility Scoring",
    description:
      "Every result includes a confidence score, detailed reasoning, and flagged indicators — real or fake.",
  },
  {
    icon: Eye,
    title: "Transparent Reasoning",
    description:
      "No black box. See exactly why an article was flagged with itemised red and green indicators.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Paste any article text and get a verdict in seconds. Designed for speed and accuracy.",
  },
  {
    icon: Globe,
    title: "Works on Any Content",
    description:
      "Paste news articles, social media posts, blog entries, or headlines — the system adapts to every format.",
  },
];

const steps = [
  {
    step: "01",
    title: "Paste or Submit",
    description: "Enter any news article text or content you want to verify.",
    icon: Search,
  },
  {
    step: "02",
    title: "AI Analyzes",
    description:
      "Our model evaluates credibility markers, sourcing, tone, and logical consistency.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Get Verdict",
    description:
      "Receive a clear verdict — Likely Real, Likely Fake, or Uncertain — with detailed breakdown.",
    icon: Shield,
  },
];

const verdictExamples = [
  {
    verdict: "likely_real",
    label: "Likely Real",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    confidence: 92,
    sample: "BBC reports on government climate policy with named officials, cited data, and balanced perspectives.",
  },
  {
    verdict: "uncertain",
    label: "Uncertain",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    confidence: 54,
    sample: "Article mixes verified facts with unverified claims from unnamed sources.",
  },
  {
    verdict: "likely_fake",
    label: "Likely Fake",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    confidence: 87,
    sample: "Sensational headline with no source, anonymous 'experts', and unverifiable statistics.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg text-foreground overflow-hidden">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] animate-float" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-chart-2/8 blur-[80px] animate-float-delay" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[120px] animate-float-slow" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Fake News Shield
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="cursor-pointer hidden sm:inline-flex"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={() => navigate("/auth")}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Misinformation Detection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            Detect Fake News
            <br />
            <span className="text-gradient">With Confidence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Paste any article and let advanced AI analyze credibility markers,
            sourcing patterns, and logical consistency — delivering a transparent
            verdict you can trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 h-12 text-base glow-blue"
              onClick={() => navigate("/auth")}
            >
              Start Analyzing
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer glass border-primary/20 hover:bg-primary/5 gap-2 px-8 h-12 text-base"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Hero visual — verdict cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            {verdictExamples.map((v, i) => (
              <motion.div
                key={v.verdict}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className={`glass-card rounded-2xl p-5 text-left border ${v.border}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${v.bg} flex items-center justify-center`}>
                    <v.icon className={`w-4 h-4 ${v.color}`} />
                  </div>
                  <span className={`text-sm font-semibold ${v.color}`}>
                    {v.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold">{v.confidence}%</span>
                  <span className="text-xs text-muted-foreground">
                    confidence
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {v.sample}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">
              Simple Process
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Three straightforward steps from suspicion to certainty.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8 text-center group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 transition-colors">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">
                  Step {s.step}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">
              Capabilities
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Built for Media Literacy
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              A comprehensive toolkit for identifying misinformation with
              precision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-10 sm:p-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Under the Hood</h3>
                <p className="text-sm text-muted-foreground">
                  Academic-grade approach to fake news detection
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Linguistic pattern analysis (sensationalism, emotional manipulation)",
                "Source credibility evaluation (named vs. anonymous sourcing)",
                "Statistical claim verification and logical consistency checks",
                "Headline integrity and clickbait detection",
                "Named entity recognition and cross-referencing",
                "Sentiment bias scoring and balance assessment",
                "Structured JSON verdicts for programmatic consumption",
                "Confidence calibration with transparent reasoning",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong rounded-3xl px-8 py-16 sm:px-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Fact-Check?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Join the fight against misinformation. Start analyzing articles
              with AI-powered detection today.
            </p>
            <Button
              size="lg"
              className="cursor-pointer mt-8 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-10 h-13 text-base glow-blue"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Fake News Shield</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A BSc Data Science Third Year Project — AI-Powered Fake News
            Detection
          </p>
        </div>
      </footer>
    </div>
  );
}
