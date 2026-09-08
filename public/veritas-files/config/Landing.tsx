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

/* ─── Cityscape Photo SVG (grayscale, photographic feel) ─── */
function CityscapePhoto() {
  return (
    <svg viewBox="0 0 600 380" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a8a80" />
          <stop offset="60%" stopColor="#b5b0a5" />
          <stop offset="100%" stopColor="#d5d0c5" />
        </linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c5c0b5" stopOpacity="0" />
          <stop offset="70%" stopColor="#c5c0b5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#d8d2c5" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="bldg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a5a50" />
          <stop offset="100%" stopColor="#4a4a42" />
        </linearGradient>
        <linearGradient id="bldg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a6a60" />
          <stop offset="100%" stopColor="#5a5a52" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a7a70" />
          <stop offset="100%" stopColor="#5a5a52" />
        </linearGradient>
      </defs>
      <rect width="600" height="380" fill="url(#sky)" />
      <path d="M0 200 Q80 160 150 180 Q220 140 300 170 Q380 130 450 165 Q520 145 600 175 L600 240 L0 240 Z" fill="#8a8a80" opacity="0.5" />
      <rect x="30" y="150" width="35" height="100" fill="#6a6a60" opacity="0.7" />
      <rect x="70" y="130" width="28" height="120" fill="#6a6a60" opacity="0.6" />
      <rect x="105" y="145" width="40" height="105" fill="#6a6a60" opacity="0.65" />
      <rect x="155" y="125" width="22" height="125" fill="#6a6a60" opacity="0.55" />
      <rect x="185" y="140" width="35" height="110" fill="#6a6a60" opacity="0.6" />
      <rect x="250" y="80" width="45" height="170" fill="url(#bldg1)" />
      <rect x="252" y="82" width="41" height="166" fill="#555550" />
      <rect x="255" y="86" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="268" y="86" width="8" height="9" rx="0.5" fill="#3a3a35" opacity="0.6" />
      <rect x="281" y="86" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="255" y="99" width="8" height="9" rx="0.5" fill="#3a3a35" opacity="0.6" />
      <rect x="268" y="99" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="281" y="99" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="255" y="112" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="268" y="112" width="8" height="9" rx="0.5" fill="#3a3a35" opacity="0.6" />
      <rect x="281" y="112" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="255" y="125" width="8" height="9" rx="0.5" fill="#3a3a35" opacity="0.6" />
      <rect x="268" y="125" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="281" y="125" width="8" height="9" rx="0.5" fill="#3a3a35" opacity="0.6" />
      <rect x="255" y="138" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="268" y="138" width="8" height="9" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="281" y="138" width="8" height="9" rx="0.5" fill="#3a3a35" opacity="0.6" />
      <polygon points="272.5,80 268,40 277,40" fill="#5a5a50" />
      <rect x="271" y="35" width="3" height="10" fill="#6a6a60" />
      <rect x="310" y="110" width="55" height="140" fill="url(#bldg2)" />
      <rect x="312" y="112" width="51" height="136" fill="#606058" />
      <rect x="316" y="116" width="7" height="9" rx="0.5" fill="#e0dbd0" opacity="0.7" />
      <rect x="328" y="116" width="7" height="9" rx="0.5" fill="#4a4a42" opacity="0.6" />
      <rect x="340" y="116" width="7" height="9" rx="0.5" fill="#e0dbd0" opacity="0.7" />
      <rect x="352" y="116" width="7" height="9" rx="0.5" fill="#e0dbd0" opacity="0.7" />
      <rect x="316" y="130" width="7" height="9" rx="0.5" fill="#4a4a42" opacity="0.6" />
      <rect x="328" y="130" width="7" height="9" rx="0.5" fill="#e0dbd0" opacity="0.7" />
      <rect x="340" y="130" width="7" height="9" rx="0.5" fill="#4a4a42" opacity="0.6" />
      <rect x="352" y="130" width="7" height="9" rx="0.5" fill="#e0dbd0" opacity="0.7" />
      <rect x="380" y="155" width="50" height="95" fill="#7a7a70" />
      <ellipse cx="405" cy="155" rx="28" ry="15" fill="#7a7a70" />
      <ellipse cx="405" cy="155" rx="25" ry="12" fill="#8a8a80" />
      <rect x="386" y="162" width="9" height="10" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="401" y="162" width="9" height="10" rx="0.5" fill="#6a6a60" opacity="0.7" />
      <rect x="416" y="162" width="9" height="10" rx="0.5" fill="#d5d0c5" opacity="0.7" />
      <rect x="20" y="185" width="50" height="65" fill="#5a5a50" />
      <rect x="28" y="192" width="12" height="11" rx="0.5" fill="#c5c0b5" opacity="0.7" />
      <rect x="50" y="192" width="12" height="11" rx="0.5" fill="#4a4a42" opacity="0.7" />
      <rect x="28" y="210" width="12" height="11" rx="0.5" fill="#4a4a42" opacity="0.7" />
      <rect x="50" y="210" width="12" height="11" rx="0.5" fill="#c5c0b5" opacity="0.7" />
      <rect x="85" y="160" width="30" height="90" fill="#6a6a60" />
      <polygon points="100,160 92,125 108,125" fill="#6a6a60" />
      <rect x="98" y="118" width="4" height="12" fill="#7a7a70" />
      <rect x="140" y="220" width="3" height="30" fill="#5a5a50" />
      <ellipse cx="141.5" cy="210" rx="8" ry="10" fill="#4a4a42" opacity="0.8" />
      <rect x="165" y="220" width="3" height="30" fill="#5a5a50" />
      <ellipse cx="166.5" cy="210" rx="10" ry="13" fill="#4a4a42" opacity="0.8" />
      <rect x="445" y="220" width="3" height="30" fill="#5a5a50" />
      <ellipse cx="446.5" cy="210" rx="8" ry="10" fill="#4a4a42" opacity="0.8" />
      <rect x="470" y="220" width="3" height="30" fill="#5a5a50" />
      <ellipse cx="471.5" cy="210" rx="10" ry="12" fill="#4a4a42" opacity="0.8" />
      <rect x="0" y="250" width="600" height="130" fill="url(#road)" />
      <rect x="20" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="88" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="156" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="224" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="292" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="360" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="428" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="496" y="310" width="35" height="2" rx="1" fill="#8a8a80" opacity="0.4" />
      <rect x="100" y="290" width="40" height="14" rx="3" fill="#4a4a42" />
      <rect x="95" y="285" width="35" height="8" rx="2" fill="#5a5a50" />
      <circle cx="107" cy="305" r="4" fill="#3a3a35" />
      <circle cx="133" cy="305" r="4" fill="#3a3a35" />
      <rect x="350" y="320" width="45" height="15" rx="3" fill="#5a5a50" opacity="0.7" />
      <rect x="345" y="315" width="38" height="8" rx="2" fill="#6a6a60" opacity="0.7" />
      <rect x="180" y="230" width="2" height="40" fill="#6a6a60" />
      <rect x="174" y="228" width="14" height="3" rx="1" fill="#7a7a70" />
      <circle cx="181" cy="228" r="3" fill="#d5d0c5" opacity="0.6" />
      <rect x="420" y="230" width="2" height="40" fill="#6a6a60" />
      <rect x="414" y="228" width="14" height="3" rx="1" fill="#7a7a70" />
      <circle cx="421" cy="228" r="3" fill="#d5d0c5" opacity="0.6" />
      <rect width="600" height="380" fill="url(#haze)" />
    </svg>
  );
}

