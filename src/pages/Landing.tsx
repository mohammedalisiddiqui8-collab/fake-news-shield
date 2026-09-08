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

/* ─── Photographic Cityscape Press Photo ─── */
function CityPhoto() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="csSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78746c" />
          <stop offset="50%" stopColor="#9e9a90" />
          <stop offset="100%" stopColor="#c5c0b5" />
        </linearGradient>
        <linearGradient id="csDistant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#908c84" />
          <stop offset="100%" stopColor="#aaa6a0" />
        </linearGradient>
        <linearGradient id="csRoad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a6660" />
          <stop offset="100%" stopColor="#504e48" />
        </linearGradient>
        <linearGradient id="csBldgDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3834" />
          <stop offset="100%" stopColor="#2a2824" />
        </linearGradient>
        <linearGradient id="csBldgMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#555350" />
          <stop offset="100%" stopColor="#444240" />
        </linearGradient>
        <linearGradient id="csHaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b5b0a8" stopOpacity="0" />
          <stop offset="60%" stopColor="#b5b0a8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c5c0b8" stopOpacity="0.7" />
        </linearGradient>
        <filter id="csGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="480" height="320" fill="url(#csSky)" />

      {/* Clouds */}
      <ellipse cx="80" cy="45" rx="55" ry="18" fill="#b0aca4" opacity="0.4" />
      <ellipse cx="110" cy="40" rx="40" ry="15" fill="#b8b4ac" opacity="0.3" />
      <ellipse cx="320" cy="55" rx="60" ry="14" fill="#b0aca4" opacity="0.35" />
      <ellipse cx="400" cy="35" rx="45" ry="12" fill="#b5b1a8" opacity="0.25" />

      {/* Distant hills */}
      <path d="M0 160 Q60 130 120 145 Q180 120 240 140 Q300 115 360 135 Q420 120 480 150 L480 200 L0 200 Z" fill="url(#csDistant)" opacity="0.5" />

      {/* Background buildings (far) */}
      <rect x="15" y="140" width="18" height="60" fill="#7a7874" opacity="0.5" />
      <rect x="38" y="130" width="14" height="70" fill="#807c78" opacity="0.45" />
      <rect x="56" y="145" width="20" height="55" fill="#787570" opacity="0.5" />
      <rect x="80" y="135" width="16" height="65" fill="#7a7874" opacity="0.4" />
      <rect x="410" y="142" width="15" height="58" fill="#7a7874" opacity="0.45" />
      <rect x="430" y="135" width="18" height="65" fill="#807c78" opacity="0.4" />
      <rect x="452" y="148" width="20" height="52" fill="#787570" opacity="0.5" />

      {/* Mid buildings */}
      <rect x="25" y="115" width="28" height="85" fill="#5a5855" opacity="0.6" />
      <rect x="60" y="100" width="24" height="100" fill="#605e5a" opacity="0.55" />
      <rect x="90" y="110" width="30" height="90" fill="#555350" opacity="0.6" />

      {/* Main tall building (center-left) */}
      <rect x="145" y="55" width="48" height="145" fill="url(#csBldgDark)" />
      <rect x="147" y="57" width="44" height="141" fill="#353330" />
      {/* Spire */}
      <polygon points="169,55 164,20 174,20" fill="#3a3835" />
      <rect x="167.5" y="12" width="3" height="10" fill="#444240" />
      {/* Windows - 6 rows x 4 cols */}
      {[0,1,2,3,4,5].map(r => [0,1,2,3].map(c => (
        <rect key={`w1-${r}-${c}`} x={151 + c * 10} y={62 + r * 18} width="6" height="10" rx="0.5"
          fill={((r + c) % 3 === 0) ? "#c5c0b5" : ((r + c) % 2 === 0) ? "#2a2824" : "#1a1814"}
          opacity={((r + c) % 3 === 0) ? 0.7 : 0.6} />
      )))}
      {/* Building details */}
      <rect x="160" y="195" width="18" height="5" fill="#2a2824" />

      {/* Second tall building (center) */}
      <rect x="200" y="75" width="42" height="125" fill="url(#csBldgMid)" />
      <rect x="202" y="77" width="38" height="121" fill="#4a4845" />
      {/* Windows */}
      {[0,1,2,3,4,5].map(r => [0,1,2].map(c => (
        <rect key={`w2-${r}-${c}`} x={206 + c * 12} y={82 + r * 16} width="7" height="9" rx="0.5"
          fill={((r + c) % 3 === 0) ? "#d5d0c8" : ((r + c) % 2 === 0) ? "#3a3835" : "#2a2824"}
          opacity={((r + c) % 3 === 0) ? 0.65 : 0.55} />
      )))}

      {/* Domed building */}
      <rect x="255" y="120" width="38" height="80" fill="#5a5855" />
      <ellipse cx="274" cy="120" rx="22" ry="14" fill="#5a5855" />
      <ellipse cx="274" cy="120" rx="19" ry="11" fill="#656360" />
      {/* Dome detail lines */}
      <line x1="274" y1="109" x2="274" y2="106" stroke="#5a5855" strokeWidth="1.5" />
      <circle cx="274" cy="105" r="2" fill="#5a5855" />
      {/* Windows */}
      {[0,1,2].map(r => [0,1,2].map(c => (
        <rect key={`w3-${r}-${c}`} x={260 + c * 10} y={128 + r * 14} width="5" height="8" rx="0.5"
          fill={(r + c) % 2 === 0 ? "#c5c0b8" : "#4a4845"} opacity="0.6" />
      )))}

      {/* Right building */}
      <rect x="305" y="90" width="50" height="110" fill="url(#csBldgMid)" />
      <rect x="307" y="92" width="46" height="106" fill="#504e4a" />
      {[0,1,2,3,4].map(r => [0,1,2,3].map(c => (
        <rect key={`w4-${r}-${c}`} x={311 + c * 10} y={97 + r * 18} width="6" height="10" rx="0.5"
          fill={(r + c) % 2 === 0 ? "#d0ccc4" : "#3a3835"} opacity={((r + c) % 3 === 0) ? 0.6 : 0.5} />
      )))}

      {/* Small building */}
      <rect x="365" y="140" width="25" height="60" fill="#605e5a" />
      {[0,1,2].map(r => [0,1].map(c => (
        <rect key={`w5-${r}-${c}`} x={370 + c * 10} y={148 + r * 14} width="5" height="8" rx="0.5"
          fill={r % 2 === 0 ? "#b5b0a8" : "#4a4845"} opacity="0.6" />
      )))}

      {/* Church with steeple */}
      <rect x="100" y="130" width="22" height="70" fill="#5a5855" />
      <polygon points="111,130 105,95 117,95" fill="#5a5855" />
      <rect x="109.5" y="87" width="3" height="12" fill="#605e5a" />
      <circle cx="111" cy="86" r="2" fill="#605e5a" />
      {/* Church windows (arched) */}
      <rect x="106" y="138" width="5" height="10" rx="2" fill="#b5b0a8" opacity="0.5" />
      <rect x="114" y="138" width="5" height="10" rx="2" fill="#b5b0a8" opacity="0.5" />

      {/* Trees along street */}
      {[30, 125, 395, 445].map((x, i) => (
        <g key={`tree-${i}`}>
          <rect x={x} y="205" width="2.5" height="15" fill="#3a3835" />
          <ellipse cx={x + 1.25} cy="198" rx="10" ry="14" fill="#3a3835" opacity="0.85" />
          <ellipse cx={x - 2} cy="195" rx="8" ry="11" fill="#444240" opacity="0.7" />
        </g>
      ))}

      {/* Street / road */}
      <rect x="0" y="210" width="480" height="110" fill="url(#csRoad)" />
      {/* Sidewalk */}
      <rect x="0" y="210" width="480" height="8" fill="#706e68" opacity="0.5" />

      {/* Lane markings */}
      {[0,55,110,165,220,275,330,385,440].map((x, i) => (
        <rect key={`lane-${i}`} x={x} y="262" width="30" height="2" rx="1" fill="#8a8884" opacity="0.35" />
      ))}

      {/* Cars */}
      <g>
        <rect x="70" y="240" width="44" height="14" rx="3" fill="#4a4845" />
        <rect x="65" y="236" width="36" height="8" rx="2" fill="#555350" />
        <rect x="70" y="236" width="12" height="6" rx="1" fill="#787570" opacity="0.5" />
        <circle cx="80" cy="255" r="4" fill="#3a3835" />
        <circle cx="105" cy="255" r="4" fill="#3a3835" />
        <circle cx="80" cy="255" r="2" fill="#555350" />
        <circle cx="105" cy="255" r="2" fill="#555350" />
      </g>
      <g>
        <rect x="280" y="270" width="50" height="15" rx="3" fill="#555350" opacity="0.7" />
        <rect x="275" y="266" width="40" height="9" rx="2" fill="#605e5a" opacity="0.7" />
        <rect x="280" y="266" width="14" height="7" rx="1" fill="#787570" opacity="0.4" />
        <circle cx="292" cy="286" r="4" fill="#3a3835" opacity="0.7" />
        <circle cx="318" cy="286" r="4" fill="#3a3835" opacity="0.7" />
      </g>

      {/* Street lamps */}
      <rect x="165" y="195" width="2" height="30" fill="#5a5855" />
      <rect x="159" y="193" width="14" height="3" rx="1" fill="#656360" />
      <ellipse cx="166" cy="192" rx="4" ry="2.5" fill="#d5d0c8" opacity="0.4" />

      <rect x="340" y="195" width="2" height="30" fill="#5a5855" />
      <rect x="334" y="193" width="14" height="3" rx="1" fill="#656360" />
      <ellipse cx="341" cy="192" rx="4" ry="2.5" fill="#d5d0c8" opacity="0.4" />

      {/* Atmospheric haze overlay */}
      <rect width="480" height="320" fill="url(#csHaze)" />

      {/* Grain overlay */}
      <rect width="480" height="320" fill="transparent" filter="url(#csGrain)" opacity="0.04" />
    </svg>
  );
}

