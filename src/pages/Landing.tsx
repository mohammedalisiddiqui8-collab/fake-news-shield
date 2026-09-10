import { motion, useInView } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect, useCallback } from "react";
import { useTilt } from "@/hooks/use-tilt";
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

/* ─── Detailed Cityscape Photo ─── */
function CityscapePhoto() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 260" preserveAspectRatio="xMidYMid slice">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0b8a8" />
          <stop offset="40%" stopColor="#a8a090" />
          <stop offset="100%" stopColor="#908878" />
        </linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(160,152,140,0)" />
          <stop offset="100%" stopColor="rgba(160,152,140,0.5)" />
        </linearGradient>
      </defs>
      <rect width="500" height="260" fill="url(#sky)" />

      {/* Clouds */}
      <ellipse cx="90" cy="35" rx="45" ry="14" fill="rgba(210,205,195,0.5)" />
      <ellipse cx="70" cy="32" rx="30" ry="10" fill="rgba(210,205,195,0.3)" />
      <ellipse cx="350" cy="50" rx="40" ry="12" fill="rgba(210,205,195,0.4)" />
      <ellipse cx="430" cy="28" rx="25" ry="8" fill="rgba(210,205,195,0.35)" />

      {/* Birds */}
      {[[120,25],[135,20],[145,28],[380,40],[395,35]].map(([x,y],i) => (
        <path key={`bird-${i}`} d={`M${x} ${y} q3-3 6 0 q3-3 6 0`} fill="none" stroke="#7a7570" strokeWidth="0.8" />
      ))}

      {/* ── FAR LAYER: distant buildings ── */}
      <rect x="10" y="110" width="25" height="70" fill="#8a8580" opacity="0.5" />
      <rect x="45" y="95" width="20" height="85" fill="#7a7570" opacity="0.5" />
      <rect x="75" y="105" width="30" height="75" fill="#8a8580" opacity="0.5" />
      <rect x="400" y="100" width="22" height="80" fill="#8a8580" opacity="0.5" />
      <rect x="430" y="110" width="28" height="70" fill="#7a7570" opacity="0.5" />
      <rect x="465" y="105" width="25" height="75" fill="#8a8580" opacity="0.5" />

      {/* ── MID LAYER: office buildings ── */}
      {/* Building A - wide office */}
      <rect x="115" y="80" width="55" height="100" fill="#6a6560" />
      {[0,1,2,3,4,5].map(r => [0,1,2,3].map(c => (
        <rect key={`a${r}${c}`} x={122+c*13} y={88+r*15} width="7" height="9" fill={r%2===c%2?"#a8a090":"#504a45"} rx="0.5" />
      )))}
      {/* Antenna */}
      <line x1="142" y1="80" x2="142" y2="68" stroke="#5a5550" strokeWidth="1.5" />
      <circle cx="142" cy="67" r="1.5" fill="#b34a3c" opacity="0.6" />

      {/* Building B - tall tower */}
      <rect x="180" y="40" width="45" height="140" fill="#555048" />
      {[0,1,2,3,4,5,6,7,8].map(r => [0,1,2].map(c => (
        <rect key={`b${r}${c}`} x={187+c*14} y={50+r*14} width="8" height="8" fill={Math.random()>0.3?"#b0a898":"#3a3530"} rx="0.3" />
      )))}
      <polygon points="202,40 202,22 210,40" fill="#4a4540" />
      {/* Spire cross */}
      <line x1="206" y1="18" x2="206" y2="28" stroke="#3a3530" strokeWidth="1.2" />
      <line x1="203" y1="21" x2="209" y2="21" stroke="#3a3530" strokeWidth="1.2" />

      {/* Building C - modern glass */}
      <rect x="235" y="65" width="40" height="115" fill="#5a5550" />
      {[0,1,2,3,4,5,6].map(r => [0,1,2].map(c => (
        <rect key={`c${r}${c}`} x={240+c*12} y={72+r*15} width="8" height="10" fill={r%3===0?"#9a9288":"#4a4540"} rx="0.3" />
      )))}

      {/* Building D - domed civic */}
      <rect x="285" y="90" width="50" height="90" fill="#7a7570" />
      <ellipse cx="310" cy="90" rx="25" ry="14" fill="#7a7570" />
      {/* Dome detail */}
      <ellipse cx="310" cy="88" rx="22" ry="11" fill="none" stroke="#6a6560" strokeWidth="0.5" />
      {/* Columns */}
      {[0,1,2,3].map(i => (
        <rect key={`col-${i}`} x={293+i*12} y={100} width="2" height="30" fill="#8a8580" />
      ))}
      {/* Arched windows */}
      {[0,1,2,3].map(i => (
        <g key={`arch-${i}`}>
          <rect x={293+i*12} y={140} width="6" height="10" fill="#8a8580" rx="3" />
        </g>
      ))}

      {/* Building E - church */}
      <rect x="345" y="75" width="35" height="105" fill="#6a6560" />
      <polygon points="362,75 362,48 378,75" fill="#5a5550" />
      {/* Cross */}
      <line x1="370" y1="42" x2="370" y2="54" stroke="#4a4540" strokeWidth="2" />
      <line x1="366" y1="46" x2="374" y2="46" stroke="#4a4540" strokeWidth="2" />
      {/* Rose window */}
      <circle cx="362" cy="88" r="6" fill="none" stroke="#8a8580" strokeWidth="1" />
      <circle cx="362" cy="88" r="3" fill="#8a8580" opacity="0.5" />
      {/* Arched windows */}
      {[0,1].map(i => (
        <rect key={`cw-${i}`} x={352+i*14} y={100} width="6" height="10" fill="#8a8580" rx="3" />
      ))}

      {/* ── NEAR LAYER: foreground buildings ── */}
      <rect x="410" y="105" width="40" height="75" fill="#555048" />
      {[0,1,2,3].map(r => [0,1,2].map(c => (
        <rect key={`d${r}${c}`} x={415+c*12} y={112+r*16} width="6" height="9" fill={r%2===0?"#a8a090":"#4a4540"} rx="0.3" />
      )))}
      {/* Awning */}
      <rect x="412" y="168" width="36" height="4" fill="#b34a3c" opacity="0.4" rx="1" />

      {/* ── TREES ── */}
      {[55, 165, 280, 395].map((x, i) => (
        <g key={`tree-${i}`}>
          <rect x={x-1.5} y={170+(i%2)*4} width="3" height="14" fill="#3a3530" />
          <ellipse cx={x} cy={164+(i%2)*4} rx="11" ry="13" fill="#4a5540" />
          <ellipse cx={x-4} cy={161+(i%2)*4} rx="8" ry="10" fill="#5a6550" />
          <ellipse cx={x+3} cy={162+(i%2)*4} rx="6" ry="8" fill="#4a5540" opacity="0.7" />
        </g>
      ))}

      {/* ── ROAD ── */}
      <rect y="190" width="500" height="70" fill="#6a6560" />
      {/* Sidewalk */}
      <rect y="188" width="500" height="4" fill="#7a7570" />
      {/* Lane markings */}
      {[25, 75, 125, 175, 225, 275, 325, 375, 425].map((x, i) => (
        <rect key={`lane-${i}`} x={x} y="218" width="25" height="2" fill="#8a8580" rx="1" />
      ))}
      {/* Center line */}
      <rect y="217" width="500" height="1" fill="#9a9590" opacity="0.3" />

      {/* ── CARS ── */}
      {/* Car 1 - sedan */}
      <rect x="70" y="205" width="32" height="11" fill="#4a4540" rx="3" />
      <rect x="76" y="199" width="20" height="8" fill="#5a5550" rx="2" />
      <circle cx="78" cy="218" r="3.5" fill="#3a3530" />
      <circle cx="94" cy="218" r="3.5" fill="#3a3530" />
      {/* Headlights */}
      <rect x="102" y="208" width="2" height="3" fill="#b8b0a0" rx="0.5" />

      {/* Car 2 - SUV */}
      <rect x="300" y="203" width="35" height="13" fill="#5a5550" rx="2" />
      <rect x="304" y="196" width="26" height="9" fill="#6a6560" rx="2" />
      <circle cx="308" cy="218" r="3.5" fill="#3a3530" />
      <circle cx="327" cy="218" r="3.5" fill="#3a3530" />
      {/* Tail lights */}
      <rect x="300" y="208" width="2" height="3" fill="#b34a3c" opacity="0.6" rx="0.5" />

      {/* Car 3 - small */}
      <rect x="420" y="207" width="24" height="9" fill="#4a4540" rx="2" />
      <rect x="424" y="202" width="16" height="7" fill="#5a5550" rx="1.5" />
      <circle cx="426" cy="218" r="3" fill="#3a3530" />
      <circle cx="438" cy="218" r="3" fill="#3a3530" />

      {/* ── STREET LIGHTS ── */}
      {[90, 200, 330, 450].map((x, i) => (
        <g key={`light-${i}`}>
          <rect x={x} y="175" width="2" height="18" fill="#4a4540" />
          <ellipse cx={x+3} cy="174" rx="5" ry="2.5" fill="#4a4540" />
          <ellipse cx={x+3} cy="174" rx="3" ry="1.5" fill="#b8b0a0" opacity="0.15" />
        </g>
      ))}

      {/* ── ATMOSPHERE ── */}
      {/* Haze */}
      <rect y="160" width="500" height="100" fill="url(#haze)" />
      {/* Vignette */}
      <rect width="500" height="260" fill="url(#vignette)" />
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </radialGradient>
      </defs>
      {/* Film grain */}
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="500" height="260" filter="url(#grain)" opacity="0.06" />
    </svg>
  );
}

