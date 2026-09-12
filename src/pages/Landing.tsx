import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect, Suspense, lazy, useCallback } from "react";

const HeroScene = lazy(() => import("@/components/HeroScene"));

/* ─── Animated Tagline — smoke / dissolve (particles from letter shapes) ─── */
const TAGLINES = [
  "Facts over fiction.",
  "Verify before you believe.",
  "Truth over noise.",
  "Evidence over opinion.",
];

interface SmokeParticle {
  x: number; y: number;
  tx: number; ty: number;          // target (reform destination)
  vx: number; vy: number;          // current velocity
  life: number; maxLife: number;
  size: number;
  opacity: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  delay: number;                   // 0-1, relative start within the transition window
}

function AnimatedTagline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const particlesRef = useRef<SmokeParticle[]>([]);
  const phaseRef = useRef<"idle" | "dissolving" | "forming">("idle");
  const phaseStartRef = useRef(0);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const prefersReducedMotion = useRef(false);

  // ─── Detect reduced motion ───
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ─── Setup canvas + sizes ───
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvasSizeRef.current = { w, h };
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect();
      canvasSizeRef.current = { w: r.width, h: r.height };
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      const c = canvas.getContext("2d");
      if (c) c.scale(dpr, dpr);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ─── Sample text pixel positions ───
  const sampleText = useCallback((text: string): Array<{ x: number; y: number }> => {
    const { w, h } = canvasSizeRef.current;
    if (w === 0 || h === 0) return [];

    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const octx = offscreen.getContext("2d");
    if (!octx) return [];

    // Measure and render the text
    const baseSize = Math.min(w * 0.065, 36);
    octx.font = `500 ${baseSize}px 'DM Serif Display', 'Georgia', serif`;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "white";
    octx.fillText(text, w / 2, h / 2);

    const imgData = octx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    const points: Array<{ x: number; y: number }> = [];
    const step = 3;

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        if (pixels[i + 3] > 80) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }, []);

  // ─── Create smoke particles from letter shapes ───
  const createParticles = useCallback((
    oldText: string,
    newText: string,
  ): SmokeParticle[] => {
    const oldPts = sampleText(oldText);
    const newPts = sampleText(newText);
    if (oldPts.length === 0 || newPts.length === 0) return [];

    // Subsample old points to cap particle count
    const maxParticles = 400;
    const sampled: Array<{ x: number; y: number }> = [];
    const step = Math.max(1, Math.floor(oldPts.length / maxParticles));
    for (let i = 0; i < oldPts.length && sampled.length < maxParticles; i += step) {
      sampled.push(oldPts[i]);
    }

    const particles: SmokeParticle[] = sampled.map((pt) => {
      // Pick a random new-text point as the reform target
      const target = newPts[Math.floor(Math.random() * newPts.length)];
      const angle = Math.random() * Math.PI * 2;
      const drift = 0.6 + Math.random() * 1.2;
      return {
        x: pt.x,
        y: pt.y,
        tx: target.x,
        ty: target.y,
        vx: Math.cos(angle) * drift,
        vy: Math.sin(angle) * drift - 0.3, // slight upward drift
        life: 1,
        maxLife: 1,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.45 + Math.random() * 0.35,
        color: Math.random() > 0.3 ? "#C8CEC6" : "#8FA596",
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        delay: Math.random() * 0.25,
      };
    });
    return particles;
  }, [sampleText]);

  // ─── Main animation loop ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let lastTick = performance.now();
    let idleTimer = 0;

    const DISOLVE_DUR = 1300;
    const FORM_DUR = 900;
    const TOTAL = DISOLVE_DUR + FORM_DUR;
    const IDLE = 3200; // pause between transitions

    // turbulence helper
    const turb = (x: number, y: number, t: number, scale: number) => {
      const s = scale || 0.008;
      return (
        Math.sin(x * s + t * 0.6) * Math.cos(y * s * 1.3 + t * 0.4) * 0.5 +
        Math.sin((x + y) * s * 0.7 + t * 0.8) * 0.3 +
        Math.cos(x * s * 1.6 - y * s + t * 0.5) * 0.2
      );
    };

    const frame = (now: number) => {
      animId = requestAnimationFrame(frame);
      const dt = Math.min(now - lastTick, 50);
      lastTick = now;

      const { w, h } = canvasSizeRef.current;
      if (w === 0) return;
      ctx.clearRect(0, 0, w, h);

      const phase = phaseRef.current;
      const elapsed = now - phaseStartRef.current;
      const particles = particlesRef.current;

      // ── IDLE: draw current text ──
      if (phase === "idle") {
        idleTimer += dt;

        // draw text
        const baseSize = Math.min(w * 0.065, 36);
        ctx.font = `500 ${baseSize}px 'DM Serif Display', 'Georgia', serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#C8CEC6";
        ctx.fillText(TAGLINES[indexRef.current], w / 2, h / 2);

        if (idleTimer >= IDLE) {
          // begin transition
          const oldIdx = indexRef.current;
          const newIdx = (oldIdx + 1) % TAGLINES.length;
          particlesRef.current = createParticles(TAGLINES[oldIdx], TAGLINES[newIdx]);
          phaseRef.current = "dissolving";
          phaseStartRef.current = now;
          idleTimer = 0;
        }
        return;
      }

      // ── DISSOLVE / FORM ──
      const progress = Math.min(elapsed / TOTAL, 1);

      // Background text: cross-dissolve
      const oldAlpha = Math.max(0, 1 - progress * 1.8);
      const newAlpha = Math.max(0, progress * 2 - 0.8);

      const baseSize = Math.min(w * 0.065, 36);
      ctx.font = `500 ${baseSize}px 'DM Serif Display', 'Georgia', serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // old text fading out (behind particles)
      if (oldAlpha > 0.01) {
        ctx.globalAlpha = oldAlpha * 0.6;
        ctx.fillStyle = "#C8CEC6";
        ctx.fillText(TAGLINES[indexRef.current], w / 2, h / 2);
      }

      // new text fading in (behind particles)
      if (newAlpha > 0.01) {
        ctx.globalAlpha = newAlpha * 0.7;
        ctx.fillStyle = "#C8CEC6";
        ctx.fillText(TAGLINES[(indexRef.current + 1) % TAGLINES.length], w / 2, h / 2);
      }
      ctx.globalAlpha = 1;

      // update + draw particles
      for (const p of particles) {
        const relElapsed = elapsed / TOTAL;

        // delayed start per particle
        if (relElapsed < p.delay) continue;

        const t = (relElapsed - p.delay) / (1 - p.delay);
        const dtNorm = dt / 1000;

        if (t < 0.55) {
          // DISSOLVE: drift + turbulence away from origin
          const phase_t = t / 0.55;
          const turbX = turb(p.x, p.y, now * 0.001, 0.006) * 0.8;
          const turbY = turb(p.y, p.x, now * 0.001 + 100, 0.006) * 0.6;

          p.vx += turbX * dtNorm * 8;
          p.vy += turbY * dtNorm * 8;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          p.life = 1 - phase_t * 0.35;
          p.opacity = (0.45 + Math.random() * 0.1) * p.life * (1 - phase_t * 0.5);
          p.size = (1.5 + Math.random() * 0.5) * (1 + phase_t * 0.4);
        } else {
          // REFORM: lerp toward target + scale down
          const phase_t = (t - 0.55) / 0.45;
          const ease = phase_t < 0.5 ? 2 * phase_t * phase_t : 1 - Math.pow(-2 * phase_t + 2, 2) / 2;

          const turbX = turb(p.tx, p.ty, now * 0.001, 0.01) * 0.15;
          const turbY = turb(p.ty, p.tx, now * 0.001 + 200, 0.01) * 0.15;

          p.x += (p.tx + turbX - p.x) * ease * 0.12;
          p.y += (p.ty + turbY - p.y) * ease * 0.12;
          p.vx *= 0.9;
          p.vy *= 0.9;
          p.rotation += p.rotSpeed * 0.3;
          p.life = 0.65 + ease * 0.35;
          p.opacity = (0.35 + ease * 0.25) * (1 - ease * 0.3);
          p.size = Math.max(1.5, p.size * 0.998);
        }

        // draw particle
        if (p.opacity <= 0.01) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // slightly irregular shape
        const s = p.size;
        ctx.moveTo(-s, -s * 0.3);
        ctx.quadraticCurveTo(-s * 0.2, -s, s * 0.5, -s * 0.6);
        ctx.quadraticCurveTo(s, s * 0.1, s * 0.4, s);
        ctx.quadraticCurveTo(-s * 0.1, s * 0.7, -s, -s * 0.3);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // transition complete
      if (progress >= 1) {
        indexRef.current = (indexRef.current + 1) % TAGLINES.length;
        particlesRef.current = [];
        phaseRef.current = "idle";
        phaseStartRef.current = now;
      }
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [createParticles]);

  // ─── Reduced motion fallback ───
  if (prefersReducedMotion.current) {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
      const t = setInterval(() => setIdx((p) => (p + 1) % TAGLINES.length), 3800);
      return () => clearInterval(t);
    }, []);
    return (
      <div className="relative h-[1.4em]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        <motion.span
          key={TAGLINES[idx]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex items-center"
        >
          {TAGLINES[idx]}
        </motion.span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[1.4em] overflow-hidden" style={{ fontFamily: "'DM Serif Display', serif" }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
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

/* ─── Card3D ─── */
function Card3D({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
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
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
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
      style={{ transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s", transformStyle: "preserve-3d", ...style }}>
      {children}
    </div>
  );
}

/* ─── Section ─── */
function Section({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.section ref={ref} id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className} style={style}>
      {children}
    </motion.section>
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(8,10,9,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #292A27" }}>
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4" style={{ color: "#8FA596" }} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Veritas</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {["Analyze", "History", "Statistics", "Methodology"].map((label) => (
              <Button key={label} variant="ghost" className="cursor-pointer text-[10px] h-7 px-3 tracking-wide" style={{ color: "#9A9E98" }} onClick={() => navigate("/dashboard")}>
                {label.toUpperCase()}
              </Button>
            ))}
          </div>
          <MagneticBtn
            className="cursor-pointer text-[10px] font-semibold h-8 px-5 tracking-[0.12em]"
            style={{ background: "#8FA596", color: "#0B0D0C", borderRadius: "2px" }}
            onClick={() => navigate("/dashboard")}>
            START ANALYZING
          </MagneticBtn>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        {/* Content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 mx-auto max-w-7xl px-5 w-full pt-24">
          {/* Asymmetric grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left column — typography */}
            <div className="col-span-12 lg:col-span-7">
              {/* Thin line */}
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="h-px mb-6 origin-left" style={{ background: "linear-gradient(90deg, #8FA596 0%, #8FA596 40%, transparent 100%)", maxWidth: 120 }} />

              <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="text-[9px] tracking-[0.35em] uppercase mb-4 font-medium" style={{ color: "#8FA596" }}>
                Intelligent Misinformation Detection
              </motion.p>

              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] leading-[0.92] tracking-tight mb-2"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>
                VERITAS
              </motion.h1>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl sm:text-2xl lg:text-3xl leading-tight mb-8 min-h-[1.2em]"
                style={{ color: "#9A9E98" }}>
                <AnimatedTagline />
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
                className="text-sm max-w-lg leading-relaxed mb-10 text-balance" style={{ color: "#9A9E98" }}>
                An intelligent misinformation detection system that analyzes language, source credibility and logical consistency.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}
                className="flex flex-col sm:flex-row items-start gap-3">
                <MagneticBtn className="cursor-pointer gap-2 px-7 py-3 text-[11px] font-semibold tracking-[0.1em] flex items-center"
                  style={{ background: "#8FA596", color: "#0B0D0C", borderRadius: "2px" }}
                  onClick={() => navigate("/dashboard")}>
                  START ANALYZING <ArrowRight className="w-3.5 h-3.5" />
                </MagneticBtn>
                <Button size="lg" variant="outline" className="cursor-pointer text-[11px] px-7 py-3 tracking-wide"
                  style={{ borderColor: "#292A27", color: "#9A9E98", borderRadius: "2px" }}
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  EXPLORE VERITAS
                </Button>
              </motion.div>
            </div>

            {/* Right column — stats sidebar */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
              className="col-span-12 lg:col-span-4 lg:col-start-9 flex lg:flex-col gap-6 lg:gap-8 lg:justify-center">
              {[
                { label: "Regex patterns across 21 categories", value: 70, suffix: "+" },
                { label: "Misinformation signal categories", value: 21, suffix: "" },
                { label: "Detection accuracy on benchmark data", value: 95, suffix: "%+" },
              ].map((s, i) => (
                <div key={s.label} className="flex-1 lg:flex-none">
                  <div className="text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>
                    <CountUp target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[9px] tracking-wide mt-1 font-medium" style={{ color: "#9A9E98" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-10" style={{ background: "linear-gradient(transparent, #0B0D0C)" }} />
      </section>

      {/* ─── Thin Rule ─── */}
      <div className="mx-auto max-w-7xl px-5"><div className="h-px" style={{ background: "#292A27" }} /></div>

      {/* ─── Verdict Examples ─── */}
      <Section className="py-20 sm:py-28 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-12 gap-4 mb-14">
            <div className="col-span-12 lg:col-span-8">
              <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, #8FA596 0%, #8FA596 30%, transparent 100%)", maxWidth: 80 }} />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#8FA596" }}>Detection Results</span>
              <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>What You'll Get</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {verdictExamples.map((v, i) => (
              <motion.div key={v.label}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                <Card3D className="p-5 relative overflow-hidden"
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
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
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
              <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, #A58B5B 0%, #A58B5B 30%, transparent 100%)", maxWidth: 80 }} />
              <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "#A58B5B" }}>Capabilities</span>
              <h2 className="mt-2 text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Built for Media Literacy</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
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
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
                <span key={ref} className="text-[10px] px-3 py-1.5 tracking-wide"
                  style={{ background: "#141615", color: "#9A9E98", border: "1px solid #292A27", borderRadius: "2px" }}>{ref}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[{ icon: Users, label: "Named Sources", desc: "Credibility tracking" }, { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" }, { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" }, { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" }].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}>
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
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="p-10 sm:p-14 relative overflow-hidden"
            style={{ background: "#0F1110", border: "1px solid #292A27", borderRadius: "2px" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #8FA596, transparent)" }} />
            <Shield className="w-7 h-7 mx-auto mb-4" style={{ color: "#8FA596" }} />
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
      <footer className="py-6 px-5" style={{ borderTop: "1px solid #292A27" }}>
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" style={{ color: "#8FA596" }} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F2EE" }}>Veritas</span>
          </div>
          <p className="text-[9px] tracking-wide" style={{ color: "#9A9E98" }}>BSc Data Science — NLP-Based Misinformation Detection</p>
        </div>
      </footer>
    </div>
  );
}