/* ─── People Reading Newspaper Photo ─── */
function PeoplePhoto() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="pSpot" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#9a9590" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5a5550" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="200" fill="#6a6560" />
      <rect width="300" height="200" fill="url(#pSpot)" />
      <rect x="0" y="0" width="300" height="120" fill="#7a7570" />
      <rect x="30" y="20" width="40" height="30" rx="1" fill="#8a8580" />
      <rect x="33" y="23" width="34" height="24" fill="#6a6560" />
      <rect x="230" y="25" width="35" height="28" rx="1" fill="#8a8580" />
      <rect x="233" y="28" width="29" height="22" fill="#6a6560" />
      <rect x="40" y="110" width="220" height="6" rx="1" fill="#5a5550" />
      <rect x="60" y="116" width="8" height="50" fill="#4a4540" />
      <rect x="232" y="116" width="8" height="50" fill="#4a4540" />
      <circle cx="100" cy="80" r="15" fill="#5a5550" />
      <rect x="85" y="95" width="30" height="35" rx="5" fill="#5a5550" />
      <rect x="80" y="100" width="12" height="25" rx="3" fill="#5a5550" transform="rotate(10 86 112)" />
      <rect x="108" y="100" width="12" height="25" rx="3" fill="#5a5550" transform="rotate(-10 114 112)" />
      <rect x="60" y="95" width="80" height="55" rx="2" fill="#d5d0c5" />
      <line x1="100" y1="95" x2="100" y2="150" stroke="#b5b0a5" strokeWidth="0.8" />
      <rect x="65" y="100" width="30" height="4" rx="0.5" fill="#8a8580" opacity="0.7" />
      <rect x="65" y="108" width="27" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="65" y="112" width="29" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="65" y="116" width="25" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="65" y="120" width="28" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="65" y="124" width="26" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="65" y="128" width="29" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="105" y="100" width="30" height="4" rx="0.5" fill="#8a8580" opacity="0.7" />
      <rect x="105" y="108" width="28" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="105" y="112" width="25" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="105" y="116" width="30" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="105" y="120" width="27" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="105" y="124" width="29" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <rect x="105" y="128" width="26" height="1.5" rx="0.5" fill="#a5a095" opacity="0.6" />
      <circle cx="210" cy="78" r="14" fill="#6a6560" />
      <rect x="197" y="92" width="26" height="32" rx="4" fill="#6a6560" />
      <rect x="195" y="98" width="10" height="22" rx="3" fill="#6a6560" transform="rotate(20 200 109)" />
      <rect x="160" y="100" width="12" height="12" rx="2" fill="#8a8580" />
      <ellipse cx="166" cy="100" rx="7" ry="2" fill="#7a7570" />
      <path d="M163 96 Q165 90 167 96" fill="none" stroke="#9a9590" strokeWidth="0.8" opacity="0.4" />
      <path d="M166 94 Q168 88 170 94" fill="none" stroke="#9a9590" strokeWidth="0.6" opacity="0.3" />
      <polygon points="0,0 80,0 40,200 0,200" fill="#b5b0a5" opacity="0.08" />
    </svg>
  );
}

