import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
import {
  Shield, Search, Clock, Home, CheckCircle2, AlertTriangle,
  XCircle, FileText, Trash2, ChevronRight, Brain, BarChart3,
  ArrowLeft, ClipboardPaste, BookOpen, ArrowLeftRight,
  Sun, Moon, Download, Share2, Lightbulb, Target, ArrowRight, Globe,
  Landmark, FlaskConical, Thermometer, Newspaper, TrendingUp,
  PenLine, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatsView } from "@/components/StatsView";
import { MethodologyView } from "@/components/MethodologyView";
import { VerificationPipeline } from "@/components/motion/VerificationPipeline";
import { ExpandableClaim } from "@/components/motion/ExpandableClaim";
import { MorphingPanel } from "@/components/motion/MorphingPanel";
import { EvidenceChain } from "@/components/motion/EvidenceChain";
import { ClaimAnalysis, type Claim } from "@/components/motion/ClaimAnalysis";
import { EvidenceTimeline, type TimelineEvent } from "@/components/motion/EvidenceTimeline";
import { SourceProfile, type SourceProfileData } from "@/components/motion/SourceProfile";
import { CompareArticles, type ComparisonResult } from "@/components/motion/CompareArticles";
import { ArticleFingerprint, type FingerprintData } from "@/components/motion/ArticleFingerprint";
import { SourceCrossCheck, type CrossCheckClaim } from "@/components/motion/SourceCrossCheck";
import { EvidenceMap } from "@/components/motion/EvidenceMap";
import { FramingSignals, type FramingSignal } from "@/components/motion/FramingSignals";
import { FreshnessIndicator, type FreshnessItem } from "@/components/motion/FreshnessIndicator";
import { WhatChanged } from "@/components/motion/WhatChanged";
import { InvestigationReplay } from "@/components/motion/InvestigationReplay";
import { RetrievalFailedState } from "@/components/motion/RetrievalFailedState";
import { getLiveNews, FALLBACK_SAMPLES, getCategoryIconComponent, type LiveArticle } from "@/lib/news";
import { deriveSourceCounts } from "@/lib/investigationStats";

/* ─── Types ─── */
type Verdict = "likely_real" | "likely_fake" | "uncertain";
type ViewType = "home" | "result" | "headlines" | "history" | "compare" | "settings" | "stats" | "methodology";

interface CategoryBreakdown {
  category: string;
  type: "red" | "green";
  score: number;
  maxScore: number;
  findings: string[];
}

interface AnalysisResult {
  verdict: Verdict;
  confidence: number;
  summary: string;
  redFlags: string[];
  greenFlags: string[];
  reasoning: string;
  triggeredKeywords: string[];
  categoryBreakdown: CategoryBreakdown[];
  wordCount: number;
  claims?: Claim[];
  sourceProfile?: SourceProfileData;
  evidenceTimeline?: TimelineEvent[];
  fingerprint?: FingerprintData;
  crossCheck?: CrossCheckClaim[];
  framingSignals?: FramingSignal[];
  freshness?: FreshnessItem[];
  extractedText?: string;
  /** URL retrieval failed — investigation NOT performed (no verdict exists). */
  retrievalFailed?: boolean;
  failedUrl?: string;
  failureReason?: string;
}

/* ─── Status palette — the interface stays monochromatic until status needs meaning ─── */
const STATUS = {
  green: "#8A9A82",
  amber: "#B0A183",
  red: "#B08479",
  gold: "#C9C3B7",
  bronze: "#C9C3B7",
} as const;

const verdictStatus: Record<Verdict, string> = {
  likely_real: STATUS.green,
  uncertain: STATUS.amber,
  likely_fake: STATUS.red,
};

/* ─── Verdict Config (editorial palette) ─── */
const verdictConfig: Record<Verdict, {
  label: string; icon: typeof CheckCircle2; color: string; bg: string;
  border: string; accentColor: string; description: string;
}> = {
  likely_real: {
    label: "Likely Credible", icon: CheckCircle2, color: "text-primary",
    bg: "bg-primary/8", border: "border-primary/20", accentColor: STATUS.green,
    description: "Key factual claims are corroborated by retrieved independent external coverage. Linguistic signals are supplementary only.",
  },
  uncertain: {
    label: "Uncertain", icon: AlertTriangle, color: "text-accent",
    bg: "bg-accent/10", border: "border-accent/25", accentColor: STATUS.amber,
    description: "External evidence is insufficient, mixed, or unavailable — key claims remain unverified. Treat this as unconfirmed.",
  },
  likely_fake: {
    label: "Likely Misleading", icon: XCircle, color: "text-destructive",
    bg: "bg-destructive/10", border: "border-destructive/20", accentColor: STATUS.red,
    description: "Key factual claims are contradicted by retrieved independent external coverage. Language patterns alone never produce this verdict.",
  },
};

/* ─── Signal classifier — observations are signals, never factual claims ─── */
function signalLabelFor(flag: string): string {
  if (/structure|article length|5 w|journalistic|word count/i.test(flag)) return "STRUCTURAL SIGNAL";
  if (/language|wording|sensational|clickbait|emotional|caps|emoji|fear|conspiracy|urgency|sharing|tone|sourcing|certainty|superlative|anonymous|balanc/i.test(flag)) return "LINGUISTIC SIGNAL";
  return "LANGUAGE SIGNAL";
}

/* ─── Static sample fallback — used only when live headlines cannot be fetched ─── */
const sampleTexts = FALLBACK_SAMPLES;

/* ─── Unified sample item type ─── */
interface SampleItem {
  label: string;
  text: string;
  type: "real" | "fake";
  category: string;
  source?: string;
  publishedAt?: string;
  publishedAgo?: string;
  sourceUrl?: string;
  isSnippet?: boolean;
}

/* ─── Tips ─── */
const mediaLiteracyTips = [
  "Always check the source. Is it a recognized news organization with editorial standards?",
  "Look for named sources. Credible articles cite specific people with their titles.",
  "Be wary of ALL CAPS and excessive exclamation marks — professional journalism avoids these.",
  "Check if the article presents multiple perspectives or just one side.",
  "Verify statistics by searching for the original study or data source.",
  "If an article makes you very angry or scared, pause before sharing — that's by design.",
  "Look for specific dates, locations, and quotes — vague articles are less reliable.",
  "Share buttons with 'before they delete it' pressure you into sharing false content.",
];

/* ─── Pipeline Steps ─── */
const pipelineSteps = [
  { key: "ingest", label: "INGESTING TEXT", icon: FileText },
  { key: "language", label: "ANALYZING LANGUAGE", icon: Search },
  { key: "signals", label: "CROSS-CHECKING SIGNALS", icon: Brain },
  { key: "logic", label: "EVALUATING LOGIC", icon: Target },
  { key: "verdict", label: "GENERATING VERDICT", icon: Shield },
];

/* ─── Small formatting helpers ─── */
function fmtFiled(t?: number): string {
  if (!t) return "—";
  return new Date(t)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "Submitted URL"; }
}

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number>(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [value, duration]);

  return <span>{display}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   Shared editorial furniture — typography, rules and numbering instead
   of card grids. Every section header is a newspaper-style rule.
   ═══════════════════════════════════════════════════════════════════ */

function SectionHead({ no, title, dek, right }: {
  no: string; title: string; dek?: string; right?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border pb-2.5">
      <div className="flex items-baseline gap-3 min-w-0">
        <span className="num-marker shrink-0">{no}</span>
        <div className="min-w-0">
          <h2 className="text-[19px] leading-none">{title}</h2>
          {dek && <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{dek}</p>}
        </div>
      </div>
      {right && <div className="shrink-0 pb-0.5">{right}</div>}
    </div>
  );
}