/* ─── Photographic People Reading ─── */
function PeoplePhoto() {
  return (
    <svg viewBox="0 0 360 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ppLight" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#a5a098" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6a6560" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ppWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a8580" />
          <stop offset="100%" stopColor="#7a7570" />
        </linearGradient>
      </defs>

      {/* Room background */}
      <rect width="360" height="240" fill="#7a7570" />
      <rect width="360" height="130" fill="#858078" />

      {/* Wall details - frames */}
      <rect x="25" y="18" width="45" height="35" rx="1" fill="#8a8580" stroke="#6a6560" strokeWidth="1" />
      <rect x="28" y="21" width="39" height="29" fill="#6a6560" />
      <rect x="270" y="22" width="40" height="30" rx="1" fill="#8a8580" stroke="#6a6560" strokeWidth="1" />
      <rect x="273" y="25" width="34" height="24" fill="#6a6560" />

      {/* Window light beam (left side) */}
      <polygon points="0,0 60,0 90,240 0,240" fill="#b5b0a8" opacity="0.06" />

      {/* Table */}
      <rect x="30" y="130" width="300" height="6" rx="1" fill="#5a5550" />
      <rect x="55" y="136" width="8" height="55" fill="#4a4540" />
      <rect x="295" y="136" width="8" height="55" fill="#4a4540" />

      {/* Person 1 (left) - reading newspaper */}
      <circle cx="110" cy="82" r="16" fill="#5a5550" />
      <ellipse cx="110" cy="78" rx="14" ry="10" fill="#656058" />
      {/* Hair */}
      <path d="M96 78 Q100 65 110 64 Q120 65 124 78" fill="#4a4540" />
      {/* Body */}
      <rect x="94" y="98" width="32" height="34" rx="6" fill="#504e48" />
      {/* Arms */}
      <rect x="82" y="102" width="14" height="28" rx="5" fill="#504e48" transform="rotate(12 89 116)" />
      <rect x="124" y="102" width="14" height="28" rx="5" fill="#504e48" transform="rotate(-12 131 116)" />

      {/* Newspaper held by person 1 */}
      <rect x="75" y="110" width="85" height="58" rx="1" fill="#d5d0c8" transform="rotate(-5 117 139)" />
      <line x1="117" y1="110" x2="117" y2="168" stroke="#c0bbb4" strokeWidth="0.6" transform="rotate(-5 117 139)" />
      {/* Headline */}
      <rect x="82" y="115" width="30" height="5" rx="0.5" fill="#8a8580" opacity="0.7" transform="rotate(-5 97 117)" />
      {/* Text lines left column */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={`nl1-${i}`} x="82" y={125 + i * 4.5} width={22 + (i % 3) * 4} height="1.2" rx="0.3"
          fill="#a5a098" opacity="0.55" transform="rotate(-5 93 127)" />
      ))}
      {/* Text lines right column */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={`nr1-${i}`} x="122" y={115 + i * 4.5} width={24 + (i % 3) * 3} height="1.2" rx="0.3"
          fill="#a5a098" opacity="0.55" transform="rotate(-5 134 117)" />
      ))}
      {/* Small photo in newspaper */}
      <rect x="83" y="148" width="15" height="12" fill="#9a9590" opacity="0.6" transform="rotate(-5 90 154)" />

      {/* Person 2 (right) - standing, holding clipboard */}
      <circle cx="240" cy="72" r="15" fill="#6a6560" />
      <ellipse cx="240" cy="68" rx="13" ry="9" fill="#757068" />
      <path d="M227 68 Q232 55 240 54 Q248 55 253 68" fill="#555350" />
      {/* Body */}
      <rect x="225" y="87" width="30" height="40" rx="5" fill="#5a5855" />
      {/* Arms */}
      <rect x="220" y="90" width="10" height="24" rx="4" fill="#5a5855" transform="rotate(8 225 102)" />
      <rect x="250" y="90" width="10" height="24" rx="4" fill="#5a5855" transform="rotate(-15 255 102)" />
      {/* Clipboard */}
      <rect x="255" y="100" width="20" height="28" rx="1" fill="#d5d0c8" opacity="0.7" transform="rotate(-5 265 114)" />
      <rect x="258" y="104" width="14" height="2" fill="#a5a098" opacity="0.5" transform="rotate(-5 265 105)" />
      <rect x="258" y="109" width="12" height="1.5" fill="#a5a098" opacity="0.4" transform="rotate(-5 264 110)" />
      <rect x="258" y="113" width="14" height="1.5" fill="#a5a098" opacity="0.4" transform="rotate(-5 264 114)" />

      {/* Person 3 (center, sitting, typing) */}
      <circle cx="180" cy="88" r="13" fill="#5a5550" />
      <ellipse cx="180" cy="85" rx="11" ry="8" fill="#656058" />
      <path d="M169 84 Q174 73 180 72 Q186 73 191 84" fill="#4a4540" />
      {/* Body */}
      <rect x="167" y="101" width="26" height="30" rx="5" fill="#504e48" />
      {/* Arms on desk */}
      <rect x="158" y="110" width="12" height="20" rx="4" fill="#504e48" transform="rotate(15 164 120)" />
      <rect x="190" y="110" width="12" height="20" rx="4" fill="#504e48" transform="rotate(-15 196 120)" />
      {/* Laptop */}
      <rect x="155" y="125" width="50" height="3" rx="0.5" fill="#4a4845" />
      <rect x="160" y="110" width="40" height="18" rx="1" fill="#3a3835" />
      <rect x="162" y="112" width="36" height="14" fill="#444240" />
      {/* Screen glow */}
      <rect x="164" y="114" width="32" height="10" fill="#555350" opacity="0.3" />

      {/* Coffee cup on table */}
      <rect x="305" y="118" width="14" height="12" rx="1" fill="#d5d0c8" opacity="0.6" />
      <ellipse cx="312" cy="118" rx="8" ry="2" fill="#c5c0b8" opacity="0.6" />
      {/* Steam */}
      <path d="M309 114 Q311 108 313 114" fill="none" stroke="#c5c0b8" strokeWidth="0.7" opacity="0.3" />
      <path d="M311 112 Q313 106 315 112" fill="none" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.25" />

      {/* Papers scattered on table */}
      <rect x="180" y="120" width="30" height="20" rx="0.5" fill="#d0ccc4" opacity="0.5" transform="rotate(8 195 130)" />
      <rect x="230" y="118" width="25" height="18" rx="0.5" fill="#c8c4bc" opacity="0.4" transform="rotate(-5 242 127)" />

      {/* Ambient light */}
      <rect width="360" height="240" fill="url(#ppLight)" />

      {/* Subtle vignette */}
      <rect width="360" height="240" fill="transparent" opacity="0.15"
        style={{ filter: "drop-shadow(inset 0 0 40px rgba(0,0,0,0.3))" }} />
    </svg>
  );
}