/* ─── Editorial Newspaper Illustration ─── */
function NewspaperVisual() {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Back newspaper clipping (small, rotated) */}
      <motion.div
        initial={{ opacity: 0, rotate: -6, x: -20 }}
        animate={{ opacity: 1, rotate: -4, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-[#fffcf6] border border-[#d8d2c5] rounded-sm shadow-lg overflow-hidden ml-8 mr-12 mb-[-40px] relative z-[1] w-[75%]"
      >
        <div className="border-b border-[#d8d2c5] px-3 pt-2 pb-1">
          <p className="text-[5px] uppercase tracking-[0.2em] text-[#8a8478] text-center font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>
            The Morning Chronicle
          </p>
        </div>
        <div className="w-full h-20 overflow-hidden">
          <PeoplePhoto />
        </div>
        <div className="p-2.5 space-y-1">
          <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
          <div className="h-1 bg-[#d8d2c5]/70 rounded w-4/5" />
          <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
        </div>
      </motion.div>

      {/* Main newspaper (front page) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-[#fffcf6] border border-[#d8d2c5] rounded-sm shadow-2xl overflow-hidden relative z-[2]"
      >
        <div className="border-b-2 border-[#1e2522]/80 px-5 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-[5px] text-[#8a8478] uppercase tracking-[0.2em]">Vol. CXII — No. 34,891</p>
            <p className="text-[5px] text-[#8a8478] uppercase tracking-[0.2em]">Monday, Sep 8, 2026</p>
          </div>
          <h3 className="text-center text-xl sm:text-2xl tracking-tight mt-1 text-[#1e2522]" style={{ fontFamily: "'DM Serif Display', serif" }}>NEWS</h3>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <div className="h-px bg-[#1e2522]/20 flex-1" />
            <p className="text-[6px] uppercase tracking-[0.2em] text-[#8a8478] italic" style={{ fontFamily: "'Source Serif 4', serif" }}>Truth Matters</p>
            <div className="h-px bg-[#1e2522]/20 flex-1" />
          </div>
        </div>
        <div className="p-4">
          <h4 className="text-xs sm:text-sm font-bold leading-snug mb-2 text-[#1e2522]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Scientists Confirm New Species Discovered in Deep Ocean Expedition
          </h4>
          <div className="w-full h-36 sm:h-48 rounded-sm overflow-hidden mb-3 relative border border-[#d8d2c5]">
            <CityscapePhoto />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1e2522]/70 to-transparent px-3 py-2">
              <p className="text-[6px] text-white/80 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Downtown financial district — Aerial survey, September 2025
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="h-[3px] bg-[#1e2522]/30 rounded w-3/4 mb-1.5" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-4/5" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-3/4" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-5/6" />
            </div>
            <div className="space-y-1">
              <div className="h-[3px] bg-[#1e2522]/30 rounded w-2/3 mb-1.5" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-5/6" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-3/4" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-4/5" />
              <div className="h-1 bg-[#d8d2c5]/60 rounded w-full" />
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="border-t border-[#d8d2c5] pt-1.5 flex items-center justify-between">
            <span className="text-[5px] text-[#a09a8e] uppercase tracking-[0.15em]">Page A1</span>
            <div className="flex items-center gap-1 bg-[#174a45]/10 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-2 h-2 text-[#174a45]" />
              <span className="text-[5px] text-[#174a45] font-semibold uppercase tracking-wider">Verified by Veritas</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating label cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="flex gap-2 justify-center mt-5">
        {["VERIFY", "ANALYZE", "STAY INFORMED"].map((text, i) => (
          <motion.div key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.8 + i * 0.08 }}
            className="bg-[#fffcf6] border border-[#d8d2c5] rounded px-2.5 py-1 shadow-sm flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#174a45]" />
            <span className="text-[6px] font-semibold uppercase tracking-wider text-[#174a45]">{text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Score cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="flex gap-3 justify-center mt-3">
        <div className="bg-[#fffcf6] border border-[#d8d2c5] rounded-lg p-3 shadow-md">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded bg-[#174a45]/10 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-[#174a45]" />
            </div>
            <span className="text-[7px] font-semibold text-[#174a45] uppercase tracking-wider">Credibility</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-[#174a45]" style={{ fontFamily: "'DM Serif Display', serif" }}>92%</span>
            <span className="text-[7px] text-[#8a8478]">Likely Credible</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-[#e8e3d8] overflow-hidden w-28">
            <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ duration: 1.2, delay: 1.4, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-[#174a45]" />
          </div>
        </div>
        <div className="bg-[#fffcf6] border border-[#b34a3c]/20 rounded-lg p-3 shadow-md">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-[#b34a3c]" />
            <span className="text-[7px] font-semibold text-[#b34a3c]">3 Red Flags</span>
          </div>
          <p className="text-[6px] text-[#8a8478] mt-0.5 leading-relaxed">Sensationalism, anonymous sources</p>
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
          <div className="grid grid-cols-1 gap-8 items-center">
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
