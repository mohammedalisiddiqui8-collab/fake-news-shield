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

      {/* ─── Verdict Examples ─── */}
      <Section className="py-20 sm:py-28 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-12 gap-4 mb-14">
            <div className="col-span-12 lg:col-span-8">
              <RevealLine color="#8FA596" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#8FA596" }}>Detection Results</span>
              <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>What You'll Get</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {verdictExamples.map((v, i) => (
              <motion.div key={v.label}
                initial={{ opacity: 0, y: 40, rotateX: 8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}>
                <Card3D glowColor={v.color} className="p-5 relative overflow-hidden"
                  style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: v.color }} />
                  <div className="flex items-center gap-2 mb-3">
                    <v.icon className="w-4 h-4" style={{ color: v.color }} />
                    <span className="text-[11px] font-semibold" style={{ color: v.color, fontFamily: "'DM Serif Display', serif" }}>{v.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-3xl font-bold" style={{ color: v.color, fontFamily: "'DM Serif Display', serif" }}>{v.confidence}</span>
                    <span className="text-[10px] tracking-[0.1em] uppercase" style={{ color: "#9A9E98" }}>% Confidence</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#9A9E98" }}>{v.sample}</p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── How It Works ─── */}
      <Section className="py-20 sm:py-28 px-5" id="how-it-works" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="h-px mb-4 mx-auto" style={{ background: "linear-gradient(90deg, transparent, #8FA596, transparent)", maxWidth: 60 }} />
            <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#8FA596" }}>Our Approach</span>
            <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>How Veritas Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {steps.map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 40, rotateX: 8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}>
                <Card3D className="p-5"
                  style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4" style={{ background: "rgba(62,232,184,0.05)" }}>
                    <s.icon className="w-4 h-4" style={{ color: "#8FA596" }} />
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.2em]" style={{ color: "#8FA596", opacity: 0.5 }}>STEP {s.step}</span>
                  <h3 className="mt-1.5 text-base" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>{s.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "#9A9E98" }}>{s.description}</p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Features ─── */}
      <Section className="py-20 sm:py-28 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-12 gap-4 mb-14">
            <div className="col-span-12 lg:col-span-8">
              <RevealLine color="#A58B5B" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#A58B5B" }}>Capabilities</span>
              <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Built for Media Literacy</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 36, rotateX: 6 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                <Card3D className="p-5"
                  style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center mb-3" style={{ background: "rgba(62,232,184,0.05)" }}>
                    <f.icon className="w-3.5 h-3.5" style={{ color: "#8FA596" }} />
                  </div>
                  <h3 className="text-[13px] font-semibold mb-1" style={{ color: "#F1F2EE" }}>{f.title}</h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#9A9E98" }}>{f.description}</p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Academic References ─── */}
      <Section className="py-20 sm:py-28 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 32, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 sm:p-10 text-center relative overflow-hidden"
            style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #8FA596, transparent)" }} />
            <div className="w-10 h-10 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(62,232,184,0.05)" }}>
              <FileCheck className="w-4 h-4" style={{ color: "#8FA596" }} />
            </div>
            <h2 className="text-lg sm:text-xl tracking-tight mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Academically Grounded</h2>
            <p className="text-[12px] max-w-md mx-auto mb-6 leading-relaxed" style={{ color: "#9A9E98" }}>Detection heuristics informed by research from leading institutions.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {references.map((ref) => (
                <motion.span key={ref}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="text-[10px] px-3 py-1.5 tracking-wide"
                  style={{ background: "#141615", color: "#9A9E98", border: "1px solid #292A27", borderRadius: "2px" }}>{ref}</motion.span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[{ icon: Users, label: "Named Sources", desc: "Credibility tracking" }, { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" }, { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" }, { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" }].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}>
                  <div className="rounded-sm p-3" style={{ background: "#141615" }}>
                    <item.icon className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color: "#8FA596" }} />
                    <span className="text-[10px] font-semibold block" style={{ color: "#F1F2EE" }}>{item.label}</span>
                    <span className="text-[8px]" style={{ color: "#9A9E98" }}>{item.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="py-20 sm:py-28 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 32, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="p-10 sm:p-14 relative overflow-hidden"
            style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #8FA596, transparent)" }} />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Shield className="w-7 h-7 mx-auto mb-4" style={{ color: "#8FA596" }} />
            </motion.div>
            <h2 className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Ready to Fact-Check?</h2>
            <p className="mt-2 text-[12px] max-w-xs mx-auto" style={{ color: "#9A9E98" }}>No sign-up required. Paste any article and get an instant, evidence-backed verdict.</p>
            <MagneticBtn className="cursor-pointer mt-6 gap-2 px-7 py-3 text-[11px] font-semibold tracking-[0.1em] inline-flex items-center"
              style={{ background: "#8FA596", color: "#0B0D0C", borderRadius: "2px" }}
              onClick={() => navigate("/dashboard")}>
              LAUNCH VERITAS <ArrowRight className="w-3.5 h-3.5" />
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