function ReportSection({ id, no, title, dek, aside, children }: {
  id: string; no: string; title: string; dek?: string; aside?: ReactNode; children: ReactNode;
}) {
  return (
    <section id={id} className="report-sec mt-20 lg:mt-32">
      <div className="flex items-start justify-between gap-6 border-b border-border pb-2.5">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="num-marker shrink-0">{no}</span>
          <div className="min-w-0">
            <h2 className="text-[18px] leading-tight">{title}</h2>
            {dek && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground max-w-2xl">{dek}</p>}
          </div>
        </div>
        {aside && <div className="hidden sm:block shrink-0 text-right">{aside}</div>}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

/* Small bordered action — visually secondary to the report itself */
function ActionBtn({ onClick, icon: Icon, children, title }: {
  onClick: () => void; icon: typeof Download; children: ReactNode; title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-8 px-3 border border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
    >
      <Icon className="w-3 h-3" />
      {children}
    </button>
  );
}

/* Single-hairline metric — numbers and rules, never colourful KPI cards */
function MetricBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <div className="py-2.5 border-b border-border/70 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="kicker truncate">{label}</span>
        <span className="font-mono text-[10px] tabular shrink-0" style={{ color: value == null ? "#A5A5A1" : color }}>
          {value == null ? "—" : `${value}%`}
        </span>
      </div>
      <div className="h-[2px] w-full" style={{ background: "#3A3B3E" }}>
        {value != null && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
            style={{ background: color }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── The one editorial image: an inline-SVG front-page plate ───
   Newspaper rules, masthead, column measures, a magnifier and a seal.
   Monochrome, quiet, supporting — never decorative AI artwork. */
function EditorialPlate() {
  const leftLines = [96, 84, 92, 70, 88, 64, 90, 76];
  const rightLines = [88, 74, 92, 60, 84];
  return (
    <svg viewBox="0 0 320 400" className="w-full h-auto" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="308" height="388" stroke="#F1F0EA" strokeOpacity="0.16" />
      <rect x="13" y="13" width="294" height="374" stroke="#F1F0EA" strokeOpacity="0.07" />

      {/* masthead */}
      <text x="160" y="54" textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize="27" letterSpacing="7" fill="#F1F0EA" fillOpacity="0.85">VERITAS</text>
      <text x="160" y="72" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="6.5" letterSpacing="3.4" fill="#A5A5A1">TRUTH · EVIDENCE · CONTEXT</text>
      <line x1="30" y1="84" x2="290" y2="84" stroke="#C9C3B7" strokeOpacity="0.55" />
      <line x1="30" y1="87.5" x2="290" y2="87.5" stroke="#F1F0EA" strokeOpacity="0.16" />

      {/* deck headline */}
      <rect x="30" y="102" width="212" height="8" fill="#F1F0EA" fillOpacity="0.5" />
      <rect x="30" y="116" width="168" height="8" fill="#F1F0EA" fillOpacity="0.32" />
      <text x="30" y="140" fontFamily="'JetBrains Mono', monospace" fontSize="6.5" letterSpacing="2.4" fill="#A5A5A1">FILED BY THE VERIFICATION DESK</text>
      <line x1="30" y1="150" x2="290" y2="150" stroke="#F1F0EA" strokeOpacity="0.12" />

      {/* two column measures */}
      <line x1="160" y1="164" x2="160" y2="316" stroke="#F1F0EA" strokeOpacity="0.1" />
      {leftLines.map((w, i) => (
        <rect key={`l${i}`} x="30" y={168 + i * 17} width={w * 1.6} height="4" fill="#F1F0EA" fillOpacity={0.16 + (i % 3) * 0.05} />
      ))}
      {rightLines.map((w, i) => (
        <rect key={`r${i}`} x="172" y={168 + i * 17} width={w * 0.95} height="4" fill="#F1F0EA" fillOpacity={0.16 + (i % 2) * 0.05} />
      ))}

      {/* magnifier over the right column — investigation, not decoration */}
      <circle cx="220" cy="262" r="38" fill="#202124" fillOpacity="0.92" stroke="#C9C3B7" strokeOpacity="0.75" strokeWidth="1.4" />
      <line x1="247" y1="289" x2="272" y2="314" stroke="#C9C3B7" strokeOpacity="0.75" strokeWidth="3.5" strokeLinecap="round" />
      {[246, 256, 266].map((y, i) => (
        <rect key={`m${i}`} x="194" y={y} width={i === 1 ? 44 : 36} height="3.5" fill="#C9C3B7" fillOpacity={i === 1 ? 0.65 : 0.4} />
      ))}

      {/* seal */}
      <circle cx="56" cy="344" r="20" stroke="#C9C3B7" strokeOpacity="0.5" />
      <circle cx="56" cy="344" r="15" stroke="#C9C3B7" strokeOpacity="0.3" />
      <text x="56" y="342" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="6" letterSpacing="1" fill="#C9C3B7" fillOpacity="0.8">EVERY</text>
      <text x="56" y="351" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="6" letterSpacing="1" fill="#C9C3B7" fillOpacity="0.8">CLAIM</text>

      {/* footer rules + dateline */}
      <line x1="88" y1="336" x2="290" y2="336" stroke="#F1F0EA" strokeOpacity="0.12" />
      <line x1="88" y1="344" x2="290" y2="344" stroke="#F1F0EA" strokeOpacity="0.12" />
      <line x1="88" y1="352" x2="248" y2="352" stroke="#F1F0EA" strokeOpacity="0.12" />
      <line x1="30" y1="372" x2="290" y2="372" stroke="#F1F0EA" strokeOpacity="0.16" />
      <text x="160" y="384" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="6" letterSpacing="3" fill="#A5A5A1">INDEPENDENT · EVIDENCE-LED · OPEN</text>
    </svg>
  );
}

/* ─── Today's headlines — a newsroom column: thin dividers, no cards ─── */
function HeadlinesColumn({ items, loading, onPick, variant = "table" }: {
  items: SampleItem[]; loading: boolean; onPick: (item: SampleItem) => void; variant?: "table" | "stack";
}) {
  if (loading) {
    return (
      <div className="border-t border-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-border animate-pulse">
            <div className="h-2 w-16 shrink-0" style={{ background: "#2B2D30" }} />
            <div className="h-3 flex-1" style={{ background: "#2B2D30" }} />
            <div className="h-2 w-20 shrink-0 hidden sm:block" style={{ background: "#2B2D30" }} />
          </div>
        ))}
      </div>
    );
  }

  /* Stacked newsroom column — 01 / headline / source · time, for the home rail */
  if (variant === "stack") {
    return (
      <div className="border-t border-border">
        {items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onPick(item)}
            className="group w-full text-left border-b border-border row-hover -mx-2 px-2 py-3.5"
          >
            <div className="flex items-start gap-3">
              <span className="num-marker shrink-0 pt-[3px]">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 min-w-0">
                <span
                  className="block text-[13.5px] leading-snug transition-colors group-hover:text-primary"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
                >
                  {item.label}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-1.5">
                  {item.source && <span className="kicker" style={{ color: "#C9C3B7" }}>{item.source}</span>}
                  {item.source && <span className="kicker" style={{ opacity: 0.5 }}>·</span>}
                  <span className="kicker" style={{ opacity: 0.65 }}>{item.category}</span>
                  {item.publishedAgo && <span className="kicker" style={{ opacity: 0.5 }}>·</span>}
                  {item.publishedAgo && <span className="kicker tabular" style={{ opacity: 0.7 }}>{item.publishedAgo}</span>}
                </span>
                {item.isSnippet && (
                  <span className="block kicker mt-1" style={{ opacity: 0.45 }}>Excerpt only — full text unavailable</span>
                )}
              </span>
              <ChevronRight
                className="w-3.5 h-3.5 shrink-0 mt-1 opacity-0 transition-all group-hover:opacity-70 group-hover:translate-x-0.5"
                style={{ color: "#C9C3B7" }}
              />
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {items.map((item) => {
        const CategoryIcon = (() => {
          const name = getCategoryIconComponent(item.category);
          const icons: Record<string, typeof Globe> = { Globe, AlertTriangle, Landmark, TrendingUp, FlaskConical, Thermometer, Newspaper };
          return icons[name] || Newspaper;
        })();
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onPick(item)}
            className="group w-full text-left border-b border-border row-hover -mx-2 px-2 py-3.5"
          >
            <div className="flex items-baseline gap-4">
              <span className="hidden sm:flex items-center gap-1.5 w-[6.5rem] shrink-0">
                <CategoryIcon className="w-3 h-3 shrink-0" style={{ opacity: 0.55 }} />
                <span className="kicker truncate">{item.category}</span>
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className="block text-[14px] leading-snug transition-colors group-hover:text-primary"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
                >
                  {item.label}
                </span>
                <span className="sm:hidden mt-1.5 flex flex-wrap items-center gap-x-2">
                  <span className="kicker">{item.category}</span>
                  {item.source && <span className="kicker opacity-50">·</span>}
                  {item.source && <span className="kicker" style={{ color: "#C9C3B7" }}>{item.source}</span>}
                  {item.publishedAgo && <span className="kicker opacity-50">·</span>}
                  {item.publishedAgo && <span className="kicker" style={{ opacity: 0.7 }}>{item.publishedAgo}</span>}
                </span>
                {item.isSnippet && (
                  <span className="hidden sm:block kicker mt-1 opacity-45">Excerpt only — full text unavailable</span>
                )}
              </span>
              <span className="hidden sm:flex items-center gap-3 w-[9.5rem] justify-end shrink-0">
                <span className="kicker truncate" style={{ color: "#C9C3B7" }}>{item.source}</span>
                <span className="kicker tabular opacity-60 shrink-0">{item.publishedAgo}</span>
              </span>
              <ChevronRight
                className="hidden sm:block w-3.5 h-3.5 shrink-0 translate-y-0.5 opacity-0 transition-all group-hover:opacity-70 group-hover:translate-x-0.5"
                style={{ color: "#C9C3B7" }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

type NavItemDef = { id: string; label: string; icon: typeof Home; view: ViewType; action?: "begin"; disabled?: boolean };

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const analyses = useQuery(api.analyses.listByUser);
  const createAnalysis = useMutation(api.analyses.create);
  const deleteAnalysis = useMutation(api.analyses.remove);
  const runAnalysis = useAction(api.analyzeNews.analyzeNews);

  const [inputText, setInputText] = useState("");
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("home");
  const [currentTip, setCurrentTip] = useState(0);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [resultTab, setResultTab] = useState("verdict");
  const [analysisDepth, setAnalysisDepth] = useState<"quick" | "standard" | "deep">("standard");
  const [credFactor, setCredFactor] = useState<string | null>(null);
  const [liveNews, setLiveNews] = useState<LiveArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ─── Fetch live news on mount ─── */
  useEffect(() => {
    let cancelled = false;
    getLiveNews()
      .then((articles) => { if (!cancelled) setLiveNews(articles); })
      .catch(() => { /* fallback will be used */ })
      .finally(() => { if (!cancelled) setNewsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ─── Build display items: live articles first, then static fallback to fill up to 6 ─── */
  const displayItems: SampleItem[] = (() => {
    const liveItems: SampleItem[] = liveNews.slice(0, 6).map((article) => ({
      label: article.title,
      text: article.fullText,
      type: "real" as const,
      category: article.category,
      source: article.sourceName,
      publishedAt: article.publishedAt,
      publishedAgo: article.publishedAgo,
      sourceUrl: article.sourceUrl,
      isSnippet: article.isSnippet,
    }));
    // Static samples are used ONLY when no live headlines could be fetched —
    // they are never mixed into "Today's Headlines".
    if (liveItems.length === 0) {
      const needed = 6 - liveItems.length;
      const filler = sampleTexts.slice(0, needed);
      liveItems.push(
        ...filler.map((s) => ({
          label: s.label,
          text: s.text,
          type: s.type as "real" | "fake",
          category: s.category,
        }))
      );
    }
    return liveItems;
  })();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTip(t => (t + 1) % mediaLiteracyTips.length), 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && activeView === "home" && !isAnalyzing && inputText.trim()) {
        e.preventDefault();
        handleAnalyze();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeView, isAnalyzing, inputText]);

  useEffect(() => {
    if (!isAnalyzing) return;
    setPipelineStep(0);
    const timers = pipelineSteps.map((_, i) =>
      setTimeout(() => setPipelineStep(i), i * 600 + 200)
    );
    return () => timers.forEach(clearTimeout);
  }, [isAnalyzing]);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) { toast.error("Please enter some text to analyze."); return; }
    if (inputText.trim().length < 20) { toast.error("Please enter at least 20 characters."); return; }
    setIsAnalyzing(true);
    setCurrentResult(null);
    try {
      const result: AnalysisResult = await runAnalysis({ text: inputText.trim(), inputType, depth: analysisDepth });
      setCurrentResult(result);
      setActiveView("result");
      setSavedAt(Date.now());
      setResultTab("verdict");
      // A retrieval failure is NOT an investigation — never persist it as a case file.
      if (!result.retrievalFailed) try {
        await createAnalysis({
          inputText: inputText.trim().slice(0, 5000), inputType,
          verdict: result.verdict, confidence: result.confidence, summary: result.summary,
          redFlags: result.redFlags, greenFlags: result.greenFlags, reasoning: result.reasoning,
          // Persist the SAME investigation result so history replays the real analysis.
          triggeredKeywords: result.triggeredKeywords,
          categoryBreakdown: result.categoryBreakdown,
          wordCount: result.wordCount,
          extractedText: result.extractedText,
          claims: result.claims,
          sourceProfile: result.sourceProfile,
          evidenceTimeline: result.evidenceTimeline,
          fingerprint: result.fingerprint,
          crossCheck: result.crossCheck,
          framingSignals: result.framingSignals,
          freshness: result.freshness,
        });
      } catch { /* best-effort */ }
      if (result.retrievalFailed) toast.error("Could not retrieve the article — no analysis was performed.");
      else toast.success("Analysis complete.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
      setPipelineStep(-1);
    }
  }, [inputText, inputType, runAnalysis, createAnalysis]);

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteAnalysis({ id: id as never }); toast.success("Removed."); }
    catch { toast.error("Failed to delete."); }
  }, [deleteAnalysis]);

  const handleLoadFromHistory = useCallback((analysis: any) => {
    if (!analysis) return;
    // Legacy rows: retrieval failures were stored before the RETRIEVAL FAILED
    // state existed — restore them as retrieval failures, not investigations.
    const legacyFailure: string | null =
      typeof analysis.summary === "string" && analysis.summary.startsWith("UNABLE TO RETRIEVE")
        ? (analysis.summary.match(/\(([^)]+)\)/)?.[1] ??
           "URL could not be accessed or article content could be retrieved.")
        : null;
    setCurrentResult({
      verdict: analysis.verdict, confidence: analysis.confidence, summary: analysis.summary,
      redFlags: analysis.redFlags, greenFlags: analysis.greenFlags, reasoning: analysis.reasoning,
      triggeredKeywords: analysis.triggeredKeywords ?? [], categoryBreakdown: analysis.categoryBreakdown ?? [],
      wordCount: analysis.wordCount ?? analysis.inputText.split(/\s+/).length,
      extractedText: analysis.extractedText ?? undefined,
      claims: analysis.claims ?? undefined,
      sourceProfile: analysis.sourceProfile ?? undefined,
      evidenceTimeline: analysis.evidenceTimeline ?? undefined,
      fingerprint: analysis.fingerprint ?? undefined,
      crossCheck: analysis.crossCheck ?? undefined,
      framingSignals: analysis.framingSignals ?? undefined,
      freshness: analysis.freshness ?? undefined,
      retrievalFailed: legacyFailure ? true : undefined,
      failedUrl: legacyFailure ? analysis.inputText : undefined,
      failureReason: legacyFailure ?? undefined,
    });
    setCredFactor(null);
    setInputText(analysis.inputText); setInputType(analysis.inputType);
    setSavedAt(typeof analysis._creationTime === "number" ? analysis._creationTime : Date.now());
    setResultTab("verdict");
    setActiveView("result");
    window.scrollTo({ top: 0 });
  }, []);

  const getHighlightedParts = useCallback((text: string, keywords: string[]) => {
    if (!keywords.length || !text) return [{ text, highlighted: false }];
    const parts: Array<{ text: string; highlighted: boolean }> = [];
    let remaining = text;
    for (const kw of keywords) {
      const idx = remaining.toLowerCase().indexOf(kw.toLowerCase());
      if (idx >= 0) {
        if (idx > 0) parts.push({ text: remaining.slice(0, idx), highlighted: false });
        parts.push({ text: remaining.slice(idx, idx + kw.length), highlighted: true });
        remaining = remaining.slice(idx + kw.length);
      }
    }
    if (remaining) parts.push({ text: remaining, highlighted: false });
    return parts.length ? parts : [{ text, highlighted: false }];
  }, []);

  const handleExport = useCallback(() => {
    if (!currentResult) return;
    const vc = verdictConfig[currentResult.verdict];
    const text = `VERITAS ANALYSIS REPORT\n${"=".repeat(40)}\n\nVerdict: ${vc.label}\nConfidence: ${currentResult.confidence}%\n\nSummary:\n${currentResult.summary}\n\nReasoning:\n${currentResult.reasoning}\n\nRed Flags (${currentResult.redFlags.length}):\n${currentResult.redFlags.map(f => "  - " + f).join("\n")}\n\nGreen Flags (${currentResult.greenFlags.length}):\n${currentResult.greenFlags.map(f => "  - " + f).join("\n")}\n\nAnalyzed Content:\n${inputText.slice(0, 500)}\n\n--- Generated by Veritas ---`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "veritas-analysis.txt"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded.");
  }, [currentResult, inputText]);

  const handleShare = useCallback(async () => {
    if (!currentResult) return;
    const vc = verdictConfig[currentResult.verdict];
    const shareData = { title: "Veritas Analysis", text: `${vc.label} (${currentResult.confidence}% confidence)\n\n${currentResult.summary}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); toast.success("Copied to clipboard."); }
    } catch { /* cancelled */ }
  }, [currentResult]);

  /* ─── Compare Articles — runs both texts through the REAL pipeline and
     derives the comparison only from actual analysis results ─── */
  const handleCompare = useCallback(async (textA: string, textB: string): Promise<ComparisonResult> => {
    // Run both analyses
    const [resultA, resultB] = await Promise.all([
      runAnalysis({ text: textA, inputType: "text" }),
      runAnalysis({ text: textB, inputType: "text" }),
    ]);

    // ONE investigation per article — the comparison is derived only
    // from the real analysis results (claims, evidence, language signals).
    const sharedClaims: ComparisonResult["sharedClaims"] = [];
    const contradictoryClaims: ComparisonResult["contradictoryClaims"] = [];
    const differentFraming: ComparisonResult["differentFraming"] = [];
    const missingInformation: ComparisonResult["missingInformation"] = [];
    const sourceDifferences: ComparisonResult["sourceDifferences"] = [];

    const tokens = (t: string) => [...new Set(t.toLowerCase().replace(/[^a-z0-9%$\s-]/g, " ").split(/\s+/).filter(w => w.length >= 4))];
    const overlap = (a: string, b: string) => {
      const ta = tokens(a);
      if (ta.length === 0) return 0;
      const tb = new Set(tokens(b));
      return ta.filter(t => tb.has(t)).length / ta.length;
    };

    const claimsA = resultA.claims ?? [];
    const claimsB = resultB.claims ?? [];

    // SHARED CLAIMS — statements present in both articles (real text overlap only).
    const matchedB = new Set<number>();
    for (const ca of claimsA) {
      const match = claimsB.find(cb => !matchedB.has(cb.id) && overlap(ca.text, cb.text) >= 0.5);
      if (!match) continue;
      matchedB.add(match.id);
      const conflict = ca.status !== match.status &&
        (ca.status === "contradicted" || match.status === "contradicted");
      const agree = ca.status === match.status && ca.status === "supported";
      sharedClaims.push({
        claim: ca.text,
        relationship: conflict ? "conflict" : agree ? "agree" : "unverified",
      });
      // CONFLICT is only reported when evidence-backed statuses genuinely differ.
      if (conflict) {
        contradictoryClaims.push({
          claimA: `Article A — ${ca.status.replace("_", " ")}: ${ca.evidence}`,
          claimB: `Article B — ${match.status.replace("_", " ")}: ${match.evidence}`,
          explanation: "The same claim received different evidence-backed statuses in the two analyses of retrieved coverage.",
        });
      }
    }
    if (sharedClaims.length === 0 && claimsA.length === 0 && claimsB.length === 0) {
      sharedClaims.push({ claim: "No distinct factual claims could be extracted from either article — insufficient evidence available for comparison.", relationship: "unverified" });
    }

    // DIFFERENT FRAMING — real differences in assessment and language.
    if (resultA.verdict !== resultB.verdict) {
      differentFraming.push({
        topic: "Overall assessment",
        framingA: resultA.summary.slice(0, 180),
        framingB: resultB.summary.slice(0, 180),
      });
    }
    const onlyA = resultA.triggeredKeywords.filter(k => !resultB.triggeredKeywords.includes(k));
    const onlyB = resultB.triggeredKeywords.filter(k => !resultA.triggeredKeywords.includes(k));
    if (onlyA.length > 0 || onlyB.length > 0) {
      differentFraming.push({
        topic: "Warning language",
        framingA: onlyA.length > 0 ? `Only in A: ${onlyA.slice(0, 3).join(", ")}` : "No unique warning language",
        framingB: onlyB.length > 0 ? `Only in B: ${onlyB.slice(0, 3).join(", ")}` : "No unique warning language",
      });
    }

    // MISSING INFORMATION — figures present in one article but not the other.
    const nums = (t: string) => [...new Set((t.match(/\d+(?:[.,]\d+)*/g) || []).map(n => n.replace(/,/g, "")))];
    const numsA = nums(textA);
    const numsB = nums(textB);
    const setA = new Set(numsA);
    const setB = new Set(numsB);
    numsA.filter(n => !setB.has(n)).slice(0, 5).forEach(n =>
      missingInformation.push({ present: "A", information: `Figure "${n}" appears in Article A but not in Article B.` }));
    numsB.filter(n => !setA.has(n)).slice(0, 5).forEach(n =>
      missingInformation.push({ present: "B", information: `Figure "${n}" appears in Article B but not in Article A.` }));

    // SOURCE DIFFERENCES — what each analysis actually detected.
    const srcA = resultA.sourceProfile?.source ?? "NOT AVAILABLE";
    const srcB = resultB.sourceProfile?.source ?? "NOT AVAILABLE";
    if (srcA !== srcB) {
      sourceDifferences.push({ source: "Named source attribution", inArticle: "A", detail: srcA === "NOT AVAILABLE" ? "No named source detected in Article A" : `Detected in Article A: ${srcA}` });
      sourceDifferences.push({ source: "Named source attribution", inArticle: "B", detail: srcB === "NOT AVAILABLE" ? "No named source detected in Article B" : `Detected in Article B: ${srcB}` });
    }
    if (resultA.wordCount !== resultB.wordCount) {
      const longer: "A" | "B" = resultA.wordCount > resultB.wordCount ? "A" : "B";
      sourceDifferences.push({
        source: "Content length",
        inArticle: longer,
        detail: `Article ${longer} is longer (${Math.max(resultA.wordCount, resultB.wordCount)} words vs ${Math.min(resultA.wordCount, resultB.wordCount)})`,
      });
    }

    return { sharedClaims, contradictoryClaims, differentFraming, missingInformation, sourceDifferences };
  }, [runAnalysis]);

  const vc = currentResult ? verdictConfig[currentResult.verdict] : null;
  // Distinct state: URL retrieval failed → no investigation, no verdict.
  const retrievalFailed = !!currentResult?.retrievalFailed;

  /* ─── Real evidence stats — derived ONCE from the single investigation result ─── */
  const evidenceStats = (() => {
    if (!currentResult) return null;
    const claims = currentResult.claims ?? [];
    const crossCheck = currentResult.crossCheck ?? [];
    // ONE shared derivation (src/lib/investigationStats) — the same source of
    // truth used by the engine, Evidence Map, Timeline, Replay and Final
    // Assessment, so aggregate refs always equal the sum of per-claim refs.
    const sourceCounts = deriveSourceCounts(crossCheck);
    const retrieved = sourceCounts.retrieved;
    const supported = claims.filter(c => c.status === "supported").length;
    const contradicted = claims.filter(c => c.status === "contradicted").length;
    const uncertain = claims.filter(c => c.status === "uncertain").length;
    const unverified = claims.length - supported - contradicted - uncertain;
    const supporting = sourceCounts.supporting;
    const contradicting = sourceCounts.contradicting;
    const partial = sourceCounts.partial;
    const addressed = crossCheck.filter(c => c.sources.some(s => !!s.url)).length;
    const searchFailed = crossCheck.length > 0 &&
      crossCheck.every(c => c.sources.length === 0 ||
        c.sources.every(s => !s.url && s.name === "SOURCE SEARCH UNAVAILABLE"));
    const signals = currentResult.sourceProfile?.signals ?? [];
    const signalsAvailable = signals.filter(s => s.available).length;
    const redScore = currentResult.categoryBreakdown.filter(c => c.type === "red").reduce((a, c) => a + c.score, 0);
    const greenScore = currentResult.categoryBreakdown.filter(c => c.type === "green").reduce((a, c) => a + c.score, 0);
    return {
      claims, crossCheck, crossChecked: crossCheck.length,
      uniqueRetrieved: sourceCounts.uniqueSources,
      claimSourceRefs: sourceCounts.claimSourceRefs,
      supported, contradicted, uncertain, unverified, supporting, contradicting, partial,
      addressed, searchFailed, signals, signalsAvailable, redScore, greenScore,
    };
  })();

  /* ─── Credibility factors — every score derives from real analysis data ─── */
  const credibilityFactors = (() => {
    if (!evidenceStats) return [] as Array<{ key: string; label: string; score: number | null; reasoning: string }>;
    const s = evidenceStats;
    const hasSignals = s.signals.length > 0;
    const langTotal = s.redScore + s.greenScore;
    const foundSignals = s.signals.filter(x => x.available).map(x => x.label);
    return [
      {
        key: "source", label: "Source Reliability",
        score: hasSignals ? Math.round((s.signalsAvailable / s.signals.length) * 100) : null,
        reasoning: hasSignals
          ? `${s.signalsAvailable} of ${s.signals.length} source metadata signals were detected in the submitted text (${foundSignals.slice(0, 3).join(", ")}${foundSignals.length > 3 ? ", …" : ""}). This is detection inside the text only — it is not independent verification.`
          : "Insufficient evidence available — no source metadata could be extracted from the submitted text.",
      },
      {
        key: "claims", label: "Claim Consistency",
        score: s.claims.length > 0 ? Math.round(((s.supported + 0.5 * s.uncertain) / s.claims.length) * 100) : null,
        reasoning: s.claims.length > 0
          ? `${s.supported} of ${s.claims.length} extracted claim(s) corroborated by retrieved independent coverage · ${s.contradicted} contradicted · ${s.uncertain} uncertain · ${s.unverified} unverified. Absence of corroboration is not proof of falsity.`
          : "Insufficient evidence available — no factual claims could be extracted for cross-checking.",
      },
      {
        key: "language", label: "Language Signal",
        score: langTotal > 0 ? Math.round((s.greenScore / langTotal) * 100) : null,
        reasoning: langTotal > 0
          ? `Linguistic pattern analysis of the submitted text: ${s.greenScore} positive vs ${s.redScore} warning signal weight. Supplementary only — this measures writing style, not whether the content is true.`
          : "Insufficient evidence available — no linguistic signal categories were produced for this analysis.",
      },
      {
        key: "evidence", label: "Evidence Strength",
        score: s.crossChecked > 0 ? Math.round((s.addressed / s.crossChecked) * 100) : null,
        reasoning: s.crossChecked > 0
          ? (s.searchFailed
            ? "External source search unavailable — insufficient evidence available."
            : `${s.addressed} of ${s.crossChecked} cross-checked claim(s) had at least one independent source retrieved — ${s.uniqueRetrieved} unique source(s) across ${s.claimSourceRefs} claim–source reference(s): ${s.supporting} supporting, ${s.partial} partial, ${s.contradicting} contradicting.${s.uniqueRetrieved === 0 ? " NO INDEPENDENT CORROBORATION FOUND." : ""}`)
          : "Insufficient evidence available — no claims were cross-checked against external sources.",
      },
    ];
  })();

  /* ─── Language signal rows — real linguistic data only ─── */
  const languageRows = (() => {
    if (!currentResult || !evidenceStats) return [] as Array<{ label: string; value: number | null; color: string }>;
    const catPct = (name: string) => {
      const c = currentResult.categoryBreakdown.find(x => x.category === name);
      return c && c.maxScore > 0 ? Math.round((c.score / c.maxScore) * 100) : null;
    };
    const total = evidenceStats.redScore + evidenceStats.greenScore;
    return [
      { label: "Factual Language", value: total > 0 ? Math.round((evidenceStats.greenScore / total) * 100) : null, color: STATUS.bronze },
      { label: "Warning Load", value: total > 0 ? Math.round((evidenceStats.redScore / total) * 100) : null, color: evidenceStats.redScore > evidenceStats.greenScore ? STATUS.red : STATUS.bronze },
      { label: "Attribution", value: catPct("Attribution Language"), color: STATUS.bronze },
      { label: "Structure", value: catPct("Journalistic Structure"), color: STATUS.bronze },
    ];
  })();

  /* ─── Navigation — slim editorial desk + report groups ─── */
  const navGroups: Array<{ title: string; items: NavItemDef[] }> = [
    {
      title: "Desk",
      items: [
        { id: "home", label: "Home", icon: Home, view: "home" },
        { id: "new", label: "New Analysis", icon: PenLine, view: "home", action: "begin" },
        { id: "headlines", label: "Daily Headlines", icon: Newspaper, view: "headlines" },
        { id: "history", label: "Past Investigations", icon: Clock, view: "history" },
        { id: "compare", label: "Compare Articles", icon: ArrowLeftRight, view: "compare" },
        { id: "settings", label: "Settings", icon: Settings, view: "settings" },
      ],
    },
    {
      title: "Report",
      items: [
        { id: "investigation", label: "Investigation", icon: FileText, view: "result", disabled: !currentResult },
        { id: "stats", label: "Statistics", icon: BarChart3, view: "stats" },
        { id: "methodology", label: "Methodology", icon: BookOpen, view: "methodology" },
      ],
    },
  ];
  const allNavItems = navGroups.flatMap(g => g.items);

  const goDesk = useCallback((toBegin = false) => {
    const wasHome = activeView === "home";
    setActiveView("home");
    if (!wasHome) window.scrollTo({ top: 0 });
    if (toBegin) {
      setTimeout(() => document.getElementById("begin")?.scrollIntoView({ behavior: "smooth", block: "start" }), wasHome ? 10 : 380);
    }
  }, [activeView]);

  const goNav = (item: NavItemDef) => {
    if (item.disabled) return;
    if (item.action === "begin") { goDesk(true); return; }
    setActiveView(item.view);
    window.scrollTo({ top: 0 });
  };

  const pickHeadline = (item: SampleItem) => {
    setInputText(item.text);
    setInputType("text");
    setTimeout(() => document.getElementById("begin")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  /* ─── Report contents — single source of truth for rail + numbering ─── */
  const reportSections: Array<{ id: string; label: string }> =
    currentResult && !currentResult.retrievalFailed
      ? [
          { id: "verdict", label: "Verdict" },
          ...(currentResult.claims && currentResult.claims.length > 0 ? [{ id: "claims", label: "Claim analysis" }] : []),
          ...(currentResult.crossCheck && currentResult.crossCheck.length > 0 ? [{ id: "crosscheck", label: "Source cross-check" }] : []),
          { id: "chain", label: "Evidence chain" },
          { id: "map", label: "Evidence map" },
          ...(currentResult.evidenceTimeline && currentResult.evidenceTimeline.length > 0 ? [{ id: "timeline", label: "Timeline" }] : []),
          { id: "language", label: "Language analysis" },
          ...(currentResult.framingSignals ? [{ id: "framing", label: "Framing signals" }] : []),
          ...(currentResult.sourceProfile ? [{ id: "sourceprofile", label: "Source profile" }] : []),
          ...(currentResult.freshness ? [{ id: "freshness", label: "Freshness" }] : []),
          ...(currentResult.fingerprint ? [{ id: "fingerprint", label: "Fingerprint" }] : []),
          { id: "replay", label: "Investigation replay" },
          { id: "whatchanged", label: "What changed?" },
          { id: "compare", label: "Compare articles" },
          { id: "content", label: "Analyzed content" },
        ]
      : [];

  const secNo = (id: string) => String(reportSections.findIndex(s => s.id === id) + 1).padStart(2, "0");

  const goToSection = (id: string) => {
    setResultTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* Scroll-spy — the contents rail follows the section being read */
  useEffect(() => {
    if (activeView !== "result" || !currentResult || currentResult.retrievalFailed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setResultTab(visible.target.id);
      },
      { rootMargin: "-38% 0px -55% 0px", threshold: 0 }
    );
    reportSections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, currentResult]);

  /* ─── Statistics — real totals from the archive: fingerprint sums plus verdict counts ─── */
  const statCells: { label: string; value: number | null }[] = analyses
    ? [
        { label: "Investigations", value: analyses.length },
        { label: "Claims checked", value: analyses.reduce((sum, a) => sum + (a.fingerprint?.claims ?? 0), 0) },
        { label: "Sources found", value: analyses.reduce((sum, a) => sum + (a.fingerprint?.sources ?? 0), 0) },
        { label: "Contradictions", value: analyses.reduce((sum, a) => sum + (a.fingerprint?.contradicted ?? 0), 0) },
      ]
    : [
        { label: "Investigations", value: null },
        { label: "Claims checked", value: null },
        { label: "Sources found", value: null },
        { label: "Contradictions", value: null },
      ];
  const verdictTally = analyses
    ? `${analyses.filter((a) => a.verdict === "likely_real").length} credible · ${analyses.filter((a) => a.verdict === "uncertain").length} uncertain · ${analyses.filter((a) => a.verdict === "likely_fake").length} misleading`
    : null;

  /* ─── Investigation masthead derivation — real content only ─── */
  const reportHeadline = (() => {
    const raw = (currentResult?.extractedText || inputText || "").trim();
    const first = raw.split(/\n/).map(s => s.trim()).find(s => s.length > 0) ?? "";
    const base = first.length > 0 ? first : (inputText.trim() || "Untitled submission");
    return base.length > 120 ? `${base.slice(0, 120).replace(/\s+\S*$/, "")}…` : base;
  })();
  const filedLabel = fmtFiled(savedAt ?? undefined);
  const sourceMetaLine = currentResult
    ? `${inputType === "url" ? hostOf(inputText) : "Submitted text"} · ${filedLabel} · ${inputType === "url" ? "URL" : "Pasted text"} · ${currentResult.claims?.length ?? 0} claims extracted`
    : "";
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const editionLabel = fmtFiled(Date.now());

  /* ─── Archive row — a record in a newsroom archive ───
     variant "row"     → table record used by Past Investigations
     variant "archive" → stacked entry used on the home page:
                          01 / headline / source · date / verdict · confidence */
  const renderArchiveRow = (analysis: any, i: number, variant: "row" | "archive" = "row") => {
    const avc = verdictConfig[(analysis.verdict as Verdict) ?? "uncertain"];
    // Legacy rows: a stored retrieval failure is NOT an investigation.
    const wasRetrievalFailure =
      typeof analysis.summary === "string" && analysis.summary.startsWith("UNABLE TO RETRIEVE");
    const statusColor = wasRetrievalFailure ? "#A5A5A1" : (verdictStatus[analysis.verdict as Verdict] ?? "#A5A5A1");
    const statusLabel = wasRetrievalFailure ? "Retrieval failed" : avc.label;
    const subject: string = analysis.inputType === "url"
      ? analysis.inputText
      : (analysis.inputText || "").trim().split(/\s+/).slice(0, 16).join(" ");
    const sourceLabel = analysis.inputType === "url" ? hostOf(analysis.inputText) : "Typed text";

    if (variant === "archive") {
      return (
        <motion.div
          key={analysis._id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
          role="button"
          tabIndex={0}
          onClick={() => handleLoadFromHistory(analysis)}
          onKeyDown={(e) => { if (e.key === "Enter") handleLoadFromHistory(analysis); }}
          className="group cursor-pointer border-b border-border row-hover"
        >
          <div className="flex items-start gap-4 px-2 py-4">
            <span className="num-marker shrink-0 pt-[3px]">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] leading-snug break-words" style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}>
                {subject || "Untitled submission"}
              </p>
              <p className="mt-1.5 kicker" style={{ opacity: 0.65 }}>
                {sourceLabel} <span style={{ opacity: 0.55 }}>·</span> {fmtFiled(analysis._creationTime)}
              </p>
              <p className="mt-1.5 kicker" style={{ color: statusColor }}>
                {statusLabel.toUpperCase()}
                {!wasRetrievalFailure && <span className="tabular"> · {analysis.confidence}%</span>}
              </p>
            </div>
            <span className="shrink-0 flex items-center gap-1 pt-0.5">
              <button
                type="button"
                aria-label="Remove from archive"
                onClick={(e) => { e.stopPropagation(); handleDelete(analysis._id); }}
                className="p-1.5 opacity-0 group-hover:opacity-70 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight
                className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity"
                style={{ color: "#C9C3B7" }}
              />
            </span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={analysis._id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
        role="button"
        tabIndex={0}
        onClick={() => handleLoadFromHistory(analysis)}
        onKeyDown={(e) => { if (e.key === "Enter") handleLoadFromHistory(analysis); }}
        className="group cursor-pointer border-b border-border row-hover"
      >
        <div className="flex items-center gap-4 px-2 py-3.5">
          <span className="num-marker w-6 hidden sm:block opacity-70">{String(i + 1).padStart(2, "0")}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] leading-snug truncate" style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}>
              {subject || "Untitled submission"}
            </p>
            <p className="sm:hidden mt-1.5 flex flex-wrap items-center gap-x-2">
              <span className="kicker opacity-70">{fmtFiled(analysis._creationTime)}</span>
              <span className="kicker" style={{ color: statusColor }}>{statusLabel}</span>
              {!wasRetrievalFailure && <span className="kicker tabular opacity-70">{analysis.confidence}%</span>}
            </p>
          </div>
          <span className="hidden sm:block w-[6.5rem] shrink-0 kicker opacity-70">{fmtFiled(analysis._creationTime)}</span>
          <span className="hidden sm:flex w-[8.5rem] shrink-0 items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusColor }} />
            <span className="text-[11px] truncate" style={{ color: statusColor }}>{statusLabel}</span>
          </span>
          <span className="hidden sm:block w-10 shrink-0 text-right kicker tabular opacity-80">
            {wasRetrievalFailure ? "—" : `${analysis.confidence}%`}
          </span>
          <span className="hidden sm:block w-[6.5rem] shrink-0 text-right kicker truncate opacity-70">{sourceLabel}</span>
          <span className="w-12 shrink-0 flex items-center justify-end">
            <button
              type="button"
              aria-label="Remove from archive"
              onClick={(e) => { e.stopPropagation(); handleDelete(analysis._id); }}
              className="p-1.5 opacity-0 group-hover:opacity-70 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <ChevronRight
              className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity"
              style={{ color: "#C9C3B7" }}
            />
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Desktop: dark charcoal navigation rail — a publication index, not an admin panel ─── */}
      <aside className="veritas-nav-surface hidden lg:flex fixed inset-y-0 left-0 z-40 w-56 flex-col" style={{ background: "#151618" }}>
        <div className="px-5 pt-7 pb-6">
          <button type="button" className="flex items-center gap-2.5" onClick={() => navigate("/")}>
            <Shield className="w-4 h-4" style={{ color: "#C9C3B7" }} />
            <span className="text-[16px] uppercase tracking-[0.28em]" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}>
              Veritas
            </span>
          </button>
          <p className="mt-2.5 kicker" style={{ fontSize: 9, letterSpacing: "0.28em", color: "#7E7F83" }}>Truth · Evidence · Context</p>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="kicker px-1 mb-2" style={{ color: "#7E7F83" }}>{group.title}</p>
              <div>
                {group.items.map((item) => {
                  const active = activeView === item.view && !item.action;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => goNav(item)}
                      title={item.disabled ? "Run an investigation first" : item.label}
                      className={`relative w-full flex items-center gap-2.5 pl-3 pr-2 py-2 text-left transition-colors ${
                        item.disabled
                          ? "opacity-35 cursor-not-allowed"
                          : active
                            ? "text-[#F1F0EA]"
                            : "text-[#A5A5A1] hover:text-[#F1F0EA]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute left-0 top-0 bottom-0 w-px"
                          style={{ background: "#C9C3B7" }}
                        />
                      )}
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[12px] tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 flex items-end justify-between gap-2" style={{ borderTop: "1px solid rgba(241,240,234,0.12)" }}>
          <div className="min-w-0">
            <p className="kicker" style={{ fontSize: 9, color: "#7E7F83" }}>Edition</p>
            <p className="kicker mt-1 tabular" style={{ fontSize: 9, color: "#A5A5A1" }}>{editionLabel}</p>
          </div>
          <button
            type="button"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 transition-colors hover:text-[#F1F0EA]"
            style={{ border: "1px solid rgba(241,240,234,0.18)", color: "#A5A5A1" }}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* ─── Mobile: compact charcoal header — same publication navigation, no vertical waste ─── */}
      <header className="veritas-nav-surface lg:hidden sticky top-0 z-50" style={{ background: "#151618", borderBottom: "1px solid rgba(241,240,234,0.14)" }}>
        <div className="h-12 pl-3 pr-2 flex items-center">
          <button type="button" className="flex items-center gap-2 pr-3 h-full shrink-0" onClick={() => navigate("/")}>
            <Shield className="w-3.5 h-3.5" style={{ color: "#C9C3B7" }} />
            <span className="text-[13px] uppercase tracking-[0.24em]" style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}>
              Veritas
            </span>
          </button>
          <div className="flex-1 min-w-0 flex items-center justify-end gap-0.5 overflow-x-auto no-scrollbar pl-2" style={{ borderLeft: "1px solid rgba(241,240,234,0.14)" }}>
            {allNavItems.map((item) => {
              const active = activeView === item.view && !item.action;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => goNav(item)}
                  className={`shrink-0 h-8 w-8 flex items-center justify-center transition-colors ${
                    item.disabled ? "opacity-35" : active ? "text-[#F1F0EA]" : "text-[#A5A5A1]"
                  }`}
                  style={active ? { background: "rgba(241,240,234,0.08)" } : undefined}
                >
                  <item.icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ─── Main desk ─── */}
      <div className="lg:pl-56">
        <main className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12 pt-12 lg:pt-24 pb-32">
          <AnimatePresence mode="wait">
            {/* ═══════════════ HOME ═══════════════ */}
            {activeView === "home" && (
              <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>

                {/* Pipeline overlay */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
                      style={{ background: "rgba(32,33,36,0.97)" }}
                    >
                      <div className="w-full max-w-sm">
                        <div className="flex items-baseline justify-between border-b pb-1.5" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                          <span className="kicker" style={{ color: "#C9C3B7" }}>Veritas</span>
                          <span className="kicker">Verification in progress</span>
                        </div>
                        <div className="border-b border-border mt-[3px]" />
                        <h2 className="mt-6 text-2xl">Investigating the claim</h2>
                        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                          Retrieving sources, extracting claims and cross-checking evidence. This usually takes a few seconds.
                        </p>
                        <div className="mt-7">
                          <VerificationPipeline currentStep={pipelineStep} />
                        </div>
                        <div className="mt-6 h-px w-full overflow-hidden" style={{ background: "#3A3B3E" }}>
                          <motion.div
                            className="h-full"
                            initial={{ width: "4%" }}
                            animate={{ width: "96%" }}
                            transition={{ duration: 3.6, ease: "easeInOut" }}
                            style={{ background: "#C9C3B7" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── Hero — the opening of the desk, set like a front page ─── */}
                <section className="grid lg:grid-cols-[1.65fr_0.75fr] gap-x-16 gap-y-16 items-start">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="kicker shrink-0" style={{ color: "#C9C3B7" }}>
                        Veritas / Investigation desk
                      </span>
                      <span className="h-px flex-1" style={{ background: "#3A3B3E" }} />
                      <span className="kicker shrink-0 hidden sm:inline">{todayLabel}</span>
                    </div>

                    <h1 className="mt-12 sm:mt-16 font-serif-editorial text-[clamp(2.1rem,6vw,3.75rem)] leading-[1.05] text-[#F1F0EA]">
                      <span className="block">Verify what you read.</span>
                      <span className="block text-[#8E8E8A]">Follow the evidence.</span>
                    </h1>

                    <p className="mt-9 text-[14px] leading-[1.75] text-muted-foreground max-w-[46ch]">
                      Veritas helps you cut through misinformation with real sources, transparent analysis, and clear context.
                    </p>

                    <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4">
                      <Button
                        onClick={() => goDesk(true)}
                        className="group h-11 px-7 gap-2.5 text-[10.5px] uppercase tracking-[0.18em] transition-opacity duration-300 hover:opacity-80"
                        style={{ background: "#C9C3B7", color: "#151618" }}
                      >
                        Begin an investigation
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                      </Button>
                      <button
                        type="button"
                        onClick={() => { setActiveView("methodology"); window.scrollTo({ top: 0 }); }}
                        className="kicker ul-hover pb-1 transition-colors hover:text-foreground"
                      >
                        How Veritas works →
                      </button>
                    </div>

                    <div className="mt-14 pt-5 border-t border-border flex flex-wrap gap-x-8 gap-y-2">
                      <span className="kicker">Live source retrieval</span>
                      <span className="kicker">Claim-level cross-check</span>
                      <span className="kicker">Evidence-first verdicts</span>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    className="hidden lg:block w-full max-w-[240px] justify-self-end"
                  >
                    <EditorialPlate />
                    <p className="mt-4 kicker" style={{ opacity: 0.5 }}>Fig. 01 — The verification desk</p>
                  </motion.div>
                </section>

                {/* ─── The desk — workbench left, wire and ledger right ─── */}
                <div className="mt-24 lg:mt-36 grid lg:grid-cols-[1.6fr_1fr] gap-y-20 lg:gap-y-0 items-start">
                  <div className="min-w-0 lg:pr-12">

                    {/* ─── 01 · Begin an investigation ─── */}
                    <section id="begin" className="report-sec">
                      <SectionHead
                        no="01"
                        title="New analysis"
                        dek="Submit a URL or pasted text — Veritas retrieves live sources, extracts factual claims and cross-checks each one against independent coverage."
                      />

                      {/* Mode + depth — underlined editorial tabs */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-1 border-b border-border">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => setInputType("url")}
                            className={`relative px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                              inputType === "url" ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
                            }`}
                          >
                            Paste URL
                            {inputType === "url" && (
                              <motion.span layoutId="mode-tab" className="absolute left-0 right-0 -bottom-px h-[1.5px]" style={{ background: "#C9C3B7" }} />
                            )}
                          </button>
                          <span className="kicker px-1.5" style={{ opacity: 0.4 }}>or</span>
                          <button
                            type="button"
                            onClick={() => setInputType("text")}
                            className={`relative px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                              inputType === "text" ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
                            }`}
                          >
                            Paste Text
                            {inputType === "text" && (
                              <motion.span layoutId="mode-tab" className="absolute left-0 right-0 -bottom-px h-[1.5px]" style={{ background: "#C9C3B7" }} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center">
                          <span className="kicker mr-3 hidden sm:inline" style={{ opacity: 0.5 }}>Depth</span>
                          {(["quick", "standard", "deep"] as const).map((depth) => (
                            <button
                              key={depth}
                              type="button"
                              onClick={() => setAnalysisDepth(depth)}
                              className={`relative px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                                analysisDepth === depth ? "text-foreground" : "text-muted-foreground/45 hover:text-muted-foreground"
                              }`}
                            >
                              {depth}
                              {analysisDepth === depth && (
                                <motion.span layoutId="depth-tab" className="absolute left-0 right-0 -bottom-px h-[1.5px]" style={{ background: "#C9C3B7" }} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-[10.5px] text-muted-foreground">
                        {analysisDepth === "quick" && "Fast scan — basic pattern matching and keyword detection."}
                        {analysisDepth === "standard" && "Full analysis — NLP patterns, source checks, and claim verification."}
                        {analysisDepth === "deep" && "Comprehensive — deep linguistic analysis, cross-referencing, and detailed reasoning."}
                      </p>

                      {/* Editor — one bordered instrument, not a floating card */}
                      <div className="mt-4 border border-border" style={{ background: "#252629" }}>
                        <Textarea
                          ref={textareaRef}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder={inputType === "text" ? "Paste your news article, headline or text here..." : "Paste a news URL here..."}
                          className="min-h-[170px] sm:min-h-[200px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[13.5px] leading-relaxed placeholder:text-muted-foreground/40"
                        />
                        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
                          <span className="kicker tabular">
                            {inputText.length > 0
                              ? `${inputText.length.toLocaleString()} characters`
                              : inputType === "url" ? "Awaiting article URL" : "Awaiting article text"}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="kicker mr-2 hidden sm:inline" style={{ opacity: 0.5 }}>Ctrl + Enter</span>
                            <button
                              type="button"
                              className="kicker px-2 py-1 transition-colors hover:text-foreground"
                              onClick={() => navigator.clipboard.readText().then(t => { setInputText(t); toast.success("Pasted!"); }).catch(() => toast.error("Unable to read clipboard."))}
                            >
                              <span className="inline-flex items-center gap-1"><ClipboardPaste className="w-3 h-3" />Paste</span>
                            </button>
                            <button
                              type="button"
                              className="kicker px-2 py-1 transition-colors hover:text-foreground disabled:opacity-30"
                              disabled={!inputText}
                              onClick={() => setInputText("")}
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Actions — a rotating media-literacy note beside the single strong CTA */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentTip}
                            initial={{ opacity: 0, y: -3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 3 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start gap-2 max-w-md"
                          >
                            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#B0A183" }} />
                            <p className="text-[11px] leading-relaxed text-muted-foreground italic">{mediaLiteracyTips[currentTip]}</p>
                          </motion.div>
                        </AnimatePresence>
                        <Button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !inputText.trim()}
                          className="group shrink-0 h-11 px-7 gap-2 text-[10.5px] uppercase tracking-[0.16em] hover:opacity-90 disabled:opacity-40"
                          style={{ background: "#C9C3B7", color: "#151618" }}
                        >
                          Analyze
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </section>

                    {/* ─── 02 · Veritas at a glance — one horizontal strip, thin vertical rules ─── */}
                    <section className="mt-20 lg:mt-28">
                      <SectionHead
                        no="02"
                        title="Veritas at a glance"
                        dek="Real totals from your archive, summed as investigations are filed."
                      />
                      <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 border-t border-b border-border">
                        {statCells.map((cell, i) => (
                          <div
                            key={cell.label}
                            className={`py-7 sm:py-8 ${
                              i % 2 !== 0 ? "border-l border-border pl-5" : "pr-5"
                            } ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${
                              i === 2 ? "sm:border-l sm:border-border sm:pl-5" : ""
                            } ${i === 3 ? "sm:border-l sm:border-border sm:pl-5" : ""}`}
                          >
                            <p
                              className="font-serif-editorial text-[30px] sm:text-[36px] leading-none tabular"
                              style={{ color: cell.value == null ? "#6F7074" : "#F1F0EA" }}
                            >
                              {cell.value == null ? "—" : <AnimatedNumber value={cell.value} />}
                            </p>
                            <p className="kicker mt-3.5" style={{ opacity: 0.65, letterSpacing: "0.16em" }}>{cell.label}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* ─── 03 · Recent investigations — the archive ─── */}
                    <section className="mt-20 lg:mt-28">
                      <SectionHead
                        no="03"
                        title="Recent investigations"
                        dek="Every filed case — verdicts are generated from retrieved evidence, never from language alone."
                        right={
                          <button
                            type="button"
                            onClick={() => { setActiveView("history"); window.scrollTo({ top: 0 }); }}
                            className="kicker ul-hover transition-colors hover:text-foreground"
                          >
                            View all →
                          </button>
                        }
                      />
                      {analyses === undefined ? (
                        <div className="mt-4 space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3.5 border-b border-border animate-pulse">
                              <div className="h-3 w-6" style={{ background: "#2B2D30" }} />
                              <div className="h-3 flex-1" style={{ background: "#2B2D30" }} />
                              <div className="h-3 w-24 hidden sm:block" style={{ background: "#2B2D30" }} />
                            </div>
                          ))}
                        </div>
                      ) : analyses.length === 0 ? (
                        <div className="mt-6 border border-border px-6 py-10 text-center">
                          <p className="text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>No investigations filed yet.</p>
                          <p className="mt-2 text-[12px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            The archive fills as you verify — every verdict, source and confidence score is kept here.
                          </p>
                          <button
                            type="button"
                            onClick={() => goDesk(true)}
                            className="mt-5 kicker ul-hover transition-colors"
                            style={{ color: "#C9C3B7" }}
                          >
                            Begin your first investigation →
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 border-t border-border">
                          {analyses.slice(0, 6).map((analysis, i) => renderArchiveRow(analysis, i, "archive"))}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* ─── Right rail — the wire and the ledger ─── */}
                  <div className="min-w-0 lg:border-l lg:border-border lg:pl-12">

                    {/* ─── 03 · Today's headlines — a newsroom column ─── */}
                    <section>
                      <SectionHead
                        no="04"
                        title="Today's headlines"
                        dek={
                          newsLoading
                            ? "Retrieving live headlines from major wires…"
                            : liveNews.length > 0
                              ? "Live from major wires — click any headline to load it into the editor."
                              : "Live feeds unavailable — showing sample articles instead."
                        }
                        right={
                          <span className="inline-flex items-center gap-1.5 kicker">
                            {liveNews.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS.green, animation: "statusPulse 2.4s ease-in-out infinite" }} />
                            )}
                            {newsLoading ? "Retrieving" : liveNews.length > 0 ? "Live · 30 min" : "Offline"}
                          </span>
                        }
                      />
                      <div className="mt-3">
                        <HeadlinesColumn items={displayItems} loading={newsLoading} onPick={pickHeadline} variant="stack" />
                      </div>
                      <p className="mt-3 kicker" style={{ opacity: 0.5 }}>
                        Headlines refresh every 30 minutes · select one to investigate it
                      </p>
                    </section>

                    {/* ─── 05 · Activity — a quiet record of the archive ─── */}
                    <section className="mt-20 lg:mt-28">
                      <SectionHead
                        no="05"
                        title="Activity"
                        dek="A quiet record of what this desk has filed."
                      />
                      <div className="mt-3 border-t border-border">
                        {[
                          { label: "Credible", value: analyses ? analyses.filter((a) => a.verdict === "likely_real").length : null, color: STATUS.green },
                          { label: "Uncertain", value: analyses ? analyses.filter((a) => a.verdict === "uncertain").length : null, color: STATUS.amber },
                          { label: "Misleading", value: analyses ? analyses.filter((a) => a.verdict === "likely_fake").length : null, color: STATUS.red },
                        ].map((row) => (
                          <div key={row.label} className="flex items-baseline justify-between gap-3 py-2.5 border-b border-border">
                            <span className="flex items-center gap-2 kicker" style={{ opacity: 0.75 }}>
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                              {row.label}
                            </span>
                            <span
                              className="text-[15px] leading-none tabular shrink-0"
                              style={{ fontFamily: "'JetBrains Mono', monospace", color: row.value == null ? "#A5A5A1" : "#F1F0EA" }}
                            >
                              {row.value == null ? "—" : <AnimatedNumber value={row.value} />}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-baseline justify-between gap-3 py-2.5 border-b border-border">
                          <span className="kicker" style={{ opacity: 0.75 }}>Last filed</span>
                          <span className="kicker tabular shrink-0" style={{ opacity: 0.85 }}>
                            {analyses && analyses.length > 0 ? fmtFiled(analyses[0]._creationTime) : "—"}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════ DAILY HEADLINES ═══════════════ */}
            {activeView === "headlines" && (
              <motion.div key="headlines" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                  <span className="kicker" style={{ color: "#C9C3B7" }}>The wire</span>
                  <span className="kicker hidden sm:inline">{todayLabel}</span>
                </div>
                <div className="border-b border-border mt-[3px]" />
                <h1 className="mt-10 font-serif-editorial text-[clamp(1.9rem,5.5vw,2.75rem)] leading-[1.08]">Today's Headlines</h1>
                <p className="mt-6 text-[13.5px] leading-[1.75] text-muted-foreground max-w-[58ch]">
                  Current stories retrieved live from major news wires. Select any headline to load it into the editor and investigate it.
                </p>
                <div className="mt-8">
                  <HeadlinesColumn items={displayItems} loading={newsLoading} onPick={(item) => { setInputText(item.text); setInputType("text"); goDesk(true); }} />
                </div>
                <p className="mt-4 kicker" style={{ opacity: 0.55 }}>
                  {newsLoading
                    ? "Retrieving live headlines…"
                    : liveNews.length > 0
                      ? `${liveNews.length} live stories · refreshes every 30 minutes`
                      : "Live feeds unavailable — sample articles shown"}
                </p>
              </motion.div>
            )}

            {/* ═══════════════ PAST INVESTIGATIONS ═══════════════ */}
            {activeView === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                  <span className="kicker" style={{ color: "#C9C3B7" }}>Archive</span>
                  <span className="kicker hidden sm:inline">{analyses ? `${analyses.length} filed` : "Loading…"}</span>
                </div>
                <div className="border-b border-border mt-[3px]" />
                <h1 className="mt-10 font-serif-editorial text-[clamp(1.9rem,5.5vw,2.75rem)] leading-[1.08]">Past Investigations</h1>
                <p className="mt-6 text-[13.5px] leading-[1.75] text-muted-foreground max-w-[58ch]">
                  Every investigation you have filed, most recent first. Select a record to reopen its full report.
                </p>

                {!analyses ? (
                  <div className="mt-8 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 py-3.5 border-b border-border animate-pulse">
                        <div className="h-3 w-6" style={{ background: "#2B2D30" }} />
                        <div className="h-3 flex-1" style={{ background: "#2B2D30" }} />
                        <div className="h-3 w-24 hidden sm:block" style={{ background: "#2B2D30" }} />
                      </div>
                    ))}
                  </div>
                ) : analyses.length === 0 ? (
                  <div className="mt-8 border border-border px-6 py-12 text-center">
                    <p className="text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>The archive is empty.</p>
                    <p className="mt-2 text-[12px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Investigations are filed automatically once an analysis completes.
                    </p>
                    <Button
                      onClick={() => goDesk(true)}
                      className="mt-5 h-9 px-5 text-[10.5px] uppercase tracking-[0.16em] hover:opacity-90"
                      style={{ background: "#C9C3B7", color: "#151618" }}
                    >
                      Begin an investigation
                    </Button>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="hidden sm:flex items-center gap-4 px-2 pb-1.5 border-b border-border">
                      <span className="kicker w-6" style={{ opacity: 0.55 }}>No.</span>
                      <span className="kicker flex-1" style={{ opacity: 0.55 }}>Subject</span>
                      <span className="kicker w-[6.5rem] shrink-0" style={{ opacity: 0.55 }}>Filed</span>
                      <span className="kicker w-[8.5rem] shrink-0" style={{ opacity: 0.55 }}>Verdict</span>
                      <span className="kicker w-10 shrink-0 text-right" style={{ opacity: 0.55 }}>Conf.</span>
                      <span className="kicker w-[6.5rem] shrink-0 text-right" style={{ opacity: 0.55 }}>Source</span>
                      <span className="w-12 shrink-0" />
                    </div>
                    {analyses.map((analysis, i) => renderArchiveRow(analysis, i))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ COMPARE ARTICLES ═══════════════ */}
            {activeView === "compare" && (
              <motion.div key="compare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                  <span className="kicker" style={{ color: "#C9C3B7" }}>Comparison desk</span>
                  <span className="kicker hidden sm:inline">Two articles · one method</span>
                </div>
                <div className="border-b border-border mt-[3px]" />
                <h1 className="mt-10 font-serif-editorial text-[clamp(1.9rem,5.5vw,2.75rem)] leading-[1.08]">Compare Articles</h1>
                <p className="mt-6 text-[13.5px] leading-[1.75] text-muted-foreground max-w-[58ch]">
                  Run two texts through the full pipeline, then compare shared claims, contradictions, framing and the figures each one reports.
                </p>
                <div className="mt-12 lg:mt-16">
                  <CompareArticles onCompare={handleCompare} />
                </div>
              </motion.div>
            )}

            {/* ═══════════════ SETTINGS ═══════════════ */}
            {activeView === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                  <span className="kicker" style={{ color: "#C9C3B7" }}>Settings</span>
                  <span className="kicker hidden sm:inline">{editionLabel}</span>
                </div>
                <div className="border-b border-border mt-[3px]" />
                <h1 className="mt-10 font-serif-editorial text-[clamp(1.9rem,5.5vw,2.75rem)] leading-[1.08]">Settings</h1>

                {/* Appearance */}
                <section className="mt-10">
                  <SectionHead no="01" title="Appearance" dek="Veritas is built on a near-black and warm ivory foundation." />
                  <div className="mt-4 flex items-center gap-2">
                    {(["light", "dark"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTheme(mode)}
                        className={`inline-flex items-center gap-2 h-9 px-4 border text-[10px] uppercase tracking-[0.16em] transition-colors ${
                          theme === mode ? "border-foreground/40 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                        style={theme === mode ? { background: "rgba(201,195,183,0.07)" } : undefined}
                      >
                        {mode === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        {mode}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Investigation defaults */}
                <section className="mt-12">
                  <SectionHead no="02" title="Investigation" dek="Default analysis depth for new investigations in this session." />
                  <div className="mt-4 flex items-center gap-2">
                    {(["quick", "standard", "deep"] as const).map((depth) => (
                      <button
                        key={depth}
                        type="button"
                        onClick={() => setAnalysisDepth(depth)}
                        className={`h-9 px-4 border text-[10px] uppercase tracking-[0.16em] transition-colors ${
                          analysisDepth === depth ? "border-foreground/40 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                        style={analysisDepth === depth ? { background: "rgba(201,195,183,0.07)" } : undefined}
                      >
                        {depth}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {analysisDepth === "quick" && "Fast scan — basic pattern matching and keyword detection."}
                    {analysisDepth === "standard" && "Full analysis — NLP patterns, source checks, and claim verification."}
                    {analysisDepth === "deep" && "Comprehensive — deep linguistic analysis, cross-referencing, and detailed reasoning."}
                  </p>
                </section>

                {/* Free to use — no account exists to manage */}
                <section className="mt-12">
                  <SectionHead no="03" title="Free to use" dek="Veritas has no accounts. There is nothing to sign up for, nothing to sign in to, and no feature held back." />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <ActionBtn icon={ArrowLeft} onClick={() => navigate("/")}>Return to the front page</ActionBtn>
                  </div>
                  <p className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground max-w-[62ch]">
                    Open Veritas, paste an article, and the report is yours. Investigations are filed to this
                    session&rsquo;s archive so you can reopen them later &mdash; no email address, no password, no account.
                  </p>
                </section>

                {/* About */}
                <section className="mt-12">
                  <SectionHead no="04" title="About Veritas" />
                  <div className="mt-4 grid sm:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      Veritas is an evidence-led verification desk. It retrieves the original article, extracts factual claims,
                      searches live independent coverage and cross-checks each claim against what was found.
                    </p>
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      Linguistic and framing analysis are reported separately as signals — they describe how something is written,
                      never whether it is true. Where evidence is missing, Veritas says so rather than guessing.
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            {/* ═══════════════ STATISTICS ═══════════════ */}
            {activeView === "stats" && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                  <span className="kicker" style={{ color: "#C9C3B7" }}>Statistics</span>
                  <span className="kicker hidden sm:inline">{analyses ? `${analyses.length} records` : "Loading…"}</span>
                </div>
                <div className="border-b border-border mt-[3px]" />
                <h1 className="mt-10 font-serif-editorial text-[clamp(1.9rem,5.5vw,2.75rem)] leading-[1.08]">The Bigger Picture</h1>
                <p className="mt-6 text-[13.5px] leading-[1.75] text-muted-foreground max-w-[58ch]">
                  Trends, patterns and insights drawn from everything you have analyzed.
                </p>
                <div className="mt-12 lg:mt-16">
                  {!analyses ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 border-b border-border animate-pulse" style={{ background: "#252629" }} />
                      ))}
                    </div>
                  ) : analyses.length === 0 ? (
                    <div className="border border-border px-6 py-12 text-center">
                      <p className="text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>No data yet.</p>
                      <p className="mt-2 text-[12px] text-muted-foreground">Analyze some content and the statistics will assemble themselves.</p>
                      <Button
                        onClick={() => goDesk(true)}
                        className="mt-5 h-9 px-5 text-[10.5px] uppercase tracking-[0.16em] hover:opacity-90"
                        style={{ background: "#C9C3B7", color: "#151618" }}
                      >
                        Begin an investigation
                      </Button>
                    </div>
                  ) : (
                    <StatsView analyses={analyses} />
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══════════════ METHODOLOGY ═══════════════ */}
            {activeView === "methodology" && (
              <motion.div key="methodology" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                  <span className="kicker" style={{ color: "#C9C3B7" }}>Methodology</span>
                  <span className="kicker hidden sm:inline">How we know what we know</span>
                </div>
                <div className="border-b border-border mt-[3px]" />
                <h1 className="mt-10 font-serif-editorial text-[clamp(1.9rem,5.5vw,2.75rem)] leading-[1.08]">How Veritas Works</h1>
                <p className="mt-6 text-[13.5px] leading-[1.75] text-muted-foreground max-w-[58ch]">
                  A detailed look at the fact-checking process behind every analysis — retrieval, claim extraction, cross-checking and honest confidence.
                </p>
                <div className="mt-12 lg:mt-16">
                  <MethodologyView />
                </div>
              </motion.div>
            )}

            {/* ═══════════════ INVESTIGATION REPORT ═══════════════ */}
            {activeView === "result" && currentResult && vc && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                {retrievalFailed ? (
                  <RetrievalFailedState
                    failedUrl={currentResult.failedUrl}
                    failureReason={currentResult.failureReason}
                    onRetry={() => goDesk(true)}
                    onPasteText={() => { setInputType("text"); goDesk(true); }}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-[176px_minmax(0,1fr)] gap-x-10">

                    {/* ─── Contents rail ─── */}
                    <aside className="hidden lg:block">
                      <div className="sticky top-10">
                        <button
                          type="button"
                          onClick={() => goDesk(true)}
                          className="inline-flex items-center gap-1.5 kicker transition-colors hover:text-foreground"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          New analysis
                        </button>
                        <p className="kicker mt-7 mb-2.5" style={{ opacity: 0.5 }}>Contents</p>
                        <nav className="border-l border-border">
                          {reportSections.map((s) => {
                            const active = resultTab === s.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => goToSection(s.id)}
                                className={`relative w-full flex items-baseline gap-2.5 py-[5px] pl-3 pr-2 text-left transition-colors ${
                                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {active && (
                                  <motion.span layoutId="toc-active" className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "#C9C3B7" }} />
                                )}
                                <span className="num-marker shrink-0" style={{ opacity: active ? 1 : 0.55 }}>{secNo(s.id)}</span>
                                <span className="text-[11.5px] leading-tight">{s.label}</span>
                              </button>
                            );
                          })}
                        </nav>
                        <div className="mt-7 pt-4 border-t border-border flex flex-col items-start gap-2">
                          <ActionBtn icon={Download} onClick={handleExport}>Export</ActionBtn>
                          <ActionBtn icon={Share2} onClick={handleShare}>Share</ActionBtn>
                        </div>
                      </div>
                    </aside>

                    {/* ─── Report body ─── */}
                    <div className="min-w-0">

                      {/* Masthead */}
                      <header>
                        <div className="flex items-baseline justify-between gap-4 border-b pb-1.5" style={{ borderColor: "rgba(58,59,62,0.9)" }}>
                          <span className="kicker" style={{ color: "#C9C3B7" }}>Veritas</span>
                          <span className="kicker">
                            Filed {filedLabel} · Status <span style={{ color: STATUS.green }}>Complete</span>
                          </span>
                        </div>
                        <div className="border-b border-border mt-[3px]" />

                        <p className="kicker mt-10" style={{ color: "#C9C3B7" }}>
                          Investigation / {secNo("verdict")}
                        </p>

                        <h1 className="mt-5 font-serif-editorial text-[clamp(1.65rem,5.2vw,2.9rem)] leading-[1.12] max-w-4xl text-balance break-words">
                          {reportHeadline}
                        </h1>

                        <div className="mt-8 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4">
                          <p className="kicker">{sourceMetaLine}</p>
                          <div className="flex items-center gap-2">
                            <ActionBtn icon={ArrowLeft} onClick={() => goDesk(true)}>New analysis</ActionBtn>
                            <ActionBtn icon={Download} onClick={handleExport}>Export</ActionBtn>
                            <ActionBtn icon={Share2} onClick={handleShare}>Share</ActionBtn>
                          </div>
                        </div>
                      </header>

                      {/* ─── Verdict — typography-led, no gauges ─── */}
                      <section id="verdict" className="report-sec mt-20 lg:mt-28">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="kicker">Assessment</span>
                          <span className="kicker tabular" style={{ opacity: 0.6 }}>
                            {currentResult.redFlags.length} warning · {currentResult.greenFlags.length} positive signals
                          </span>
                        </div>

                        <div className="mt-8 flex flex-col xl:flex-row xl:items-end gap-8 xl:gap-16">
                          <div className="shrink-0">
                            <h2
                              className="font-serif-editorial text-[clamp(2.4rem,9vw,4.25rem)] leading-[0.98] tracking-[-0.01em]"
                              style={{ color: vc.accentColor }}
                            >
                              {vc.label}
                            </h2>
                            <p className="mt-4 font-mono text-[12px] tracking-[0.24em] tabular" style={{ color: vc.accentColor }}>
                              {currentResult.confidence}%
                              <span className="ml-2 text-[#6F7074] tracking-[0.2em]">CONFIDENCE</span>
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}>
                              {currentResult.summary}
                            </p>
                            <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">{vc.description}</p>
                          </div>
                        </div>

                        {/* Confidence rule */}
                        <div className="mt-6 h-[3px] w-full" style={{ background: "#3A3B3E" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${currentResult.confidence}%` }}
                            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full"
                            style={{ background: vc.accentColor }}
                          />
                        </div>

                        {/* Metadata strip — source intelligence, hairline cells */}
                        <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 border-y border-border">
                          {[
                            ["Input type", inputType === "url" ? "URL" : "Text"],
                            ["Word count", `${currentResult.wordCount}`],
                            ["Warning signals", `${currentResult.redFlags.length}`],
                            ["Positive signals", `${currentResult.greenFlags.length}`],
                          ].map(([label, value], i) => (
                            <div
                              key={label}
                              className={`px-4 py-3.5 ${i % 2 === 1 ? "border-l border-border" : ""} ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l sm:border-border" : ""}`}
                            >
                              <span className="kicker block" style={{ opacity: 0.6 }}>{label}</span>
                              <span className="block mt-1.5 text-[15px] tabular" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#F1F0EA" }}>{value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Credibility breakdown — real factors, expandable basis */}
                        {credibilityFactors.length > 0 && (
                          <div className="mt-8">
                            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-1.5">
                              <span className="kicker">Credibility breakdown</span>
                              <span className="kicker" style={{ opacity: 0.5 }}>Click a factor for its basis</span>
                            </div>
                            {credibilityFactors.map((item) => {
                              const isOpen = credFactor === item.key;
                              return (
                                <div key={item.key} className="border-b border-border/70">
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-4 py-3 text-left"
                                    onClick={() => setCredFactor(isOpen ? null : item.key)}
                                  >
                                    <span className="kicker w-32 sm:w-44 shrink-0" style={isOpen ? { color: "#F1F0EA" } : undefined}>{item.label}</span>
                                    <span className="flex-1 h-[3px]" style={{ background: "#3A3B3E" }}>
                                      {item.score != null && (
                                        <motion.span
                                          className="block h-full"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.score}%` }}
                                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                          style={{ background: STATUS.bronze }}
                                        />
                                      )}
                                    </span>
                                    <span
                                      className="w-10 text-right text-[10px] tabular shrink-0"
                                      style={{ fontFamily: "'JetBrains Mono', monospace", color: item.score == null ? "#A5A5A1" : "#C9C3B7" }}
                                    >
                                      {item.score == null ? "n/a" : `${item.score}%`}
                                    </span>
                                  </button>
                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden"
                                      >
                                        <p className="pb-3.5 sm:pl-44 text-[11px] leading-relaxed text-muted-foreground">{item.reasoning}</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Full reasoning on demand */}
                        <div className="mt-7">
                          <MorphingPanel
                            preview={
                              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                                The complete reasoning behind this verdict — how retrieved evidence, claim consistency and language signals were weighed.
                              </p>
                            }
                            detail={<p className="text-[12px] leading-relaxed text-muted-foreground">{currentResult.reasoning}</p>}
                            triggerLabel="Read the full reasoning"
                            accentColor="#C9C3B7"
                          />
                        </div>
                      </section>

                      {/* ─── 01 · Claim analysis ─── */}
                      {currentResult.claims && currentResult.claims.length > 0 && (
                        <ReportSection
                          id="claims"
                          no={secNo("claims")}
                          title="Claim analysis"
                          dek={`${currentResult.claims.length} factual claims extracted — each one cross-checked against retrieved independent coverage. Language and structural observations are reported separately as signals, never as claims.`}
                          aside={
                            <span className="kicker tabular">
                              {evidenceStats?.supported ?? 0} supported · {evidenceStats?.contradicted ?? 0} contradicted
                            </span>
                          }
                        >
                          <ClaimAnalysis claims={currentResult.claims} />
                        </ReportSection>
                      )}

                      {/* ─── 02 · Source cross-check ─── */}
                      {currentResult.crossCheck && currentResult.crossCheck.length > 0 && (
                        <ReportSection
                          id="crosscheck"
                          no={secNo("crosscheck")}
                          title="Source cross-check"
                          dek={`${currentResult.crossCheck.length} claims cross-referenced against independent external sources retrieved during live cross-checking.`}
                          aside={
                            <span className="kicker tabular">
                              {evidenceStats?.uniqueRetrieved ?? 0} unique · {evidenceStats?.claimSourceRefs ?? 0} refs
                            </span>
                          }
                        >
                          <SourceCrossCheck crossCheck={currentResult.crossCheck} claims={currentResult.claims ?? []} />
                        </ReportSection>
                      )}

                      {/* ─── 03 · Evidence chain ─── */}
                      <ReportSection
                        id="chain"
                        no={secNo("chain")}
                        title="Evidence chain"
                        dek="How Veritas reached this verdict — every stage derived from this single investigation result."
                      >
                        <EvidenceChain
                          verdict={currentResult.verdict}
                          confidence={currentResult.confidence}
                          redFlags={currentResult.redFlags}
                          greenFlags={currentResult.greenFlags}
                          triggeredKeywords={currentResult.triggeredKeywords}
                          categoryBreakdown={currentResult.categoryBreakdown}
                          wordCount={currentResult.wordCount}
                          claimsCount={evidenceStats?.claims.length ?? 0}
                          sourceName={currentResult.sourceProfile?.source}
                          externalSources={evidenceStats?.uniqueRetrieved ?? 0}
                          supportingSources={evidenceStats?.supporting ?? 0}
                          contradictingSources={evidenceStats?.contradicting ?? 0}
                          corroboratedClaims={evidenceStats?.supported ?? 0}
                          contradictedClaims={evidenceStats?.contradicted ?? 0}
                          uncertainClaims={evidenceStats?.uncertain ?? 0}
                          unverifiedClaims={evidenceStats?.unverified ?? 0}
                          crossCheckedClaims={evidenceStats?.crossChecked ?? 0}
                          claimSourceRefs={evidenceStats?.claimSourceRefs ?? 0}
                          searchFailed={evidenceStats?.searchFailed ?? false}
                        />
                      </ReportSection>

                      {/* ─── 04 · Evidence map ─── */}
                      <ReportSection
                        id="map"
                        no={secNo("map")}
                        title="Evidence map"
                        dek="The investigation as a tree — claim → sources → evidence → cross-check → verdict."
                      >
                        <EvidenceMap
                          articleTitle={(currentResult.extractedText || inputText).slice(0, 80)}
                          claims={(currentResult.claims || []).map(c => ({
                            id: c.id,
                            text: c.text,
                            status: c.status,
                            sources: (currentResult.crossCheck?.find(x => x.claimId === c.id)?.sources ?? [])
                              .filter(s => !!s.url)
                              .map(s => ({ name: s.name, relationship: s.relationship })),
                          }))}
                          verdict={currentResult.verdict}
                          confidence={currentResult.confidence}
                        />
                      </ReportSection>

                      {/* ─── 05 · Evidence timeline ─── */}
                      {currentResult.evidenceTimeline && currentResult.evidenceTimeline.length > 0 && (
                        <ReportSection
                          id="timeline"
                          no={secNo("timeline")}
                          title="Evidence timeline"
                          dek="Chronological trail of every verification step recorded during this investigation."
                          aside={<span className="kicker tabular">{currentResult.evidenceTimeline.length} events</span>}
                        >
                          <EvidenceTimeline events={currentResult.evidenceTimeline} />
                        </ReportSection>
                      )}

                      {/* ─── 06 · Language analysis ─── */}
                      <ReportSection
                        id="language"
                        no={secNo("language")}
                        title="Language analysis"
                        dek="How the text is written — reported separately from whether it is true."
                        aside={<span className="kicker" style={{ color: STATUS.amber }}>Linguistic signal ≠ truth</span>}
                      >
                        <div className="grid lg:grid-cols-2 gap-x-10 gap-y-8">
                          <div>
                            <p className="kicker mb-2" style={{ opacity: 0.55 }}>Linguistic profile</p>
                            <div className="border-t border-border/70">
                              {languageRows.map((row) => (
                                <MetricBar key={row.label} label={row.label} value={row.value} color={row.color} />
                              ))}
                            </div>
                            {currentResult.triggeredKeywords.length > 0 && (
                              <div className="mt-6">
                                <p className="kicker mb-2.5" style={{ opacity: 0.55 }}>Detected keywords</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {currentResult.triggeredKeywords.map((kw) => (
                                    <span
                                      key={kw}
                                      className="text-[9.5px] px-2 py-0.5 border"
                                      style={{ borderColor: "rgba(176,132,121,0.35)", color: "#B08479", background: "rgba(176,132,121,0.07)" }}
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="kicker mb-2" style={{ opacity: 0.55 }}>Signal categories</p>
                            <div className="border-t border-border/70">
                              {currentResult.categoryBreakdown.filter(c => c.maxScore > 0).length > 0 ? (
                                currentResult.categoryBreakdown.filter(c => c.maxScore > 0).map((cat) => (
                                  <MetricBar
                                    key={cat.category}
                                    label={cat.category}
                                    value={Math.round((cat.score / cat.maxScore) * 100)}
                                    color={cat.type === "red" ? STATUS.red : STATUS.green}
                                  />
                                ))
                              ) : (
                                <p className="py-4 text-[11px] italic text-muted-foreground">
                                  No signal categories were produced for this analysis.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Signals, in two restrained columns */}
                        <div className="mt-9 grid lg:grid-cols-2 gap-x-10 gap-y-7">
                          <div>
                            <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                              <p className="kicker" style={{ color: STATUS.red }}>Warning signals</p>
                              <p className="kicker tabular" style={{ opacity: 0.6 }}>{currentResult.redFlags.length}</p>
                            </div>
                            <div className="mt-3 space-y-1.5">
                              {currentResult.redFlags.length === 0 ? (
                                <p className="text-[11px] italic text-muted-foreground">No warning signals detected.</p>
                              ) : (
                                currentResult.redFlags.map((flag, i) => (
                                  <ExpandableClaim
                                    key={i}
                                    claimNumber={String(i + 1).padStart(2, "0")}
                                    claimText={flag}
                                    status="misleading"
                                    kind="signal"
                                    signalLabel={signalLabelFor(flag)}
                                    details="Detected by linguistic pattern matching in the submitted text — this is a language signal, not a factual claim. A signal never proves or disproves a claim; the verdict is driven by retrieved claims and external evidence."
                                  />
                                ))
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                              <p className="kicker" style={{ color: STATUS.green }}>Positive signals</p>
                              <p className="kicker tabular" style={{ opacity: 0.6 }}>{currentResult.greenFlags.length}</p>
                            </div>
                            <div className="mt-3 space-y-1.5">
                              {currentResult.greenFlags.length === 0 ? (
                                <p className="text-[11px] italic text-muted-foreground">No positive signals detected.</p>
                              ) : (
                                currentResult.greenFlags.map((flag, i) => (
                                  <ExpandableClaim
                                    key={i}
                                    claimNumber={String(i + 1).padStart(2, "0")}
                                    claimText={flag}
                                    status="supported"
                                    kind="signal"
                                    signalLabel={signalLabelFor(flag)}
                                    details="Positive pattern detected in the submitted text — this is a language signal, not a factual claim. Language signals are NOT proof that any statement is true; credibility is determined by claims corroborated against retrieved external evidence."
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 border-t border-border pt-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="kicker shrink-0" style={{ color: STATUS.amber, fontSize: 10 }}>Linguistic signal ≠ truth</span>
                          <span className="text-[11px] leading-relaxed text-muted-foreground">
                            Style is measured separately from fact. Verdicts are produced only from factual claims cross-checked against retrieved external evidence.
                          </span>
                        </div>
                      </ReportSection>

                      {/* ─── 07 · Framing signals ─── */}
                      {currentResult.framingSignals && (
                        <ReportSection
                          id="framing"
                          no={secNo("framing")}
                          title="Framing signals"
                          dek="Narrative and rhetorical analysis of the submitted text — observations about presentation, not verification."
                          aside={<span className="kicker">Reported apart from fact</span>}
                        >
                          <FramingSignals signals={currentResult.framingSignals} />
                          <div className="mt-5 border-t border-border pt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="kicker shrink-0" style={{ color: STATUS.amber }}>Language / framing signals</span>
                            <span className="text-[11px] leading-relaxed text-muted-foreground">
                              are distinct from factual verification — framing alone never changes a verdict.
                            </span>
                          </div>
                        </ReportSection>
                      )}

                      {/* ─── 08 · Source profile ─── */}
                      {currentResult.sourceProfile && (
                        <ReportSection
                          id="sourceprofile"
                          no={secNo("sourceprofile")}
                          title="Source profile"
                          dek="Original article metadata extracted from the submitted text or the retrieved page — kept separate from external cross-check sources. NOT AVAILABLE means no publisher could be identified."
                          aside={
                            <span className="kicker">
                              {currentResult.sourceProfile.domain !== "NOT AVAILABLE" ? currentResult.sourceProfile.domain : "Domain not found"}
                            </span>
                          }
                        >
                          <SourceProfile profile={currentResult.sourceProfile} />
                        </ReportSection>
                      )}

                      {/* ─── 09 · Information freshness ─── */}
                      {currentResult.freshness && (
                        <ReportSection
                          id="freshness"
                          no={secNo("freshness")}
                          title="Information freshness"
                          dek="Timeliness of each claim against retrieved coverage — recent, updated, date not found, or stale."
                          aside={<span className="kicker tabular">{currentResult.freshness.length} claims</span>}
                        >
                          <FreshnessIndicator freshness={currentResult.freshness} />
                        </ReportSection>
                      )}

                      {/* ─── 10 · Article fingerprint ─── */}
                      {currentResult.fingerprint && (
                        <ReportSection
                          id="fingerprint"
                          no={secNo("fingerprint")}
                          title="Article fingerprint"
                          dek="A compact summary of the whole investigation — claims, sources, verification outcomes and coverage."
                          aside={
                            <span className="kicker tabular">
                              {currentResult.fingerprint.claims} claims · {currentResult.fingerprint.sources} sources
                            </span>
                          }
                        >
                          <ArticleFingerprint fingerprint={currentResult.fingerprint} />
                        </ReportSection>
                      )}

                      {/* ─── 11 · Investigation replay ─── */}
                      <ReportSection
                        id="replay"
                        no={secNo("replay")}
                        title="Investigation replay"
                        dek="Step through what the engine actually did, stage by stage — only stages that genuinely occurred are marked complete."
                      >
                        <InvestigationReplay analysis={currentResult} />
                      </ReportSection>

                      {/* ─── 12 · What changed ─── */}
                      <ReportSection
                        id="whatchanged"
                        no={secNo("whatchanged")}
                        title="What changed?"
                        dek="Version history for this article — if no earlier versions exist, that is stated honestly."
                      >
                        <WhatChanged />
                      </ReportSection>

                      {/* ─── 13 · Compare articles ─── */}
                      <ReportSection
                        id="compare"
                        no={secNo("compare")}
                        title="Compare articles"
                        dek="Run a second text through the same pipeline, then compare claims, contradictions, framing and reported figures side by side."
                      >
                        <CompareArticles onCompare={handleCompare} />
                      </ReportSection>

                      {/* ─── 14 · Analyzed content ─── */}
                      <ReportSection
                        id="content"
                        no={secNo("content")}
                        title="Analyzed content"
                        dek={
                          currentResult.triggeredKeywords.length > 0
                            ? "The submitted text with detected keywords highlighted."
                            : "The text that was investigated."
                        }
                      >
                        <p className="text-[12.5px] leading-[1.8] text-muted-foreground max-h-64 overflow-auto whitespace-pre-wrap pr-2">
                          {currentResult.triggeredKeywords.length > 0
                            ? getHighlightedParts(currentResult.extractedText || inputText, currentResult.triggeredKeywords).map((part, i) =>
                                part.highlighted
                                  ? <span key={i} className="bg-destructive/10 text-destructive font-medium">{part.text}</span>
                                  : <span key={i}>{part.text}</span>
                              )
                            : (currentResult.extractedText || inputText)}
                        </p>
                      </ReportSection>

                    </div>{/* end report body */}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