/* ─── Newspaper Collage Visual ─── */
function NewspaperVisual() {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Back newspaper clipping */}
      <motion.div
        initial={{ opacity: 0, rotate: -6, x: -15 }}
        animate={{ opacity: 1, rotate: -3.5, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-[#fffcf6] border border-[#d8d2c5] rounded-sm shadow-lg overflow-hidden ml-6 mr-14 mb-[-50px] relative z-[1] w-[72%]"
      >
        <div className="border-b border-[#d8d2c5] px-3 pt-2 pb-1">
          <p className="text-[5px] uppercase tracking-[0.2em] text-[#8a8478] text-center font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>
            The Morning Chronicle
          </p>
          <p className="text-[4px] text-center text-[#b5b0a8] uppercase tracking-[0.15em]">Est. 1923 — Final Edition</p>
        </div>
        <div className="w-full h-24 overflow-hidden bg-[#e8e4dc]">
          <PeoplePhoto />
        </div>
        <div className="p-2.5 space-y-1">
          <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
          <div className="h-1 bg-[#d8d2c5]/70 rounded w-4/5" />
          <div className="h-1 bg-[#d8d2c5]/70 rounded w-full" />
          <div className="h-1 bg-[#d8d2c5]/70 rounded w-3/4" />
        </div>
      </motion.div>

      {/* Main newspaper front page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-[#fffcf6] border border-[#d8d2c5] rounded-sm shadow-2xl overflow-hidden relative z-[2]"
      >
        {/* Masthead */}
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

        {/* Article content */}
        <div className="p-4">
          <h4 className="text-xs sm:text-sm font-bold leading-snug mb-3 text-[#1e2522]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Scientists Confirm New Species Discovered in Deep Ocean Expedition
          </h4>
          {/* Press photo - cityscape */}
          <div className="w-full h-40 sm:h-52 rounded-sm overflow-hidden mb-3 relative border border-[#d8d2c5]">
            <CityPhoto />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1e2522]/70 via-[#1e2522]/30 to-transparent px-3 py-2">
              <p className="text-[7px] text-white/80 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Downtown financial district — Aerial survey, September 2025
              </p>
            </div>
          </div>
          {/* Two-column article text */}
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

        {/* Footer */}
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

      {/* Action label cards */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
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
