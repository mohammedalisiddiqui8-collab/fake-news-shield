import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Shield, Brain, Search, BarChart3, Eye, Zap,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Globe, FileCheck, TrendingUp, Users,
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

/* ─── Newspaper Collage Visual (CSS-based, guaranteed to render) ─── */
function NewspaperVisual() {
  return (
    <div className="w-full max-w-lg mx-auto relative" style={{ minHeight: 420 }}>
      {/* ── Back newspaper clipping ── */}
      <motion.div
        initial={{ opacity: 0, rotate: -5, x: -10 }}
        animate={{ opacity: 1, rotate: -3, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute left-4 sm:left-6 top-0 w-[70%] rounded-sm shadow-lg overflow-hidden z-[1]"
        style={{ background: "#fffcf6", border: "1px solid #d8d2c5" }}
      >
        {/* Masthead */}
        <div className="border-b px-3 pt-2 pb-1" style={{ borderColor: "#d8d2c5" }}>
          <p className="text-center font-semibold uppercase" style={{
            fontSize: 7, letterSpacing: "0.2em", color: "#8a8478",
            fontFamily: "'DM Serif Display', serif"
          }}>The Morning Chronicle</p>
          <p className="text-center uppercase" style={{
            fontSize: 5, letterSpacing: "0.15em", color: "#b5b0a8"
          }}>Est. 1923 — Final Edition</p>
        </div>
        {/* Photo area - warm grayscale room scene */}
        <div className="w-full relative" style={{
          height: 120, background: "linear-gradient(135deg, #7a7570 0%, #8a8580 30%, #6a6560 100%)"
        }}>
          {/* Window light */}
          <div className="absolute" style={{
            top: 0, left: 0, width: "30%", height: "100%",
            background: "linear-gradient(135deg, rgba(180,175,168,0.3) 0%, transparent 100%)"
          }} />
          {/* Table */}
          <div className="absolute" style={{
            bottom: 30, left: "15%", width: "70%", height: 6,
            background: "#5a5550", borderRadius: 1
          }} />
          {/* Person 1 - reading */}
          <div className="absolute" style={{ left: "20%", bottom: 38 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#5a5550", marginBottom: -4 }} />
            <div style={{ width: 32, height: 30, borderRadius: "6px 6px 0 0", background: "#504e48" }} />
            {/* Newspaper in hands */}
            <div className="absolute" style={{
              top: 20, left: -15, width: 55, height: 35,
              background: "#d5d0c8", borderRadius: 1,
              transform: "rotate(-8deg)"
            }}>
              <div className="absolute" style={{
                top: 8, left: 6, width: 20, height: 3,
                background: "#8a8580", borderRadius: 0.5, opacity: 0.7
              }} />
              <div className="absolute" style={{
                top: 14, left: 6, width: 18, height: 1.5,
                background: "#a5a098", borderRadius: 0.5, opacity: 0.5
              }} />
              <div className="absolute" style={{
                top: 18, left: 6, width: 16, height: 1.5,
                background: "#a5a098", borderRadius: 0.5, opacity: 0.5
              }} />
              <div className="absolute" style={{
                top: 22, left: 6, width: 20, height: 1.5,
                background: "#a5a098", borderRadius: 0.5, opacity: 0.5
              }} />
              <div className="absolute" style={{
                top: 26, left: 6, width: 14, height: 1.5,
                background: "#a5a098", borderRadius: 0.5, opacity: 0.5
              }} />
              <div className="absolute" style={{
                top: 8, left: 28, width: 18, height: 1.5,
                background: "#a5a098", borderRadius: 0.5, opacity: 0.5
              }} />
              <div className="absolute" style={{
                top: 12, left: 28, width: 20, height: 1.5,
                background: "#a5a098", borderRadius: 0.5, opacity: 0.5
              }} />
              <div className="absolute" style={{
                top: 16, left: 28, width: 15, height: 1.5,
                background: "#a5a098", borderRadius: 0.5, opacity: 0.5
              }} />
            </div>
          </div>
          {/* Person 2 - standing */}
          <div className="absolute" style={{ right: "20%", bottom: 38 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#6a6560", marginBottom: -3 }} />
            <div style={{ width: 28, height: 34, borderRadius: "5px 5px 0 0", background: "#5a5855" }} />
          </div>
          {/* Coffee cup */}
          <div className="absolute" style={{
            bottom: 36, right: "32%", width: 12, height: 10,
            background: "#d5d0c8", borderRadius: "0 0 2px 2px", opacity: 0.6
          }} />
          {/* Wall frames */}
          <div className="absolute" style={{
            top: 12, left: "8%", width: 30, height: 22,
            border: "1px solid #6a6560", borderRadius: 1, background: "#6a6560"
          }} />
          <div className="absolute" style={{
            top: 15, right: "10%", width: 25, height: 20,
            border: "1px solid #6a6560", borderRadius: 1, background: "#6a6560"
          }} />
        </div>
        {/* Text lines */}
        <div className="p-2.5 space-y-1">
          <div style={{ height: 4, background: "#d8d2c5", borderRadius: 2, opacity: 0.7, width: "100%" }} />
          <div style={{ height: 4, background: "#d8d2c5", borderRadius: 2, opacity: 0.7, width: "80%" }} />
          <div style={{ height: 4, background: "#d8d2c5", borderRadius: 2, opacity: 0.7, width: "95%" }} />
          <div style={{ height: 4, background: "#d8d2c5", borderRadius: 2, opacity: 0.7, width: "70%" }} />
        </div>
      </motion.div>

      {/* ── Main newspaper front page ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative rounded-sm shadow-2xl overflow-hidden z-[2]"
        style={{
          background: "#fffcf6", border: "1px solid #d8d2c5",
          marginTop: 120
        }}
      >
        {/* Masthead */}
        <div className="px-5 pt-3 pb-2" style={{ borderBottom: "2px solid rgba(30,37,34,0.8)" }}>
          <div className="flex items-center justify-between">
            <span className="uppercase" style={{ fontSize: 6, color: "#8a8478", letterSpacing: "0.2em" }}>
              Vol. CXII — No. 34,891
            </span>
            <span className="uppercase" style={{ fontSize: 6, color: "#8a8478", letterSpacing: "0.2em" }}>
              Monday, Sep 8, 2026
            </span>
          </div>
          <h3 className="text-center mt-1" style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 28, color: "#1e2522", letterSpacing: "-0.02em"
          }}>NEWS</h3>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <div style={{ height: 1, flex: 1, background: "rgba(30,37,34,0.2)" }} />
            <span className="italic uppercase" style={{
              fontSize: 7, color: "#8a8478", letterSpacing: "0.2em",
              fontFamily: "'Source Serif 4', serif"
            }}>Truth Matters</span>
            <div style={{ height: 1, flex: 1, background: "rgba(30,37,34,0.2)" }} />
          </div>
        </div>

        {/* Article headline */}
        <div className="px-5 pt-4 pb-2">
          <h4 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 14, fontWeight: 700, lineHeight: 1.3,
            color: "#1e2522"
          }}>
            Scientists Confirm New Species Discovered in Deep Ocean Expedition
          </h4>
        </div>

        {/* Press photo — cityscape */}
        <div className="mx-5 relative mb-3" style={{
          height: 180, border: "1px solid #d8d2c5", borderRadius: 2,
          overflow: "hidden",
          background: "linear-gradient(180deg, #78746c 0%, #9e9a90 40%, #c5c0b5 100%)"
        }}>
          {/* Clouds */}
          <div className="absolute" style={{
            top: 15, left: "15%", width: 80, height: 20,
            borderRadius: 10, background: "#b0aca4", opacity: 0.4
          }} />
          <div className="absolute" style={{
            top: 10, left: "55%", width: 60, height: 16,
            borderRadius: 8, background: "#b8b4ac", opacity: 0.3
          }} />

          {/* Distant hills */}
          <div className="absolute" style={{
            top: 50, left: 0, right: 0, height: 40,
            background: "linear-gradient(180deg, #908c84, #aaa6a0)",
            opacity: 0.5, clipPath: "polygon(0 60%, 10% 40%, 20% 55%, 35% 30%, 50% 50%, 65% 25%, 80% 45%, 90% 35%, 100% 55%, 100% 100%, 0 100%)"
          }} />

          {/* Background buildings */}
          <div className="absolute" style={{ bottom: 50, left: "3%", width: 18, height: 60, background: "#7a7874", opacity: 0.5 }} />
          <div className="absolute" style={{ bottom: 50, left: "9%", width: 14, height: 70, background: "#807c78", opacity: 0.45 }} />
          <div className="absolute" style={{ bottom: 50, left: "15%", width: 20, height: 55, background: "#787570", opacity: 0.5 }} />

          {/* Main tall building */}
          <div className="absolute" style={{ bottom: 50, left: "28%", width: 48, height: 130, background: "linear-gradient(180deg, #3a3834, #2a2824)" }}>
            {/* Spire */}
            <div className="absolute" style={{
              top: -15, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "18px solid #3a3835"
            }} />
            <div className="absolute" style={{ top: -25, left: "50%", transform: "translateX(-50%)", width: 3, height: 12, background: "#444240" }} />
            {/* Windows grid */}
            {[0,1,2,3,4,5].map(r => [0,1,2,3].map(c => (
              <div key={`w1-${r}-${c}`} className="absolute" style={{
                top: 8 + r * 18, left: 5 + c * 11, width: 7, height: 10, borderRadius: 0.5,
                background: (r + c) % 3 === 0 ? "rgba(197,192,181,0.7)" : (r + c) % 2 === 0 ? "#2a2824" : "#1a1814"
              }} />
            )))}
          </div>

          {/* Second tall building */}
          <div className="absolute" style={{ bottom: 50, left: "46%", width: 40, height: 110, background: "linear-gradient(180deg, #555350, #444240)" }}>
            {[0,1,2,3,4].map(r => [0,1,2].map(c => (
              <div key={`w2-${r}-${c}`} className="absolute" style={{
                top: 8 + r * 18, left: 5 + c * 12, width: 7, height: 9, borderRadius: 0.5,
                background: (r + c) % 2 === 0 ? "rgba(208,204,196,0.65)" : "#3a3835"
              }} />
            )))}
          </div>

          {/* Domed building */}
          <div className="absolute" style={{ bottom: 50, left: "64%", width: 36, height: 80, background: "#5a5855" }}>
            <div className="absolute" style={{
              top: -12, left: "50%", transform: "translateX(-50%)",
              width: 44, height: 22, borderRadius: "50% 50% 0 0",
              background: "#5a5855"
            }} />
            {[0,1,2].map(r => [0,1,2].map(c => (
              <div key={`w3-${r}-${c}`} className="absolute" style={{
                top: 14 + r * 14, left: 5 + c * 10, width: 5, height: 8, borderRadius: 0.5,
                background: (r + c) % 2 === 0 ? "rgba(197,192,184,0.6)" : "#4a4845"
              }} />
            )))}
          </div>

          {/* Right buildings */}
          <div className="absolute" style={{ bottom: 50, right: "8%", width: 30, height: 90, background: "linear-gradient(180deg, #504e4a, #444240)" }} />
          <div className="absolute" style={{ bottom: 50, right: "3%", width: 22, height: 60, background: "#605e5a" }} />

          {/* Church */}
          <div className="absolute" style={{ bottom: 50, left: "20%", width: 20, height: 70, background: "#5a5855" }}>
            <div className="absolute" style={{
              top: -18, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: "20px solid #5a5855"
            }} />
            <div className="absolute" style={{ top: -28, left: "50%", transform: "translateX(-50%)", width: 3, height: 12, background: "#605e5a" }} />
          </div>

          {/* Trees */}
          {[5, 22, 78, 92].map((pct, i) => (
            <div key={`tree-${i}`} className="absolute" style={{ bottom: 50, left: `${pct}%` }}>
              <div style={{ width: 2.5, height: 15, background: "#3a3835" }} />
              <div className="absolute" style={{
                top: -12, left: "50%", transform: "translateX(-50%)",
                width: 20, height: 24, borderRadius: "50%",
                background: "#3a3835", opacity: 0.85
              }} />
            </div>
          ))}

          {/* Road */}
          <div className="absolute" style={{
            bottom: 0, left: 0, right: 0, height: 50,
            background: "linear-gradient(180deg, #6a6660, #504e48)"
          }} />
          {/* Lane markings */}
          {[0,15,30,45,60,75,90].map((pct, i) => (
            <div key={`lane-${i}`} className="absolute" style={{
              bottom: 15, left: `${pct}%`, width: 30, height: 2,
              background: "#8a8884", opacity: 0.35, borderRadius: 1
            }} />
          ))}

          {/* Cars */}
          <div className="absolute" style={{ bottom: 22, left: "18%" }}>
            <div style={{ width: 40, height: 12, background: "#4a4845", borderRadius: 3, position: "relative" }}>
              <div className="absolute" style={{ top: -6, left: 4, width: 30, height: 6, background: "#555350", borderRadius: 2 }} />
              <div className="absolute" style={{ top: -6, left: 4, width: 10, height: 5, background: "rgba(120,117,112,0.5)", borderRadius: 1 }} />
            </div>
            <div className="absolute" style={{ bottom: -2, left: 6, width: 8, height: 8, borderRadius: "50%", background: "#3a3835" }} />
            <div className="absolute" style={{ bottom: -2, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#3a3835" }} />
          </div>

          <div className="absolute" style={{ bottom: 28, right: "30%" }}>
            <div style={{ width: 44, height: 13, background: "#555350", borderRadius: 3, opacity: 0.7, position: "relative" }}>
              <div className="absolute" style={{ top: -5, left: 4, width: 34, height: 6, background: "#605e5a", borderRadius: 2, opacity: 0.7 }} />
            </div>
            <div className="absolute" style={{ bottom: -2, left: 6, width: 8, height: 8, borderRadius: "50%", background: "#3a3835", opacity: 0.7 }} />
            <div className="absolute" style={{ bottom: -2, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#3a3835", opacity: 0.7 }} />
          </div>

          {/* Street lamps */}
          <div className="absolute" style={{ bottom: 48, left: "35%" }}>
            <div style={{ width: 2, height: 25, background: "#5a5855" }} />
            <div className="absolute" style={{ top: -3, left: -6, width: 14, height: 3, background: "#656360", borderRadius: 1 }} />
          </div>

          {/* Haze overlay */}
          <div className="absolute" style={{
            inset: 0,
            background: "linear-gradient(180deg, transparent 0%, rgba(181,176,168,0.3) 70%, rgba(197,192,184,0.7) 100%)"
          }} />

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{
            background: "linear-gradient(transparent, rgba(30,37,34,0.7))"
          }}>
            <p className="italic" style={{
              fontSize: 7, color: "rgba(255,255,255,0.8)",
              fontFamily: "'Source Serif 4', serif"
            }}>
              Downtown financial district — Aerial survey, September 2025
            </p>
          </div>
        </div>

        {/* Two-column text */}
        <div className="px-5 pb-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div style={{ height: 3, background: "rgba(30,37,34,0.3)", borderRadius: 2, width: "75%", marginBottom: 6 }} />
            {[0,1,2,3,4,5,6,7].map(i => (
              <div key={i} style={{
                height: 4, background: "rgba(216,210,197,0.6)", borderRadius: 2,
                width: `${90 + (i % 3) * 5}%`
              }} />
            ))}
          </div>
          <div className="space-y-1">
            <div style={{ height: 3, background: "rgba(30,37,34,0.3)", borderRadius: 2, width: "65%", marginBottom: 6 }} />
            {[0,1,2,3,4,5,6,7].map(i => (
              <div key={i} style={{
                height: 4, background: "rgba(216,210,197,0.6)", borderRadius: 2,
                width: `${85 + (i % 3) * 7}%`
              }} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between pt-1.5" style={{ borderTop: "1px solid #d8d2c5" }}>
            <span className="uppercase" style={{ fontSize: 5, color: "#a09a8e", letterSpacing: "0.15em" }}>Page A1</span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(23,74,69,0.1)" }}>
              <CheckCircle2 className="w-2 h-2" style={{ color: "#174a45" }} />
              <span className="font-semibold uppercase" style={{ fontSize: 5, color: "#174a45", letterSpacing: "0.1em" }}>
                Verified by Veritas
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Action label cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="flex gap-2 justify-center mt-5"
      >
        {["VERIFY", "ANALYZE", "STAY INFORMED"].map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 + i * 0.08 }}
            className="rounded px-2.5 py-1 shadow-sm flex items-center gap-1.5"
            style={{ background: "#fffcf6", border: "1px solid #d8d2c5" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#174a45" }} />
            <span className="font-semibold uppercase" style={{ fontSize: 6, color: "#174a45", letterSpacing: "0.1em" }}>
              {text}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Score cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="flex gap-3 justify-center mt-3"
      >
        <div className="rounded-lg p-3 shadow-md" style={{ background: "#fffcf6", border: "1px solid #d8d2c5" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="rounded flex items-center justify-center" style={{ width: 16, height: 16, background: "rgba(23,74,69,0.1)" }}>
              <Shield className="w-2.5 h-2.5" style={{ color: "#174a45" }} />
            </div>
            <span className="font-semibold uppercase" style={{ fontSize: 7, color: "#174a45", letterSpacing: "0.1em" }}>
              Credibility
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold" style={{ fontSize: 18, color: "#174a45", fontFamily: "'DM Serif Display', serif" }}>
              92%
            </span>
            <span style={{ fontSize: 7, color: "#8a8478" }}>Likely Credible</span>
          </div>
          <div className="mt-1 rounded-full overflow-hidden" style={{ height: 6, background: "#e8e3d8", width: 112 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "92%" }}
              transition={{ duration: 1.2, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: "#174a45" }}
            />
          </div>
        </div>
        <div className="rounded-lg p-3 shadow-md" style={{ background: "#fffcf6", border: "1px solid rgba(179,74,60,0.2)" }}>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" style={{ color: "#b34a3c" }} />
            <span className="font-semibold" style={{ fontSize: 7, color: "#b34a3c" }}>3 Red Flags</span>
          </div>
          <p className="mt-0.5 leading-relaxed" style={{ fontSize: 6, color: "#8a8478" }}>
            Sensationalism, anonymous sources
          </p>
        </div>
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
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Home</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Analyze</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>History</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Statistics</Button>
              <Button variant="ghost" className="cursor-pointer hidden sm:inline-flex text-xs" onClick={() => navigate("/dashboard")}>Methodology</Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs border-0 rounded" onClick={() => navigate("/dashboard")}>
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-28 pb-12 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="max-w-xl">
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-4">Fake News Detection</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-2"
                style={{ fontFamily: "'DM Serif Display', serif", color: "#1E2522" }}>Veritas</motion.h1>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-6 min-h-[1.3em]" style={{ color: "#1E2522" }}>
                <AnimatedTagline />
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed mb-8">
                In a world full of information, Veritas helps you verify what's real. Our system analyzes news content, detects misleading patterns, and helps you make informed decisions.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }} className="flex flex-col sm:flex-row items-start gap-3">
                <Button size="lg" className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-7 h-11 text-sm border-0 rounded" onClick={() => navigate("/dashboard")}>
                  Start Analyzing <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="cursor-pointer border-border hover:bg-muted gap-2 px-7 h-11 text-sm rounded" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  Learn More
                </Button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.75 }} className="mt-10 flex items-center gap-6">
                {[{ value: "Real-time", label: "Analysis" }, { value: "95%+", label: "Accuracy Rate" }, { value: "70+", label: "Patterns Detected" }].map((s) => (
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

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <NewspaperVisual />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

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
                <div className="glass-card rounded-lg p-6 group hover:shadow-md transition-shadow duration-300">
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

      <div className="mx-auto max-w-6xl px-5"><div className="editorial-rule" /></div>

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

      <Section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card rounded-lg p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20" />
            <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center mx-auto mb-5">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>Academically Grounded</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-7 leading-relaxed">Detection heuristics informed by research from leading institutions in misinformation detection.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {references.map((ref) => (
                <span key={ref} className="text-xs px-3 py-1.5 rounded bg-muted text-muted-foreground border border-border">{ref}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[{ icon: Users, label: "Named Sources", desc: "Credibility tracking" }, { icon: TrendingUp, label: "Severity Scoring", desc: "Weighted patterns" }, { icon: Eye, label: "Explainable AI", desc: "Transparent verdicts" }, { icon: BarChart3, label: "Visual Reports", desc: "Charts & breakdowns" }].map((item, i) => (
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

      <Section className="py-20 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-strong rounded-lg px-8 py-14 sm:px-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10" />
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-5">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Ready to Fact-Check?</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">Start analyzing articles with our detection engine. No sign-up required.</p>
            <Button size="lg" className="cursor-pointer mt-7 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 h-11 text-sm border-0 rounded" onClick={() => navigate("/dashboard")}>
              Launch Veritas <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

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