/* ─── Full Newspaper Visual ─── */
function NewspaperVisual() {
  return (
    <div className="relative w-full">
      {/* Back newspaper (peeking behind, slightly rotated) */}
      <motion.div
        initial={{ opacity: 0, y: -16, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded border overflow-hidden mx-4"
        style={{ background: "#FFFCF6", borderColor: "#D8D2C5", marginBottom: -50, paddingBottom: 14, boxShadow: "0 2px 8px rgba(30,37,34,0.04)" }}
      >
        <div className="px-4 pt-2 pb-1 border-b" style={{ borderColor: "#D8D2C5" }}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold uppercase tracking-[0.2em]" style={{ color: "#6B7268" }}>The Daily Chronicle</span>
            <span className="text-[6px]" style={{ color: "#6B7268" }}>Est. 1847</span>
          </div>
        </div>
        <div className="px-4 py-2 space-y-1">
          {[88, 72, 82, 65, 78, 90].map((w, i) => (
            <div key={i} className="h-[2px] rounded" style={{ width: `${w}%`, background: "#E8E3D8" }} />
          ))}
        </div>
      </motion.div>

      {/* Main newspaper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="rounded border overflow-hidden relative z-10"
        style={{ background: "#FFFCF6", borderColor: "#D8D2C5", boxShadow: "0 8px 30px rgba(30,37,34,0.1), 0 2px 8px rgba(30,37,34,0.05)" }}
      >
        {/* Masthead */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[7px] uppercase tracking-[0.15em]" style={{ color: "#6B7268" }}>Vol. CXII — No. 34,891</span>
            <span className="text-[7px] uppercase tracking-[0.1em]" style={{ color: "#6B7268" }}>{getFormattedDate()}</span>
          </div>
          <div className="text-center py-2">
            <h2 className="text-3xl sm:text-4xl tracking-wide" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522", fontWeight: 400 }}>NEWS</h2>
          </div>
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-[1.5px]" style={{ background: "#1E2522" }} />
            <span className="text-[7px] uppercase tracking-[0.3em] font-medium" style={{ color: "#6B7268" }}>Truth Matters</span>
            <div className="flex-1 h-[1.5px]" style={{ background: "#1E2522" }} />
          </div>
        </div>

        {/* Section label */}
        <div className="px-5 py-1" style={{ background: "#174A4508" }}>
          <span className="text-[7px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#174A45" }}>Science & Discovery</span>
        </div>

        {/* Article headline */}
        <div className="px-5 pt-3 pb-2">
          <h3 className="text-lg sm:text-xl leading-tight mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>
            Scientists Confirm New Species Discovered in Deep Ocean Expedition
          </h3>
          <p className="text-[8px] italic" style={{ color: "#6B7268" }}>
            Marine biologists from Oxford identify bioluminescent creature at 8,200 meters
          </p>
        </div>

        {/* Cityscape photo */}
        <div className="mx-5 rounded overflow-hidden" style={{ height: 170, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}>
          <CityscapePhoto />
        </div>
        <p className="px-5 py-1.5 text-[7px] italic" style={{ color: "#6B7268" }}>
          Downtown financial district — Aerial survey, September 2025
        </p>

        {/* Two-column article text */}
        <div className="px-5 pb-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-[3px]">
              {[95,88,92,78,85,90,72,88,95,80,85,92,78,88].map((w, i) => (
                <div key={i} className="h-[2px] rounded" style={{ width: `${w}%`, background: "#E8E3D8" }} />
              ))}
            </div>
            <div className="space-y-[3px]">
              {[85,92,78,90,82,88,75,92,85,80,88,72,90].map((w, i) => (
                <div key={i} className="h-[2px] rounded" style={{ width: `${w}%`, background: "#E8E3D8" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t flex items-center justify-between" style={{ borderColor: "#D8D2C5" }}>
          <span className="text-[6px] uppercase tracking-wider" style={{ color: "#6B7268" }}>Page A1</span>
        </div>
      </motion.div>

      {/* ── Action cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="flex justify-center gap-2 mt-5 relative z-10"
      >
        {["VERIFY", "ANALYZE", "STAY INFORMED"].map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
            className="rounded border px-3 py-1.5 flex items-center gap-1.5"
            style={{ background: "#FFFCF6", borderColor: "#D8D2C5" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174A45" }} />
            <span className="text-[7px] font-semibold uppercase tracking-wider" style={{ color: "#174A45" }}>{text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Score cards ── */}
      <div className="grid grid-cols-2 gap-3 mt-3 relative z-10">
        {/* Credibility card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="rounded border p-3"
          style={{ background: "#FFFCF6", borderColor: "#D8D2C5", boxShadow: "0 2px 8px rgba(30,37,34,0.04)" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield className="w-3 h-3" style={{ color: "#174A45" }} />
            <span className="text-[7px] font-semibold uppercase tracking-wider" style={{ color: "#174A45" }}>Credibility</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold" style={{ color: "#174A45", fontFamily: "'DM Serif Display', serif" }}>92%</span>
            <span className="text-[8px]" style={{ color: "#6B7268" }}>Likely Credible</span>
          </div>
          <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: "#E8E3D8" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "92%" }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="h-full rounded-full"
              style={{ background: "#174A45" }}
            />
          </div>
        </motion.div>

        {/* Red flags card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="rounded border p-3"
          style={{ background: "#FFFCF6", borderColor: "#B34A3C25", boxShadow: "0 2px 8px rgba(30,37,34,0.04)" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3 h-3" style={{ color: "#B34A3C" }} />
            <span className="text-[7px] font-semibold uppercase tracking-wider" style={{ color: "#B34A3C" }}>3 Red Flags</span>
          </div>
          <div className="space-y-0.5">
            {["Sensationalism", "Anonymous sources", "Missing citations"].map((f) => (
              <div key={f} className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full shrink-0" style={{ background: "#B34A3C" }} />
                <span className="text-[8px] leading-tight" style={{ color: "#6B7268" }}>{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── 3D Tilt Card Wrapper ─── */
function TiltCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const [ref, onMouseMove, onMouseLeave] = useTilt(6);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ transition: "transform 0.15s ease-out, box-shadow 0.3s ease", transformStyle: "preserve-3d", willChange: "transform", ...style }}
    >
      {children}
    </div>
  );
}

/* ─── 3D Floating Element ─── */
function Floating3D({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: "800px", transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
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
      {/* ─── Navigation ─── */}
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-5 paper-texture">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Editorial text */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: "#174A45" }}>Fake News Detection</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
                className="text-7xl sm:text-8xl lg:text-[7rem] leading-[1.0] tracking-tight mb-1"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Veritas</motion.h1>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-6 min-h-[1.3em]"
                style={{ color: "#1E2522" }}>
                <AnimatedTagline />
              </motion.div>
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
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.75 }} className="mt-10 flex items-center gap-6">
                {[{ value: "Real-time", label: "Analysis" }, { value: "95%+", label: "Accuracy Rate" }, { value: "70+", label: "Patterns Detected" }].map((s) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 + ["Real-time","95%+","70+"].indexOf(s.value) * 0.1 }} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174A45" }} />
                    <div>
                      <span className="text-xs font-semibold block leading-tight" style={{ color: "#1E2522" }}>{s.value}</span>
                      <span className="text-[10px]" style={{ color: "#6B7268" }}>{s.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Newspaper with cityscape — 3D perspective */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotateY: -8, rotateX: 3 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
            >
              <NewspaperVisual />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

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
              <Floating3D key={v.verdict} delay={i * 0.12}>
                <TiltCard className="rounded border p-5 relative overflow-hidden group" style={{ background: "#FFFCF6", borderColor: "#D8D2C5", boxShadow: "0 4px 20px rgba(30,37,34,0.04)" }}>
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
                </TiltCard>
              </Floating3D>
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
              <Floating3D key={s.step} delay={i * 0.12}>
                <TiltCard className="rounded border p-6 group" style={{ background: "#FFFCF6", borderColor: "#D8D2C5", boxShadow: "0 4px 20px rgba(30,37,34,0.04)" }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "#174A4510" }}>
                    <s.icon className="w-5 h-5" style={{ color: "#174A45" }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#174A45", opacity: 0.5 }}>Step {s.step}</span>
                  <h3 className="mt-1 text-lg font-semibold" style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "#6B7268" }}>{s.description}</p>
                </TiltCard>
              </Floating3D>
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
              <Floating3D key={f.title} delay={i * 0.08}>
                <TiltCard className="rounded border p-5 group" style={{ background: "#FFFCF6", borderColor: "#D8D2C5", boxShadow: "0 4px 20px rgba(30,37,34,0.04)" }}>
                  <div className="w-9 h-9 rounded flex items-center justify-center mb-3" style={{ background: "#174A4510" }}>
                    <f.icon className="w-4 h-4" style={{ color: "#174A45" }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#1E2522" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#6B7268" }}>{f.description}</p>
                </TiltCard>
              </Floating3D>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Academic References ─── */}
      <Section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="rounded border p-8 sm:p-10 text-center relative overflow-hidden" style={{ background: "#FFFCF6", borderColor: "#D8D2C5", boxShadow: "0 8px 40px rgba(30,37,34,0.06)" }}>
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
          <div className="rounded border px-8 py-14 sm:px-14 relative overflow-hidden" style={{ background: "#174A45", borderColor: "#174A45", boxShadow: "0 20px 60px rgba(23,74,69,0.2), 0 4px 16px rgba(23,74,69,0.1)" }}>
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
