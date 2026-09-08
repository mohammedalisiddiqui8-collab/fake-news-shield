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

/* ─── Newspaper Collage Visual ─── */
function NewspaperVisual() {
  return (
    <div className="relative">
      {/* Back newspaper layer - slightly rotated */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute -top-8 -left-8 w-[90%] h-[85%] rounded-lg overflow-hidden shadow-xl border border-border/50"
        style={{ transform: 'rotate(-5deg)' }}
      >
        <div className="w-full h-full bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary/30" />
            <div className="h-2 bg-muted rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded w-full" />
            <div className="h-2 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded w-5/6" />
          </div>
        </div>
      </motion.div>

      {/* Main newspaper - front page with SVG illustration */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative rounded-lg overflow-hidden shadow-2xl border border-border/60"
        style={{ transform: 'rotate(2deg)' }}
      >
        {/* SVG Mountain Landscape Illustration */}
        <div className="w-full h-48 sm:h-56 relative overflow-hidden bg-gradient-to-b from-[#d4cfc4] via-[#c8c1b4] to-[#e8e3d8]">
          <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* Sky gradient */}
            <defs>
              <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c5bfb2" />
                <stop offset="50%" stopColor="#d4cfc4" />
                <stop offset="100%" stopColor="#e0dbd0" />
              </linearGradient>
              <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b7268" />
                <stop offset="100%" stopColor="#8a9180" />
              </linearGradient>
              <linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a5244" />
                <stop offset="100%" stopColor="#6b7268" />
              </linearGradient>
              <linearGradient id="mountain3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a4236" />
                <stop offset="100%" stopColor="#5a6354" />
              </linearGradient>
            </defs>
            {/* Sky */}
            <rect width="400" height="200" fill="url(#sky)" />
            {/* Far mountains */}
            <path d="M0 180 L50 100 L80 120 L120 80 L160 110 L200 70 L240 100 L280 85 L320 105 L360 90 L400 100 L400 200 L0 200Z" fill="url(#mountain1)" opacity="0.6" />
            {/* Mid mountains */}
            <path d="M0 200 L30 140 L70 160 L110 120 L150 150 L190 110 L230 140 L270 125 L310 145 L350 130 L400 140 L400 200 L0 200Z" fill="url(#mountain2)" opacity="0.8" />
            {/* Front mountains */}
            <path d="M0 200 L40 160 L80 175 L120 145 L160 170 L200 140 L240 165 L280 150 L320 170 L360 155 L400 165 L400 200 L0 200Z" fill="url(#mountain3)" />
            {/* Trees silhouette */}
            <path d="M50 170 L55 155 L60 170Z M55 155 L58 140 L61 155Z" fill="#2a3226" opacity="0.7" />
            <path d="M80 165 L85 150 L90 165Z M85 150 L88 138 L91 150Z" fill="#2a3226" opacity="0.6" />
            <path d="M320 168 L325 153 L330 168Z M325 153 L328 140 L331 153Z" fill="#2a3226" opacity="0.7" />
            <path d="M350 172 L355 158 L360 172Z M355 158 L358 145 L361 158Z" fill="#2a3226" opacity="0.5" />
            {/* Fog layer */}
            <rect y="160" width="400" height="40" fill="#e0dbd0" opacity="0.3" />
          </svg>
          {/* Overlay newspaper clipping */}
          <div className="absolute bottom-0 left-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded shadow-lg p-3" style={{ transform: 'rotate(-1deg)' }}>
            <div className="border-b border-foreground/30 pb-1.5 mb-2">
              <h4 className="text-xs font-bold tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>NEWS</h4>
              <p className="text-[6px] uppercase tracking-[0.15em] text-muted-foreground italic">Truth Matters</p>
            </div>
            <h5 className="text-[10px] font-bold leading-snug mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Breakthrough in Climate Research Published
            </h5>
            <p className="text-[7px] text-muted-foreground leading-relaxed">Scientists at leading universities confirm new findings...</p>
          </div>
        </div>

        {/* Newspaper body below image */}
        <div className="bg-card p-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[7px] text-muted-foreground/60 uppercase tracking-widest">Page A1</span>
            <div className="flex items-center gap-1 bg-primary/8 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-2 h-2 text-primary" />
              <span className="text-[7px] text-primary font-semibold uppercase tracking-wider">Verified</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-muted/60 rounded w-full" />
            <div className="h-1 bg-muted/60 rounded w-4/5" />
            <div className="h-1 bg-muted/60 rounded w-full" />
          </div>
        </div>
      </motion.div>

      {/* Floating verification card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute -bottom-4 -right-4 bg-card border border-border rounded-lg p-3 shadow-lg max-w-[200px] z-10"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
            <Shield className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">Credibility Score</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary" style={{ fontFamily: "'DM Serif Display', serif" }}>92%</span>
          <span className="text-[9px] text-muted-foreground">Likely Credible</span>
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "92%" }}
            transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </motion.div>

      {/* Floating red flag card */}
      <motion.div
        initial={{ opacity: 0, x: -16, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="absolute -bottom-2 -left-8 bg-card border border-destructive/20 rounded-lg p-2.5 shadow-lg max-w-[160px] z-10"
      >
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-destructive" />
          <span className="text-[9px] font-semibold text-destructive">3 Red Flags</span>
        </div>
        <p className="text-[8px] text-muted-foreground mt-0.5 leading-relaxed">Sensationalism, anonymous sources, urgency language</p>
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
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>
                Home
              </Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>
                Analyze
              </Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>
                History
              </Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>
                Statistics
              </Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>
                Methodology
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs border-0 rounded"
                onClick={() => navigate("/dashboard")}>
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-28 pb-16 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 items-center">
            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Fake News Detection
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-2"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
                Veritas
              </motion.h1>
              {/* Animated tagline */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-6 min-h-[1.3em]"
                style={{ color: "#1E2522" }}>
                <AnimatedTagline />
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed mb-8">
                In a world full of information, Veritas helps you verify what's real. Our system analyzes
                news content, detects misleading patterns, and helps you make informed decisions.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-start gap-3">
                <Button size="lg"
                  className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-7 h-11 text-sm border-0 rounded"
                  onClick={() => navigate("/dashboard")}>
                  Start Analyzing <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline"
                  className="cursor-pointer border-border hover:bg-muted gap-2 px-7 h-11 text-sm rounded"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  Learn More
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 }}
                className="mt-10 flex items-center gap-6">
                {[
                  { value: "Real-time", label: "Analysis" },
                  { value: "95%+", label: "Accuracy Rate" },
                  { value: "70+", label: "Patterns Detected" },
                ].map((s, i) => (
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

            {/* Right: Newspaper Visual */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative">
              <NewspaperVisual />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── Editorial Rule ─── */}
      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

      {/* ─── Verdict Preview ─── */}
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

      {/* ─── How It Works ─── */}
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
                <div className="glass-card rounded-lg p-6 group hover:shadow-md transition-shadow duration-300 relative">
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

      {/* ─── Editorial Rule ─── */}
      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

      {/* ─── Features ─── */}
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

      {/* ─── Academic References ─── */}
      <Section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card rounded-lg p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20" />
            <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center mx-auto mb-5">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>Academically Grounded</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-7 leading-relaxed">
              Detection heuristics informed by research from leading institutions in misinformation detection.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {references.map((ref) => (
                <span key={ref} className="text-xs px-3 py-1.5 rounded bg-muted text-muted-foreground border border-border">
                  {ref}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                { icon: Users, label: "Named Sources", desc: "Credibility tracking" },
                { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" },
                { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" },
                { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" },
              ].map((item, i) => (
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

      {/* ─── CTA ─── */}
      <Section className="py-20 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-strong rounded-lg px-8 py-14 sm:px-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10" />
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-5">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Ready to Fact-Check?</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              Start analyzing articles with our detection engine. No sign-up required.
            </p>
            <Button size="lg"
              className="cursor-pointer mt-7 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 h-11 text-sm border-0 rounded"
              onClick={() => navigate("/dashboard")}>
              Launch Veritas <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* ─── Footer ─── */}
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
