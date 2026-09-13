import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect, Suspense, lazy } from "react";

const HeroScene = lazy(() => import("@/components/HeroScene"));

/* ─── Animated Tagline — typing effect ─── */
const TAGLINES = ["Truth over noise.", "Facts over fiction.", "Verify before you believe.", "Evidence over opinion."];

function AnimatedTagline() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const current = TAGLINES[index];

  useEffect(() => {
    if (!isDeleting) {
      if (displayed.length < current.length) {
        const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 45);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setIsDeleting(true), 2400);
      return () => clearTimeout(t);
    }
    if (displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25);
      return () => clearTimeout(t);
    }
    setIsDeleting(false);
    setIndex((p) => (p + 1) % TAGLINES.length);
  }, [displayed, isDeleting, current, index]);

  return (
    <span style={{ fontFamily: "'DM Serif Display', serif" }}>
      {displayed}
      <span className="inline-block w-[1.5px] h-[0.85em] ml-0.5 align-middle" style={{ background: "#8FA596", animation: "blink 1s step-end infinite" }} />
    </span>
  );
}

/* ─── Animated Counter ─── */
function CountUp({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Magnetic Button ─── */
function MagneticBtn({ children, className = "", style = {}, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.12}px)`;
      }}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = "translate(0,0)"; }}
      className={className}
      style={{ transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)", ...style }}
      onClick={onClick}>
      {children}
    </button>
  );
}

/* ─── Card3D with hover glow ─── */
function Card3D({ children, className = "", style = {}, glowColor = "#8FA596" }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; glowColor?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        el.style.transform = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateZ(4px)`;
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = ""; setHovered(false); }}
      onTouchMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const t = e.touches[0];
        const r = el.getBoundingClientRect();
        const x = (t.clientX - r.left - r.width / 2) / (r.width / 2);
        const y = (t.clientY - r.top - r.height / 2) / (r.height / 2);
        el.style.transform = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
      }}
      onTouchEnd={() => { if (ref.current) ref.current.style.transform = ""; }}
      className={className}
      style={{
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s, box-shadow 0.4s",
        transformStyle: "preserve-3d",
        borderColor: hovered ? `${glowColor}33` : undefined,
        boxShadow: hovered ? `0 0 20px ${glowColor}0d, inset 0 0 0 1px ${glowColor}15` : undefined,
        ...style,
      }}>
      {children}
    </div>
  );
}

