import { motion, useInView } from "framer-motion";
import {
  Shield, Search, Brain, ArrowRight, CheckCircle2,
  AlertTriangle, XCircle, FileText, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect } from "react";

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
      <span className="inline-block w-[2px] h-[0.8em] ml-0.5 align-middle animate-pulse" style={{ background: "#174A45" }} />
    </span>
  );
}

/* ─── Section wrapper ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} id={id}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.section>
  );
}

/* ─── Live Analysis Preview ─── */
function LiveAnalysisDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  const sampleText = "In a groundbreaking discovery, a team of marine biologists from the University of Oxford has identified a previously unknown deep-sea species in the Mariana Trench. The creature, dubbed 'Abyssalus luminaris,' was found at a depth of 8,200 meters during a three-month expedition funded by the National Science Foundation. Lead researcher Dr. Sarah Chen published the findings in the journal Nature on March 15, 2025.";
  const keywords = ["University of Oxford", "Dr. Sarah Chen", "journal Nature", "National Science Foundation", "8,200 meters"];

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:gap-8 items-start">
      {/* Left: Article text with highlights */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174A45" }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#6B7268" }}>Input Article</span>
        </div>
        <div className="rounded-lg p-5 sm:p-6 relative overflow-hidden"
          style={{ background: "#FFFCF6", border: "1px solid #D8D2C5", boxShadow: "0 1px 3px rgba(30,37,34,0.04)" }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: step >= 1 ? "#174A45" : "#D8D2C5", transition: "background 0.5s" }} />
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-3.5 h-3.5" style={{ color: "#6B7268" }} />
            <span className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: "#6B7268" }}>
              {step === 0 ? "Awaiting input..." : step === 1 ? "Scanning text..." : step === 2 ? "Analyzing patterns..." : "Analysis complete"}
            </span>
          </div>
          <p className="text-[13px] leading-[1.8]" style={{ color: "#1E2522" }}>
            {keywords.map((kw, i) => {
              const idx = sampleText.indexOf(kw);
              if (idx < 0) return <span key={i}>{sampleText}</span>;
              const before = i === 0 ? sampleText.slice(0, idx) : "";
              const after = i === keywords.length - 1 ? sampleText.slice(idx + kw.length) : "";
              const isHighlighted = step >= 3;
              return (
                <span key={i}>
                  {before}
                  <span style={{
                    background: isHighlighted ? "rgba(23,74,69,0.08)" : "transparent",
                    borderBottom: isHighlighted ? "2px solid #174A45" : "2px solid transparent",
                    transition: "all 0.4s",
                    padding: "1px 2px",
                    borderRadius: "2px",
                  }}>{kw}</span>
                  {after}
                </span>
              );
            })}
          </p>
          {step >= 3 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid #E8E3D8" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#174A45" }} />
              <span className="text-[11px] font-medium" style={{ color: "#174A45" }}>5 named sources detected — strong credibility signal</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right: Verdict card */}
      <div className="lg:sticky lg:top-24">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174A45" }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#6B7268" }}>Verdict</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={step >= 3 ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 12 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg p-5 relative overflow-hidden"
          style={{ background: "#FFFCF6", border: "1px solid #D8D2C5", boxShadow: "0 4px 20px rgba(30,37,34,0.06)" }}>
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "#174A45" }} />

          {/* Confidence gauge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold mb-0.5" style={{ color: "#6B7268" }}>Confidence</p>
              <p className="text-3xl font-bold" style={{ color: "#174A45", fontFamily: "'DM Serif Display', serif" }}>92%</p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(23,74,69,0.06)", border: "3px solid #174A45" }}>
              <CheckCircle2 className="w-6 h-6" style={{ color: "#174A45" }} />
            </div>
          </div>

          <div className="mb-4">
            <span className="text-xs font-semibold" style={{ color: "#174A45" }}>Likely Credible</span>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#6B7268" }}>
              Named officials, cited statistics, balanced perspectives from multiple verifiable sources.
            </p>
          </div>

          {/* Signals */}
          <div className="space-y-2">
            {[
              { icon: CheckCircle2, label: "Named sources", value: "5 detected", color: "#174A45" },
              { icon: CheckCircle2, label: "Citations", value: "Journal reference", color: "#174A45" },
              { icon: AlertTriangle, label: "Sensationalism", value: "Low risk", color: "#B8873A" },
            ].map((signal, i) => (
              <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #F0EDE4" }}>
                <div className="flex items-center gap-1.5">
                  <signal.icon className="w-3 h-3" style={{ color: signal.color }} />
                  <span className="text-[11px]" style={{ color: "#1E2522" }}>{signal.label}</span>
                </div>
                <span className="text-[10px] font-medium" style={{ color: signal.color }}>{signal.value}</span>
              </div>
            ))}
          </div>

          {/* Red flags */}
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid #E8E3D8" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3 h-3" style={{ color: "#B34A3C" }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#B34A3C" }}>1 Red Flag</span>
            </div>
            <div className="flex items-start gap-1.5">
              <XCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#B34A3C" }} />
              <span className="text-[11px] leading-relaxed" style={{ color: "#6B7268" }}>Single-source expedition claim</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══ Landing Page ═══ */
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "#174A45" }}>
        <div className="mx-auto max-w-6xl px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5" style={{ color: "#FFFCF6" }} />
            <span className="text-sm font-bold tracking-wide uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#FFFCF6" }}>Veritas</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>Analyze</Button>
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>History</Button>
            <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs h-8" style={{ color: "rgba(255,252,246,0.8)" }} onClick={() => navigate("/dashboard")}>Methodology</Button>
            <div className="w-px h-4 mx-1" style={{ background: "rgba(255,252,246,0.2)" }} />
            <Button className="cursor-pointer text-xs h-8 px-4 rounded" style={{ background: "#FFFCF6", color: "#174A45" }} onClick={() => navigate("/dashboard")}>
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-5" style={{ background: "#F4F1EA" }}>
        <div className="mx-auto max-w-6xl">
          {/* Thin editorial rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="h-[1px] mb-8 origin-left"
            style={{ background: "#D8D2C5" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-16 items-end">
            {/* Left: Main text */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-5"
                style={{ color: "#174A45" }}>
                BSc Data Science — Third Year Project
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-7xl sm:text-8xl lg:text-[8rem] leading-[0.9] tracking-tight mb-4"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
                Veritas
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl sm:text-3xl lg:text-4xl leading-tight mb-6 min-h-[1.2em]"
                style={{ color: "#1E2522" }}>
                <AnimatedTagline />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm sm:text-base max-w-lg leading-relaxed mb-8"
                style={{ color: "#6B7268" }}>
                An NLP-powered misinformation detection system that analyzes text through
                70+ pattern categories, source credibility scoring, and logical consistency
                evaluation. Paste any article — get an evidence-backed verdict.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-start gap-3">
                <Button size="lg" className="cursor-pointer gap-2 px-7 h-11 text-sm rounded"
                  style={{ background: "#174A45", color: "#FFFCF6" }}
                  onClick={() => navigate("/dashboard")}>
                  Start Analyzing <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="cursor-pointer gap-2 px-7 h-11 text-sm rounded"
                  style={{ borderColor: "#D8D2C5", color: "#1E2522" }}
                  onClick={() => document.getElementById("live-demo")?.scrollIntoView({ behavior: "smooth" })}>
                  See It In Action
                </Button>
              </motion.div>
            </div>

            {/* Right: Editorial sidebar — date + volume */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="hidden lg:block text-right pb-2">
              <div className="h-[1px] mb-4" style={{ background: "#D8D2C5" }} />
              <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: "#6B7268" }}>{getFormattedDate()}</p>
              <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "#6B7268" }}>Vol. I — No. 001</p>
              <div className="h-[1px] mt-4" style={{ background: "#D8D2C5" }} />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174A45" }} />
                  <span className="text-[10px]" style={{ color: "#6B7268" }}>NLP-Powered</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#B8873A" }} />
                  <span className="text-[10px]" style={{ color: "#6B7268" }}>70+ Patterns</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#B34A3C" }} />
                  <span className="text-[10px]" style={{ color: "#6B7268" }}>Real-Time Analysis</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Thin Rule ─── */}
      <div className="mx-auto max-w-6xl px-5"><div className="h-[1px]" style={{ background: "#D8D2C5" }} /></div>

      {/* ─── Live Analysis Demo ─── */}
      <Section className="py-16 sm:py-24 px-5" id="live-demo">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-2" style={{ color: "#174A45" }}>Live Demo</p>
            <h2 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
              See how Veritas works
            </h2>
            <p className="text-sm mt-2 max-w-md" style={{ color: "#6B7268" }}>
              Paste an article, watch the engine analyze it in real time.
            </p>
          </div>
          <LiveAnalysisDemo />
        </div>
      </Section>

      {/* ─── Thin Rule ─── */}
      <div className="mx-auto max-w-6xl px-5"><div className="h-[1px]" style={{ background: "#D8D2C5" }} /></div>

      {/* ─── Process — editorial horizontal line ─── */}
      <Section className="py-16 sm:py-24 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-2" style={{ color: "#174A45" }}>Process</p>
            <h2 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
              Three steps to the truth
            </h2>
          </div>

          {/* Horizontal process line — desktop */}
          <div className="hidden sm:flex items-start justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-6 left-[16%] right-[16%] h-[1px]" style={{ background: "#D8D2C5" }} />

            {[
              { num: "01", title: "Paste", desc: "Drop in any article, social media post, or news text.", icon: FileText },
              { num: "02", title: "Analyze", desc: "70+ NLP patterns scan across 21 misinformation categories.", icon: Brain },
              { num: "03", title: "Verdict", desc: "Clear, evidence-backed result with flagged keywords.", icon: Shield },
            ].map((step, i) => (
              <div key={step.num} className="relative z-10 text-center px-4 w-[33%]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#FFFCF6", border: "2px solid #174A45" }}>
                  <step.icon className="w-5 h-5" style={{ color: "#174A45" }} />
                </div>
                <span className="text-[10px] font-bold tracking-[0.15em] block mb-1" style={{ color: "#B8873A" }}>
                  {step.num}
                </span>
                <h3 className="text-lg mb-1.5" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#6B7268" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Vertical process — mobile */}
          <div className="sm:hidden space-y-6 relative pl-8">
            <div className="absolute top-6 left-3 bottom-6 w-[1px]" style={{ background: "#D8D2C5" }} />
            {[
              { num: "01", title: "Paste", desc: "Drop in any article, social media post, or news text.", icon: FileText },
              { num: "02", title: "Analyze", desc: "70+ NLP patterns scan across 21 misinformation categories.", icon: Brain },
              { num: "03", title: "Verdict", desc: "Clear, evidence-backed result with flagged keywords.", icon: Shield },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#FFFCF6", border: "2px solid #174A45" }}>
                  <step.icon className="w-3 h-3" style={{ color: "#174A45" }} />
                </div>
                <span className="text-[10px] font-bold tracking-[0.15em] block mb-0.5" style={{ color: "#B8873A" }}>{step.num}</span>
                <h3 className="text-base mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#6B7268" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Thin Rule ─── */}
      <div className="mx-auto max-w-6xl px-5"><div className="h-[1px]" style={{ background: "#D8D2C5" }} /></div>

      {/* ─── Methodology Reference ─── */}
      <Section className="py-16 sm:py-24 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            {/* Left: Title */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-2" style={{ color: "#174A45" }}>Methodology</p>
              <h2 className="text-2xl sm:text-3xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
                How it detects misinformation
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: "#6B7268" }}>
                Veritas uses a multi-layered approach combining NLP heuristics with proven fact-checking research.
              </p>
            </div>

            {/* Right: Methodology cards */}
            <div className="space-y-3">
              {[
                {
                  step: "Text Processing",
                  detail: "Tokenization, sentence parsing, and part-of-speech tagging to structure raw input into analyzable components.",
                  icon: FileText,
                },
                {
                  step: "Pattern Matching",
                  detail: "70+ weighted regex patterns across 21 categories — sensationalism, anonymous sourcing, emotional manipulation, statistical anomalies, and more.",
                  icon: Search,
                },
                {
                  step: "Source Evaluation",
                  detail: "Named entity recognition identifies cited people, institutions, and publications. Credibility is scored against known reliable sources.",
                  icon: Target,
                },
                {
                  step: "Risk Scoring",
                  detail: "Severity-weighted scoring combines all signals into a single confidence metric, using heuristics informed by research from Stanford Internet Observatory and Reuters Institute.",
                  icon: Brain,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg" style={{ background: "#FFFCF6", border: "1px solid #D8D2C5" }}>
                  <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(23,74,69,0.06)" }}>
                    <item.icon className="w-4 h-4" style={{ color: "#174A45" }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "#1E2522" }}>{item.step}</h3>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#6B7268" }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* References */}
          <div className="mt-10 pt-6" style={{ borderTop: "1px solid #D8D2C5" }}>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "#6B7268" }}>Research references</p>
            <div className="flex flex-wrap gap-2">
              {["MIT Media Lab", "Stanford Internet Observatory", "Reuters Institute", "LIAR Dataset (Wang, 2017)"].map((ref) => (
                <span key={ref} className="text-[11px] px-3 py-1.5 rounded"
                  style={{ background: "#EDE8DE", color: "#6B7268", border: "1px solid #D8D2C5" }}>
                  {ref}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="py-16 sm:py-24 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl tracking-tight mb-4"
            style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
            Ready to fact-check?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#6B7268" }}>
            No sign-up required. Paste any article and get an instant, evidence-backed verdict.
          </p>
          <Button size="lg" className="cursor-pointer gap-2 px-8 h-12 text-sm rounded"
            style={{ background: "#174A45", color: "#FFFCF6" }}
            onClick={() => navigate("/dashboard")}>
            Launch Veritas <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="py-6 px-5" style={{ borderTop: "1px solid #D8D2C5" }}>
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: "#174A45" }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Veritas</span>
          </div>
          <p className="text-[10px]" style={{ color: "#6B7268" }}>BSc Data Science — NLP-Based Misinformation Detection</p>
        </div>
      </footer>
    </div>
  );
}
