import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect, Suspense, lazy } from "react";

const HeroScene = lazy(() => import("@/components/HeroScene"));

/* ─── Dynamic Date ─── */
function getFormattedDate() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

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
      <span className="inline-block w-[2px] h-[0.8em] ml-0.5 align-middle animate-pulse" style={{ background: "#2DD4A8" }} />
    </span>
  );
}

/* ─── Animated Counter ─── */
function CountUp({ target, duration = 2 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{val}</span>;
}

/* ─── Magnetic Button ─── */
function MagneticBtn({ children, className = "", style = {}, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  return (
    <button ref={ref}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = "translate(0,0)"; }}
      className={className}
      style={{ transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)", ...style }}
      onClick={onClick}>
      {children}
    </button>
  );
}

/* ─── Card3D ─── */
function Card3D({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) scale(1.01)`;
    el.style.borderColor = "rgba(45,212,168,0.15)";
  };

  return (
    <div ref={ref}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseLeave={() => { if (ref.current) { ref.current.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale(1)"; ref.current.style.borderColor = ""; } }}
      onTouchMove={(e) => { const t = e.touches[0]; if (t) handleMove(t.clientX, t.clientY); }}
      onTouchEnd={() => { if (ref.current) { ref.current.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale(1)"; ref.current.style.borderColor = ""; } }}
      className={className}
      style={{ transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s", transformStyle: "preserve-3d", willChange: "transform", ...style }}>
      {children}
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}>
      {children}
    </motion.section>
  );
}

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
  { verdict: "likely_real" as const, label: "Likely Credible", icon: CheckCircle2, color: "#2DD4A8", confidence: 92, sample: "Named officials, cited statistics, balanced perspectives from multiple sources." },
  { verdict: "uncertain" as const, label: "Uncertain", icon: AlertTriangle, color: "#C4985A", confidence: 54, sample: "Mixes verified facts with unverified claims from unnamed sources." },
  { verdict: "likely_fake" as const, label: "Likely Misleading", icon: XCircle, color: "#E85D4A", confidence: 87, sample: "Sensational headline, anonymous 'experts', unverifiable statistics." },
];

const references = [
  "MIT Media Lab",
  "Stanford Internet Observatory",
  "Reuters Institute",
  "LIAR Dataset (Wang, 2017)",
];

/* ═══ Landing Page ═══ */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(10,13,12,0.85)", backdropFilter: "blur(12px)", borderColor: "#1E2522" }}>
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5" style={{ color: "#2DD4A8" }} />
            <span className="text-sm font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>Veritas</span>
          </div>
          <div className="flex items-center gap-1">
            {["Home", "Analyze", "History", "Statistics", "Methodology"].map((label) => (
              <Button key={label} variant="ghost" className="cursor-pointer hidden sm:inline-flex text-[11px] h-8 px-3"
                style={{ color: "#7A8280" }}
                onClick={() => navigate("/dashboard")}>
                {label}
              </Button>
            ))}
            <div className="w-px h-4 mx-2" style={{ background: "#1E2522" }} />
            <MagneticBtn
              className="cursor-pointer text-[11px] font-semibold h-8 px-5 rounded"
              style={{ background: "#2DD4A8", color: "#0A0D0C", letterSpacing: "0.05em" }}
              onClick={() => navigate("/dashboard")}>
              START ANALYZING
            </MagneticBtn>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#0A0D0C" }}>
        {/* Grid dot background */}
        <div className="absolute inset-0 grid-dot-bg opacity-50" />
        {/* 3D Scene */}
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        {/* Content overlay */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 mx-auto max-w-6xl px-5 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: "#2DD4A8" }} />
                  <span className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: "#2DD4A8" }}>Intelligent Verification</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl sm:text-7xl lg:text-[6.5rem] leading-[0.95] tracking-tight mb-4"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>
                VERITAS
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-2xl sm:text-3xl lg:text-4xl leading-tight mb-6 min-h-[1.2em]"
                style={{ color: "#7A8280" }}>
                <AnimatedTagline />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-sm sm:text-base max-w-lg leading-relaxed mb-10"
                style={{ color: "#7A8280" }}>
                An intelligent misinformation detection system that analyzes language,
                source credibility and logical consistency.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="flex flex-col sm:flex-row items-start gap-4">
                <MagneticBtn
                  className="cursor-pointer gap-2 px-8 py-3.5 text-xs font-semibold rounded flex items-center"
                  style={{ background: "#2DD4A8", color: "#0A0D0C", letterSpacing: "0.1em" }}
                  onClick={() => navigate("/dashboard")}>
                  START ANALYZING <ArrowRight className="w-4 h-4" />
                </MagneticBtn>
                <Button size="lg" variant="outline" className="cursor-pointer gap-2 px-8 py-3.5 text-xs rounded"
                  style={{ borderColor: "#1E2522", color: "#7A8280", letterSpacing: "0.05em" }}
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  EXPLORE VERITAS
                </Button>
              </motion.div>

              {/* Technical indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mt-14 flex items-center gap-6 flex-wrap">
                {[
                  { label: "NLP ANALYSIS", value: "70+" },
                  { label: "SOURCE CREDIBILITY", value: "95%+" },
                  { label: "LOGICAL CONSISTENCY", value: "<1s" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className="w-1 h-1 rounded-full" style={{ background: "#2DD4A8" }} />
                    <div>
                      <span className="text-[9px] tracking-[0.15em] uppercase block" style={{ color: "#7A8280" }}>{item.label}</span>
                      <span className="text-xs font-semibold" style={{ color: "#E8E4DC" }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: spacer for 3D scene visibility on desktop */}
            <div className="hidden lg:block" />
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-10" style={{ background: "linear-gradient(transparent, #0A0D0C)" }} />
      </section>

      {/* ─── Stats Bar ─── */}
      <Section className="py-12 px-5 border-y" style={{ borderColor: "#1E2522" }}>
        <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: 70, suffix: "+", label: "NLP Patterns" },
            { value: 21, suffix: "", label: "Categories" },
            { value: 95, suffix: "%+", label: "Accuracy" },
            { value: 1, suffix: "s", label: "Analysis Time" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>
                <CountUp target={s.value} />{s.suffix}
              </div>
              <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: "#7A8280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Verdict Examples ─── */}
      <Section className="py-24 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[40px]" style={{ background: "#2DD4A8" }} />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: "#2DD4A8" }}>Detection Results</span>
          </div>
          <h2 className="text-3xl sm:text-4xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>What You'll Get</h2>
          <p className="text-sm mb-12 max-w-md" style={{ color: "#7A8280" }}>Every analysis delivers a clear, evidence-backed verdict.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {verdictExamples.map((v, i) => (
              <motion.div key={v.verdict}
                initial={{ opacity: 0, y: 40, rotateX: 12 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}>
                <Card3D className="rounded-lg p-6 relative overflow-hidden"
                  style={{ background: "#111614", border: "1px solid #1E2522" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: v.color }} />
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `${v.color}10` }}>
                      <v.icon className="w-4 h-4" style={{ color: v.color }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: v.color, fontFamily: "'DM Serif Display', serif" }}>{v.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-3xl font-bold" style={{ color: v.color, fontFamily: "'DM Serif Display', serif" }}>{v.confidence}%</span>
                    <span className="text-[10px] tracking-[0.1em] uppercase" style={{ color: "#7A8280" }}>Confidence</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#7A8280" }}>{v.sample}</p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── How It Works ─── */}
      <Section className="py-24 px-5 border-t" id="how-it-works" style={{ borderColor: "#1E2522" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="h-px flex-1 max-w-[40px]" style={{ background: "#2DD4A8" }} />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: "#2DD4A8" }}>Our Approach</span>
              <div className="h-px flex-1 max-w-[40px]" style={{ background: "#2DD4A8" }} />
            </div>
            <h2 className="text-3xl sm:text-4xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>How Veritas Works</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#7A8280" }}>Advanced NLP with proven fact-checking methodologies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 40, rotateX: 12 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}>
                <Card3D className="rounded-lg p-6"
                  style={{ background: "#111614", border: "1px solid #1E2522" }}>
                  <div className="w-11 h-11 rounded flex items-center justify-center mb-4" style={{ background: "rgba(45,212,168,0.06)" }}>
                    <s.icon className="w-5 h-5" style={{ color: "#2DD4A8" }} />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "#2DD4A8", opacity: 0.6 }}>STEP {s.step}</span>
                  <h3 className="mt-1.5 text-lg" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "#7A8280" }}>{s.description}</p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Features ─── */}
      <Section className="py-24 px-5 border-t" style={{ borderColor: "#1E2522" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="h-px flex-1 max-w-[40px]" style={{ background: "#C4985A" }} />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: "#C4985A" }}>Capabilities</span>
              <div className="h-px flex-1 max-w-[40px]" style={{ background: "#C4985A" }} />
            </div>
            <h2 className="text-3xl sm:text-4xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>Built for Media Literacy</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 32, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                <Card3D className="rounded-lg p-5"
                  style={{ background: "#111614", border: "1px solid #1E2522" }}>
                  <div className="w-9 h-9 rounded flex items-center justify-center mb-3" style={{ background: "rgba(45,212,168,0.06)" }}>
                    <f.icon className="w-4 h-4" style={{ color: "#2DD4A8" }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#E8E4DC" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#7A8280" }}>{f.description}</p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Academic References ─── */}
      <Section className="py-24 px-5 border-t" style={{ borderColor: "#1E2522" }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg p-8 sm:p-10 text-center relative overflow-hidden"
            style={{ background: "#111614", border: "1px solid #1E2522" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #2DD4A8, transparent)" }} />
            <div className="w-11 h-11 rounded flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(45,212,168,0.06)" }}>
              <FileCheck className="w-5 h-5" style={{ color: "#2DD4A8" }} />
            </div>
            <h2 className="text-xl sm:text-2xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>Academically Grounded</h2>
            <p className="text-sm max-w-lg mx-auto mb-7 leading-relaxed" style={{ color: "#7A8280" }}>Detection heuristics informed by research from leading institutions.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {references.map((ref) => (
                <span key={ref} className="text-[11px] px-3 py-1.5 rounded"
                  style={{ background: "#1A1F1D", color: "#7A8280", border: "1px solid #1E2522" }}>{ref}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[{ icon: Users, label: "Named Sources", desc: "Credibility tracking" }, { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" }, { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" }, { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" }].map((item, i) => (
                <motion.div key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}>
                  <div className="rounded p-3" style={{ background: "#1A1F1D" }}>
                    <item.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: "#2DD4A8" }} />
                    <span className="text-[11px] font-semibold block" style={{ color: "#E8E4DC" }}>{item.label}</span>
                    <span className="text-[9px]" style={{ color: "#7A8280" }}>{item.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="py-24 px-5 border-t" style={{ borderColor: "#1E2522" }}>
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg px-8 py-16 sm:px-14 relative overflow-hidden"
            style={{ background: "#111614", border: "1px solid #1E2522" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #2DD4A8, transparent)" }} />
            <Shield className="w-8 h-8 mx-auto mb-5" style={{ color: "#2DD4A8" }} />
            <h2 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>Ready to Fact-Check?</h2>
            <p className="mt-3 text-sm max-w-sm mx-auto" style={{ color: "#7A8280" }}>No sign-up required. Paste any article and get an instant, evidence-backed verdict.</p>
            <MagneticBtn
              className="cursor-pointer mt-8 gap-2 px-8 py-3.5 text-xs font-semibold rounded inline-flex items-center"
              style={{ background: "#2DD4A8", color: "#0A0D0C", letterSpacing: "0.1em" }}
              onClick={() => navigate("/dashboard")}>
              LAUNCH VERITAS <ArrowRight className="w-4 h-4" />
            </MagneticBtn>
          </motion.div>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="py-6 px-5 border-t" style={{ borderColor: "#1E2522" }}>
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: "#2DD4A8" }} />
            <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#E8E4DC" }}>Veritas</span>
          </div>
          <p className="text-[10px]" style={{ color: "#7A8280" }}>BSc Data Science — NLP-Based Misinformation Detection</p>
        </div>
      </footer>
    </div>
  );
}