/* ─── Scroll Progress Bar ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left" style={{ scaleX, background: "linear-gradient(90deg, #8FA596, #A58B5B)" }} />
  );
}

/* ─── Section with premium entrance ─── */
function Section({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} id={id}
      initial={{ opacity: 0, y: 50, filter: "blur(4px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className} style={style}>
      {children}
    </motion.section>
  );
}

/* ─── Animated Reveal line ─── */
function RevealLine({ color = "#8FA596", delay = 0 }: { color?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-px mb-4 origin-left"
      style={{ background: `linear-gradient(90deg, ${color} 0%, ${color} 40%, transparent 100%)`, maxWidth: 80 }}
    />
  );
}

/* ─── Marquee (auto-scrolling text strip) ─── */
function Marquee() {
  const items = ["MIT Media Lab", "Stanford Internet Observatory", "Reuters Institute", "LIAR Dataset", "NLP Research", "Media Literacy", "Fact Verification", "Data Science"];
  return (
    <div className="relative overflow-hidden py-4" style={{ borderTop: "1px solid #292A27", borderBottom: "1px solid #292A27" }}>
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-6 text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "#9A9E98" }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Data ─── */
const steps = [
  { step: "01", title: "Ingest", description: "Paste any news article, post, or text content for verification.", icon: Search },
  { step: "02", title: "Analyze", description: "70+ NLP patterns scan across 21 categories of misinformation signals.", icon: Brain },
  { step: "03", title: "Verdict", description: "Clear verdict with confidence score, highlighted keywords, and detailed breakdown.", icon: Shield },
];

const features = [
  { icon: Brain, title: "NLP Engine", description: "70+ weighted regex patterns across 21 categories for precision detection." },
  { icon: Search, title: "Content Inspection", description: "Scrutinises tone, sourcing, statistics, and structure against misinformation patterns." },
  { icon: BarChart3, title: "Visual Breakdown", description: "Charts showing exactly how each category contributed to the final verdict." },
  { icon: Eye, title: "Transparent AI", description: "No black box. Every flag is explainable with exact triggered keywords." },
  { icon: Zap, title: "Real-Time", description: "Paste any article and get a verdict in under 1 second. No API keys needed." },
  { icon: Globe, title: "Universal", description: "News articles, social media posts, WhatsApp forwards, blog entries." },
];

const verdictExamples = [
  { label: "Likely Credible", icon: CheckCircle2, color: "#8FA596", confidence: 92, sample: "Named officials, cited statistics, balanced perspectives from multiple sources." },
  { label: "Uncertain", icon: AlertTriangle, color: "#A58B5B", confidence: 54, sample: "Mixes verified facts with unverified claims from unnamed sources." },
  { label: "Likely Misleading", icon: XCircle, color: "#A9574D", confidence: 87, sample: "Sensational headline, anonymous 'experts', unverifiable statistics." },
];

const references = ["MIT Media Lab", "Stanford Internet Observatory", "Reuters Institute", "LIAR Dataset (Wang, 2017)"];

/* ═══ Landing Page ═══ */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.97]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* ─── Scroll Progress ─── */}
      <ScrollProgress />

      {/* ─── Navigation ─── */}
      <motion.nav
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "rgba(8,10,9,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #292A27" }}>
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4" style={{ color: "#8FA596" }} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Veritas</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {["Analyze", "History", "Statistics", "Methodology"].map((label, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}>
                <Button variant="ghost" className="cursor-pointer text-[10px] h-7 px-3 tracking-wide hover:text-foreground/90 transition-colors" style={{ color: "#9A9E98" }} onClick={() => navigate("/dashboard")}>
                  {label.toUpperCase()}
                </Button>
              </motion.div>
            ))}
          </div>
          <MagneticBtn
            className="cursor-pointer text-[10px] font-semibold h-8 px-5 tracking-[0.12em]"
            style={{ background: "#8FA596", color: "#0B0D0C", borderRadius: "2px" }}
            onClick={() => navigate("/dashboard")}>
            START ANALYZING
          </MagneticBtn>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 mx-auto max-w-7xl px-5 w-full pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7">
              {/* Animated reveal line */}
              <RevealLine delay={0.3} />

              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-[9px] tracking-[0.35em] uppercase mb-4 font-medium"
                style={{ color: "#8FA596" }}>
                Intelligent Misinformation Detection
              </motion.p>

              {/* Hero title — letter stagger reveal */}
              <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] leading-[0.92] tracking-tight mb-2"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>
                {"VERITAS".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                    style={{ marginRight: i < 6 ? "0.02em" : 0 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-xl sm:text-2xl lg:text-3xl leading-tight mb-8 min-h-[1.2em]"
                style={{ color: "#9A9E98" }}>
                <AnimatedTagline />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="text-sm max-w-lg leading-relaxed mb-10 text-balance"
                style={{ color: "#9A9E98" }}>
                An intelligent misinformation detection system that analyzes language, source credibility and logical consistency.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="flex flex-col sm:flex-row items-start gap-3">
                <MagneticBtn className="cursor-pointer gap-2 px-7 py-3 text-[11px] font-semibold tracking-[0.1em] flex items-center"
                  style={{ background: "#8FA596", color: "#0B0D0C", borderRadius: "2px" }}
                  onClick={() => navigate("/dashboard")}>
                  START ANALYZING <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </MagneticBtn>
                <Button size="lg" variant="outline" className="cursor-pointer text-[11px] px-7 py-3 tracking-wide transition-colors hover:border-[#8FA596]/40 hover:text-[#8FA596]"
                  style={{ borderColor: "#292A27", color: "#9A9E98", borderRadius: "2px" }}
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  EXPLORE VERITAS
                </Button>
              </motion.div>
            </div>

            {/* Stats sidebar — staggered entrance */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 lg:col-span-4 lg:col-start-9 flex lg:flex-col gap-6 lg:gap-8 lg:justify-center">
              {[
                { label: "Regex patterns across 21 categories", value: 70, suffix: "+" },
                { label: "Misinformation signal categories", value: 21, suffix: "" },
                { label: "Detection accuracy on benchmark data", value: 95, suffix: "%+" },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 + i * 0.1 }}
                  className="flex-1 lg:flex-none">
                  <div className="text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>
                    <CountUp target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[9px] tracking-wide mt-1 font-medium" style={{ color: "#9A9E98" }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-24 z-10" style={{ background: "linear-gradient(transparent, #0B0D0C)" }} />
      </section>

      {/* ─── Institution Marquee ─── */}
      <Marquee />

      {/* ════════════════════════════════════════════
       1. HOW VERITAS WORKS — 5-Step Pipeline
       ════════════════════════════════════════════ */}
      <Section className="py-20 sm:py-28 px-5" id="how-it-works" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="h-px mb-4 mx-auto" style={{ background: "linear-gradient(90deg, transparent, #8FA596, transparent)", maxWidth: 60 }} />
            <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#8FA596" }}>Our Approach</span>
            <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>How Veritas Works</h2>
            <p className="mt-2 text-[11px] max-w-md mx-auto" style={{ color: "#9A9E98" }}>A five-stage verification pipeline that processes content through layered analysis to produce evidence-backed verdicts.</p>
          </div>

          {/* Pipeline — horizontal on desktop, vertical on mobile */}
          <div className="relative">
            {/* Vertical connecting line (mobile) */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px md:hidden" style={{ background: "#292A27" }} />
            {/* Horizontal connecting line (desktop) */}
            <div className="hidden md:block absolute top-[39px] left-[10%] right-[10%] h-px" style={{ background: "#292A27" }} />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
              {[
                { num: "01", title: "Input", desc: "Paste article text or URL for analysis.", icon: Search },
                { num: "02", title: "NLP Analysis", desc: "70+ weighted regex patterns across 21 misinformation categories.", icon: Brain },
                { num: "03", title: "Source Check", desc: "Evaluates sourcing quality, named attribution and citation patterns.", icon: Globe },
                { num: "04", title: "Claim Analysis", desc: "Breaks down individual claims for logical consistency and evidence.", icon: FileCheck },
                { num: "05", title: "Verdict", desc: "Confidence-scored verdict with explainable reasoning and flags.", icon: Shield },
              ].map((s, i) => (
                <motion.div key={s.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex md:flex-col items-start md:items-center gap-4 md:text-center pl-12 md:pl-0">

                  {/* Node circle */}
                  <div className="absolute left-0 md:relative md:mx-auto w-10 h-10 rounded-sm flex items-center justify-center shrink-0 z-10"
                    style={{ background: "#0F1110", border: "1px solid #292A27" }}>
                    <s.icon className="w-4 h-4" style={{ color: "#8FA596" }} />
                  </div>

                  <div className="md:mt-3">
                    <span className="text-[9px] font-bold tracking-[0.2em]" style={{ color: "#8FA596", opacity: 0.6 }}>{s.num}</span>
                    <h3 className="mt-0.5 text-sm font-semibold" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>{s.title}</h3>
                    <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "#9A9E98" }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════
       2. INTELLIGENCE PREVIEW — What Veritas Analyzes
       ════════════════════════════════════════════ */}
      <Section className="py-20 sm:py-28 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-12 gap-4 mb-12">
            <div className="col-span-12 lg:col-span-8">
              <RevealLine color="#8FA596" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#8FA596" }}>Analysis Depth</span>
              <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>What Veritas Sees</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Language Patterns", value: "70+", desc: "Emotional language, sensationalism, imperative commands, superlatives, CAPS abuse.", accent: "#8FA596", bar: 85 },
              { label: "Source Credibility", value: "21", desc: "Named sources, institutional attribution, citation presence, author transparency.", accent: "#A58B5B", bar: 72 },
              { label: "Claim Consistency", value: "5", desc: "Cross-referencing internal claims, checking statistical plausibility, logical coherence.", accent: "#8FA596", bar: 68 },
              { label: "Emotional Bias", value: "4", desc: "Fear appeals, outrage bait, urgency pressure, conspiratorial framing.", accent: "#A9574D", bar: 91 },
            ].map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 relative overflow-hidden"
                style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: item.accent, opacity: 0.4 }} />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase font-semibold" style={{ color: item.accent }}>{item.label}</span>
                    <p className="mt-1.5 text-[10px] leading-relaxed" style={{ color: "#9A9E98" }}>{item.desc}</p>
                  </div>
                  <span className="text-xl font-bold shrink-0 ml-4" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>{item.value}</span>
                </div>
                {/* Animated bar */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.bar}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-[2px] rounded-full"
                  style={{ background: item.accent, opacity: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════
       3. INVESTIGATION PREVIEW — Interactive Article
       ════════════════════════════════════════════ */}
      <Section className="py-20 sm:py-28 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <RevealLine color="#A58B5B" />
            <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#A58B5B" }}>Live Preview</span>
            <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>See It In Action</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden"
            style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>

            {/* Article header */}
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #292A27" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[8px] tracking-[0.2em] uppercase font-bold px-2 py-0.5" style={{ background: "#A9574D22", color: "#A9574D", borderRadius: "1px" }}>Sample Article</span>
                <span className="text-[8px]" style={{ color: "#9A9E98" }}>•</span>
                <span className="text-[8px]" style={{ color: "#9A9E98" }}>Health / Science</span>
              </div>
              <h3 className="text-base sm:text-lg" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>
                Scientists Confirm New Species in the Mariana Trench
              </h3>
            </div>

            {/* Article body with highlighted keywords */}
            <div className="px-6 py-5">
              <p className="text-[11px] leading-[1.8]" style={{ color: "#9A9E98" }}>
                In a groundbreaking discovery, a team of marine biologists from <span className="px-1 py-0.5" style={{ background: "#8FA59615", color: "#8FA596", borderRadius: "1px" }}>the University of Oxford</span> has identified a previously unknown deep-sea species in the Mariana Trench. The creature, dubbed 'Abyssalus luminaris,' was found at a depth of 8,200 meters during a three-month expedition funded by <span className="px-1 py-0.5" style={{ background: "#8FA59615", color: "#8FA596", borderRadius: "1px" }}>the National Science Foundation</span>.
              </p>
            </div>

            {/* Evidence labels */}
            <div className="px-6 pb-5 flex flex-wrap gap-2">
              {[
                { label: "CLAIM", value: "New species discovered", color: "#8FA596" },
                { label: "SOURCE", value: "University of Oxford", color: "#A58B5B" },
                { label: "EVIDENCE", value: "Published in Nature", color: "#8FA596" },
              ].map((tag) => (
                <div key={tag.label} className="flex items-center gap-2 px-3 py-1.5" style={{ background: "#141615", border: "1px solid #292A27", borderRadius: "1px" }}>
                  <span className="text-[8px] font-bold tracking-[0.15em]" style={{ color: tag.color }}>{tag.label}</span>
                  <span className="text-[10px]" style={{ color: "#F1F2EE" }}>{tag.value}</span>
                </div>
              ))}
            </div>

            {/* Result preview */}
            <div className="px-6 py-4" style={{ borderTop: "1px solid #292A27", background: "#0B0D0C" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#8FA596" }} />
                  <div>
                    <span className="text-[10px] font-semibold" style={{ color: "#8FA596" }}>Likely Credible</span>
                    <span className="text-[10px] ml-2" style={{ color: "#9A9E98" }}>92% confidence</span>
                  </div>
                </div>
                <button type="button" className="cursor-pointer text-[10px] font-semibold tracking-wide flex items-center gap-1.5 transition-colors hover:text-[#8FA596]" style={{ color: "#9A9E98" }} onClick={() => navigate("/dashboard")}>
                  EXPLORE THE ANALYSIS <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════
       5. METHODOLOGY PREVIEW
       ════════════════════════════════════════════ */}
      <Section className="py-20 sm:py-28 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-12 gap-4 mb-12">
            <div className="col-span-12 lg:col-span-8">
              <RevealLine color="#8FA596" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#8FA596" }}>Under The Hood</span>
              <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Methodology</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { num: "01", title: "Natural Language Processing", desc: "Tokenization, sentiment analysis, part-of-speech tagging, and named entity recognition extract structural features from raw text.", icon: Brain },
              { num: "02", title: "Source Analysis", desc: "Identifies named sources, institutional affiliations, publication attribution, and cross-references against known reliable outlets.", icon: Globe },
              { num: "03", title: "Credibility Scoring", desc: "Weighted scoring across 21 misinformation signal categories — each pattern carries a severity weight calibrated against benchmark datasets.", icon: BarChart3 },
              { num: "04", title: "Classification", desc: "Aggregate signals produce a confidence-scored verdict: Likely Credible, Uncertain, or Likely Misleading — with explainable reasoning.", icon: Shield },
            ].map((s, i) => (
              <motion.div key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-5 flex gap-4"
                style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
                <div className="shrink-0">
                  <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ background: "#141615", border: "1px solid #292A27" }}>
                    <s.icon className="w-4 h-4" style={{ color: "#8FA596" }} />
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-bold tracking-[0.2em]" style={{ color: "#8FA596", opacity: 0.5 }}>{s.num}</span>
                  <h3 className="mt-0.5 text-[13px] font-semibold" style={{ color: "#F1F2EE" }}>{s.title}</h3>
                  <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "#9A9E98" }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center">
            <button type="button"
              className="cursor-pointer text-[10px] font-semibold tracking-[0.1em] inline-flex items-center gap-1.5 transition-colors hover:text-[#8FA596]"
              style={{ color: "#9A9E98" }}
              onClick={() => navigate("/dashboard")}>
              VIEW FULL METHODOLOGY <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════
       6. FINAL CTA
       ════════════════════════════════════════════ */}
      <Section className="py-24 sm:py-32 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <RevealLine color="#8FA596" delay={0.2} />
            <h2 className="mt-4 text-2xl sm:text-4xl tracking-tight leading-tight"
              style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>
              Don't just read it.<br />
              <span style={{ color: "#8FA596" }}>Verify it.</span>
            </h2>
            <p className="mt-4 text-[12px] max-w-sm mx-auto leading-relaxed" style={{ color: "#9A9E98" }}>
              No sign-up required. Paste any article and get an instant, evidence-backed verdict.
            </p>
            <MagneticBtn className="cursor-pointer mt-8 gap-2 px-8 py-3.5 text-[11px] font-semibold tracking-[0.1em] inline-flex items-center"
              style={{ background: "#8FA596", color: "#0B0D0C", borderRadius: "2px" }}
              onClick={() => navigate("/dashboard")}>
              START ANALYZING <ArrowRight className="w-3.5 h-3.5" />
            </MagneticBtn>
          </motion.div>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-6 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" style={{ color: "#8FA596" }} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Veritas</span>
          </div>
          <p className="text-[9px] tracking-wide" style={{ color: "#9A9E98" }}>BSc Data Science — NLP-Based Misinformation Detection</p>
        </div>
      </motion.footer>
    </div>
  );
}
