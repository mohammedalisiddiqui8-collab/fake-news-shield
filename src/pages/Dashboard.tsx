import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
import {
  Shield, Search, Clock, Home, Loader2, CheckCircle2, AlertTriangle,
  XCircle, FileText, Link, Trash2, ChevronRight, Brain, BarChart3,
  ArrowLeft, ClipboardPaste, BookOpen, TrendingUp, ArrowLeftRight,
  Sun, Moon, Download, Share2, Lightbulb, Target, Activity, ArrowRight, Globe,
  Landmark, FlaskConical, Thermometer, Newspaper, Fingerprint, GitCompare, Eye, Play, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CredibilityGauge } from "@/components/CredibilityGauge";
import { StatsView } from "@/components/StatsView";
import { MethodologyView } from "@/components/MethodologyView";
import { VerificationPipeline } from "@/components/motion/VerificationPipeline";
import { DigitSwap } from "@/components/motion/DigitSwap";
import { ExpandableClaim } from "@/components/motion/ExpandableClaim";
import { MorphingPanel } from "@/components/motion/MorphingPanel";
import { EvidenceChain } from "@/components/motion/EvidenceChain";
import { ClaimAnalysis, type Claim } from "@/components/motion/ClaimAnalysis";
import { EvidenceTimeline, type TimelineEvent } from "@/components/motion/EvidenceTimeline";
import { SourceProfile, type SourceProfileData } from "@/components/motion/SourceProfile";
import { CompareArticles, type ComparisonResult } from "@/components/motion/CompareArticles";
import { CaseFiles, type CaseFile } from "@/components/motion/CaseFiles";
import { ArticleFingerprint, type FingerprintData } from "@/components/motion/ArticleFingerprint";
import { SourceCrossCheck, type CrossCheckClaim } from "@/components/motion/SourceCrossCheck";
import { EvidenceMap } from "@/components/motion/EvidenceMap";
import { FramingSignals, type FramingSignal } from "@/components/motion/FramingSignals";
import { FreshnessIndicator, type FreshnessItem } from "@/components/motion/FreshnessIndicator";
import { WhatChanged } from "@/components/motion/WhatChanged";
import { InvestigationReplay } from "@/components/motion/InvestigationReplay";
import { RetrievalFailedState } from "@/components/motion/RetrievalFailedState";
import { getLiveNews, FALLBACK_SAMPLES, getCategoryIconComponent, relativeTime, type LiveArticle } from "@/lib/news";
import { deriveSourceCounts } from "@/lib/investigationStats";

/* ─── Types ─── */
type Verdict = "likely_real" | "likely_fake" | "uncertain";

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

/* ─── Verdict Config (editorial palette) ─── */
const verdictConfig: Record<Verdict, {
  label: string; icon: typeof CheckCircle2; color: string; bg: string;
  border: string; accentColor: string; description: string;
}> = {
  likely_real: {
    label: "Likely Credible", icon: CheckCircle2, color: "text-primary",
    bg: "bg-primary/8", border: "border-primary/20", accentColor: "#A8906E",
    description: "Key factual claims are corroborated by retrieved independent external coverage. Linguistic signals are supplementary only.",
  },
  uncertain: {
    label: "Uncertain", icon: AlertTriangle, color: "text-accent",
    bg: "bg-accent/10", border: "border-accent/25", accentColor: "#C4985A",
    description: "External evidence is insufficient, mixed, or unavailable — key claims remain unverified. Treat this as unconfirmed.",
  },
  likely_fake: {
    label: "Likely Misleading", icon: XCircle, color: "text-destructive",
    bg: "bg-destructive/10", border: "border-destructive/20", accentColor: "#E85D4A",
    description: "Key factual claims are contradicted by retrieved independent external coverage. Language patterns alone never produce this verdict.",
  },
};

/* ─── Signal classifier — observations are signals, never factual claims ─── */
function signalLabelFor(flag: string): string {
  if (/structure|article length|5 w|journalistic|word count/i.test(flag)) return "STRUCTURAL SIGNAL";
  if (/language|wording|sensational|clickbait|emotional|caps|emoji|fear|conspiracy|urgency|sharing|tone|sourcing|certainty|superlative|anonymous|balanc/i.test(flag)) return "LINGUISTIC SIGNAL";
  return "LANGUAGE SIGNAL";
}

/* ─── Sample Texts ─── */
/* ─── Static sample fallback ─── */
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

type ViewType = "analyze" | "result" | "history" | "stats" | "methodology";

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
  const [activeView, setActiveView] = useState<ViewType>("analyze");
  const [currentTip, setCurrentTip] = useState(0);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [resultTab, setResultTab] = useState<"overview" | "linguistic" | "source" | "logical" | "findings" | "claims" | "evidence" | "sourceprofile" | "fingerprint" | "crosscheck" | "evidencemap" | "framing" | "freshness" | "whatchanged" | "replay">("overview");
  const [compareView, setCompareView] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState<"quick" | "standard" | "deep">("standard");
  const [credFactor, setCredFactor] = useState<string | null>(null);
  const [liveNews, setLiveNews] = useState<LiveArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
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
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && activeView === "analyze" && !isAnalyzing && inputText.trim()) {
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
           "URL could not be accessed or article content could not be retrieved.")
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
    setInputText(analysis.inputText); setInputType(analysis.inputType); setActiveView("result");
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
      { label: "Factual Language", value: total > 0 ? Math.round((evidenceStats.greenScore / total) * 100) : null, color: "#A8906E" },
      { label: "Warning Load", value: total > 0 ? Math.round((evidenceStats.redScore / total) * 100) : null, color: evidenceStats.redScore > evidenceStats.greenScore ? "#A85A50" : "#A8906E" },
      { label: "Attribution", value: catPct("Attribution Language"), color: "#A8906E" },
      { label: "Structure", value: catPct("Journalistic Structure"), color: "#A8906E" },
    ];
  })();


  const navItems = [
    { key: "analyze" as ViewType, icon: Search, label: "Analyze" },
    { key: "result" as ViewType, icon: BarChart3, label: "Results", disabled: !currentResult },
    { key: "history" as ViewType, icon: Clock, label: "History" },
    { key: "stats" as ViewType, icon: TrendingUp, label: "Statistics" },
    { key: "methodology" as ViewType, icon: BookOpen, label: "Methodology" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Nav — Dark Green ─── */}
      <nav className="sticky top-0 z-50"                style={{ background: "rgba(10,10,10,0.92)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-12 flex items-center justify-between">
          <button type="button" className="cursor-pointer flex items-center gap-2" onClick={() => navigate("/")}>
            <Shield className="w-4 h-4" style={{ color: "#F5F0E8" }} />
            <span className="font-bold tracking-[0.15em] uppercase text-xs" style={{ fontFamily: "'DM Serif Display', serif", color: "#F5F0E8" }}>Veritas</span>
          </button>
          <div className="flex items-center">
            {navItems.map(item => (
              <Button key={item.key} variant="ghost" size="sm"
                className="cursor-pointer gap-1 text-[10px] px-1.5 sm:px-2 h-7 rounded"
                style={activeView === item.key ? { background: "rgba(168,144,110,0.08)", color: "#F5F0E8" } : { color: "#A8A098" }}
                disabled={item.disabled} onClick={() => setActiveView(item.key)}>
                <item.icon className="w-3 h-3" /><span className="hidden sm:inline">{item.label}</span>
              </Button>
            ))}
            <div className="w-px h-4 mx-1" style={{ background: "rgba(245,240,232,0.12)" }} />
            <Button variant="ghost" size="icon" className="cursor-pointer h-7 w-7" style={{ color: "#A8A098" }} onClick={() => navigate("/")}>
              <Home className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 sm:pt-14 pb-5 sm:pb-7">
        <AnimatePresence mode="wait">
          {/* ═══ ANALYZE ═══ */}
          {activeView === "analyze" && (
            <motion.div key="analyze" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

              {/* Pipeline overlay */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex items-center justify-center">
                    <div className="glass-card rounded-lg p-8 sm:p-10 max-w-sm w-full mx-4 text-center">
                      <div className="w-12 h-12 rounded bg-primary/8 flex items-center justify-center mx-auto mb-5">
                        <Activity className="w-6 h-6 text-primary animate-spin-slow" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>Verification Pipeline</h3>
                      <p className="text-[10px] text-muted-foreground mb-6">Analyzing content patterns...</p>
                      <VerificationPipeline currentStep={pipelineStep} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">Analyze Article</p>
                <h1 className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Check the truth. In seconds.</h1>
                <p className="text-xs text-muted-foreground mt-1">Paste the news article, headline or text below and let Veritas analyze it for potential misinformation.</p>
              </div>

              {/* Tip */}
              <motion.div key={currentTip} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className="glass-card rounded-lg p-3 mb-3 flex items-start gap-2.5">
                <Lightbulb className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">{mediaLiteracyTips[currentTip]}</p>
              </motion.div>

              {/* Input type toggle */}
              <div className="flex gap-1.5 mb-3">
                <Button variant={inputType === "text" ? "default" : "outline"}
                  className={`cursor-pointer gap-1.5 text-[11px] h-8 rounded ${inputType === "text" ? "bg-primary text-primary-foreground" : "border-border"}`}
                  onClick={() => setInputType("text")}>
                  <FileText className="w-3 h-3" />Paste Text
                </Button>
                <Button variant={inputType === "url" ? "default" : "outline"}
                  className={`cursor-pointer gap-1.5 text-[11px] h-8 rounded ${inputType === "url" ? "bg-primary text-primary-foreground" : "border-border"}`}
                  onClick={() => setInputType("url")}>
                  <Link className="w-3 h-3" />Paste URL
                </Button>
              </div>

              {/* Analysis Depth */}
              <div className="glass-card rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Analysis Depth</span>
                  <span className="text-[10px] font-semibold capitalize" style={{ color: "#A8906E" }}>{analysisDepth}</span>
                </div>
                <div className="flex items-center gap-0">
                  {(["quick", "standard", "deep"] as const).map((depth, i) => (
                    <button key={depth} type="button"
                      className={`flex-1 cursor-pointer py-1.5 text-[9px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 ${
                        analysisDepth === depth ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                      }`}
                      style={analysisDepth === depth ? { background: "rgba(168,144,110,0.06)", borderBottom: "2px solid #A8906E" } : { borderBottom: "2px solid transparent" }}
                      onClick={() => setAnalysisDepth(depth)}>
                      {depth}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] mt-2" style={{ color: "#A8A098" }}>
                  {analysisDepth === "quick" && "Fast scan — basic pattern matching and keyword detection."}
                  {analysisDepth === "standard" && "Full analysis — NLP patterns, source checks, and claim verification."}
                  {analysisDepth === "deep" && "Comprehensive — deep linguistic analysis, cross-referencing, and detailed reasoning."}
                </p>
              </div>

              {/* Textarea */}
              <div className="glass-card rounded-lg p-0.5 mb-3">
                <Textarea ref={textareaRef} value={inputText} onChange={e => setInputText(e.target.value)}
                  placeholder={inputType === "text" ? "Paste your news article, headline or text here..." : "Paste a news URL here..."}
                  className="min-h-[160px] sm:min-h-[180px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] text-muted-foreground">{inputText.length > 0 ? `${inputText.length.toLocaleString()} chars` : "Enter content"}</span>
                <div className="flex gap-1.5 items-center">
                  <span className="text-[9px] text-muted-foreground/40 hidden sm:inline font-mono">Ctrl+Enter</span>
                  <Button variant="ghost" size="sm" className="cursor-pointer gap-1 text-[10px] h-7"
                    onClick={() => navigator.clipboard.readText().then(t => { setInputText(t); toast.success("Pasted!"); }).catch(() => toast.error("Unable to read clipboard."))}>
                    <ClipboardPaste className="w-3 h-3" />Paste
                  </Button>
                  <Button variant="ghost" size="sm" className="cursor-pointer text-[10px] h-7" onClick={() => setInputText("")} disabled={!inputText}>Clear</Button>
                </div>
              </div>

              {/* Samples */}
              {/* ── Try a Sample / Live News ── */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
                  {newsLoading ? "Loading headlines…" : liveNews.length > 0 ? "Today's Headlines" : "Try a sample"}
                </p>

                {/* Loading skeleton */}
                {newsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="glass-card rounded-lg p-3.5 animate-pulse">
                        <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-2 bg-muted rounded w-full mb-1" />
                        <div className="h-2 bg-muted rounded w-2/3 mb-2" />
                        <div className="flex gap-1.5">
                          <div className="h-4 bg-muted rounded w-10" />
                          <div className="h-4 bg-muted rounded w-14" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sample cards (live or fallback) */}
                {!newsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {displayItems.map((item) => {
                      const CategoryIcon = (() => {
                        const name = getCategoryIconComponent(item.category);
                        const icons: Record<string, typeof Globe> = { Globe, AlertTriangle, Landmark, TrendingUp, FlaskConical, Thermometer, Newspaper };
                        return icons[name] || Newspaper;
                      })();
                      return (
                      <button key={item.label} type="button"
                        className="rounded-lg p-3.5 text-left cursor-pointer group transition-all duration-200 border hover:-translate-y-[2px] hover:border-[#A8906E]/20 active:scale-[0.98]"
                        style={{ background: "#111111", borderColor: "#1E1E1E" }}
                        onClick={() => { setInputText(item.text); setInputType("text"); }}>
                        {/* Source + time — metadata first */}
                        {(item.source || item.publishedAgo) && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {item.source && (
                              <span className="text-[8px] font-medium uppercase tracking-[0.1em]" style={{ color: "#A8906E" }}>
                                {item.source}
                              </span>
                            )}
                            {item.source && item.publishedAgo && (
                              <span className="text-[8px]" style={{ color: "#A8A09840" }}>·</span>
                            )}
                            {item.publishedAgo && (
                              <span className="text-[8px]" style={{ color: "#A8A098", opacity: 0.6 }}>
                                {item.publishedAgo}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Headline — strongest element */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-semibold leading-snug line-clamp-2" style={{ color: "#F5F0E8" }}>
                            {item.label}
                          </span>
                          <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: "#A8A098" }} />
                        </div>

                        {/* Snippet — secondary */}
                        <p className="text-[9px] line-clamp-2 leading-relaxed mt-1" style={{ color: "#A8A098" }}>
                          {item.text.slice(0, 80)}…
                        </p>

                        {/* Category + Status — compact metadata */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Badge variant="outline" className={`text-[8px] px-1.5 py-0 ${item.type === "real" ? "border-primary/25 text-primary" : "border-destructive/25 text-destructive"}`}>
                            {item.type === "real" ? "Real" : "Fake"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <CategoryIcon className="w-2.5 h-2.5" style={{ color: "#A8A098", opacity: 0.5 }} />
                            <span className="text-[8px]" style={{ color: "#A8A098", opacity: 0.6 }}>{item.category}</span>
                          </div>
                          {item.isSnippet && (
                            <span className="text-[7px] px-1 py-0 rounded" style={{ color: "#A8A098", opacity: 0.4, border: "1px solid #1E1E1E" }}>
                              snippet
                            </span>
                          )}
                        </div>
                      </button>
                      );
                    })}
                  </div>
                )}

                {/* Subtle live indicator */}
                {liveNews.length > 0 && !newsLoading && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#A8906E", opacity: 0.6 }} />
                    <span className="text-[8px] text-muted-foreground/50">Live news · updates every 30 min</span>
                  </div>
                )}
              </div>

              {/* Analyze button */}
              <button type="button"
                className="cursor-pointer w-full flex items-center justify-center gap-2 h-11 text-sm font-medium rounded transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(168,144,110,0.15)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none"
                style={{ background: "#A8906E", color: "#0A0A0A" }}
                onClick={handleAnalyze} disabled={isAnalyzing || !inputText.trim()}>
                Analyze Content <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>

              {/* ── Feature cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-6">
                {[{ icon: Brain, title: "AI-Powered Analysis", desc: "Advanced NLP & ML models", accent: "#A8906E" }, { icon: Search, title: "Multiple Checks", desc: "Source, logic, language & more", accent: "#A8906E" }, { icon: BarChart3, title: "Detailed Reports", desc: "Clear, simple, actionable", accent: "#A8906E" }].map((f, i) => (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
                    className="relative overflow-hidden flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:border-[#A8906E]/15"
                    style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: "2px" }}>
                    <div className="absolute top-0 left-0 w-8 h-[1px]" style={{ background: f.accent, opacity: 0.25 }} />
                    <div className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0" style={{ background: `rgba(168,144,110,0.06)`, border: `1px solid rgba(168,144,110,0.1)` }}>
                      <f.icon className="w-3 h-3" style={{ color: f.accent, opacity: 0.8 }} />
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold block leading-tight tracking-wide" style={{ color: "#F5F0E8" }}>{f.title}</span>
                      <span className="text-[8px] leading-relaxed" style={{ color: "#A8A098", opacity: 0.7 }}>{f.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ RESULT ═══ */}
          {activeView === "result" && currentResult && vc && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}>
            {retrievalFailed ? (
              <RetrievalFailedState
                failedUrl={currentResult.failedUrl}
                failureReason={currentResult.failureReason}
                onRetry={() => setActiveView("analyze")}
                onPasteText={() => { setInputType("text"); setActiveView("analyze"); }}
              />
            ) : (
              <>

              {/* Sidebar + Content layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-5">
                {/* Sidebar */}
                <div className="hidden lg:block">
                  <div className="sticky top-20 space-y-1">
                    <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-4"
                      onClick={() => setActiveView("analyze")}>
                      <ArrowLeft className="w-3.5 h-3.5" />Back to Analyze
                    </button>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">Analysis Results</p>
                    {([
                      { key: "overview" as const, label: "Overview", icon: BarChart3 },
                      ...(currentResult.fingerprint ? [{ key: "fingerprint" as const, label: "Fingerprint", icon: Fingerprint }] : []),
                      { key: "linguistic" as const, label: "Linguistic", icon: Search },
                      { key: "source" as const, label: "Source", icon: Globe },
                      { key: "logical" as const, label: "Logic", icon: Brain },
                      { key: "findings" as const, label: "Findings", icon: AlertTriangle },
                      ...(currentResult.claims && currentResult.claims.length > 0 ? [{ key: "claims" as const, label: "Claims", icon: FileText }] : []),
                      ...(currentResult.crossCheck && currentResult.crossCheck.length > 0 ? [{ key: "crosscheck" as const, label: "Cross-Check", icon: GitCompare }] : []),
                      ...(currentResult.framingSignals ? [{ key: "framing" as const, label: "Framing", icon: Eye }] : []),
                      ...(currentResult.freshness ? [{ key: "freshness" as const, label: "Freshness", icon: Clock }] : []),
                      ...(currentResult.evidenceTimeline && currentResult.evidenceTimeline.length > 0 ? [{ key: "evidence" as const, label: "Timeline", icon: Clock }] : []),
                      { key: "evidencemap" as const, label: "Evidence Map", icon: Layers },
                      { key: "sourceprofile" as const, label: "Source Profile", icon: Globe },
                      { key: "whatchanged" as const, label: "What Changed?", icon: GitCompare },
                      { key: "replay" as const, label: "Replay", icon: Play },
                    ]).map(item => (
                      <button key={item.key} type="button"
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] transition-colors cursor-pointer text-left ${
                          resultTab === item.key ? "bg-primary/8 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        onClick={() => setResultTab(item.key)}>
                        <item.icon className="w-3 h-3 shrink-0" />{item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile back + actions */}
                <div className="lg:hidden flex items-center justify-between mb-3">
                  <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => setActiveView("analyze")}>
                    <ArrowLeft className="w-3.5 h-3.5" />New Analysis
                  </button>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="cursor-pointer gap-1 text-[10px] h-7 border-border rounded" onClick={handleExport}>
                      <Download className="w-3 h-3" />Export
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-pointer gap-1 text-[10px] h-7 border-border rounded" onClick={handleShare}>
                      <Share2 className="w-3 h-3" />Share
                    </Button>
                  </div>
                </div>

                {/* Desktop actions */}
                <div className="hidden lg:flex justify-end gap-1.5 mb-3">
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1 text-[10px] h-7 border-border rounded" onClick={handleExport}>
                    <Download className="w-3 h-3" />Export
                  </Button>
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1 text-[10px] h-7 border-border rounded" onClick={handleShare}>
                    <Share2 className="w-3 h-3" />Share
                  </Button>
                </div>

              {/* Verdict Card */}
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, delay: 0.05 }} className="mb-4">
                <div className={`glass-card rounded-lg p-5 sm:p-7 border ${vc.border} relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: vc.accentColor }} />
                  <div className="relative flex flex-col sm:flex-row items-center gap-5">
                    <CredibilityGauge confidence={currentResult.confidence} verdict={currentResult.verdict} size={140} />
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mb-1">Verdict</p>
                      <div className="flex items-center gap-2.5 mb-2 justify-center sm:justify-start">
                        <div className={`w-8 h-8 rounded ${vc.bg} flex items-center justify-center`}>
                          <vc.icon className={`w-4 h-4 ${vc.color}`} />
                        </div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vc.color}`} style={{ fontFamily: "'DM Serif Display', serif" }}>{vc.label}</h2>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{vc.description}</p>
                      <div className="flex items-center gap-3 mt-2.5 justify-center sm:justify-start flex-wrap">
                        {currentResult.redFlags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                            <span className="text-[10px] text-destructive font-medium">{currentResult.redFlags.length} red</span>
                          </div>
                        )}
                        {currentResult.greenFlags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-primary font-medium">{currentResult.greenFlags.length} green</span>
                          </div>
                        )}
                        <span className="text-[9px] text-muted-foreground/60">{currentResult.wordCount} words</span>
                      </div>
                    </div>
                  </div>
                  {/* Confidence bar */}
                  <div className="relative mt-5">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-semibold" style={{ color: vc.accentColor }}><DigitSwap value={currentResult.confidence} suffix="" />%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${currentResult.confidence}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full" style={{ background: vc.accentColor }} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Category Breakdown */}
              {currentResult.categoryBreakdown.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}
                  className="glass-card rounded-lg p-4 sm:p-5 mb-3">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Category Breakdown</h3>
                  </div>
                  <div className="space-y-2">
                    {currentResult.categoryBreakdown.filter(c => c.maxScore > 0).map((cat, i) => {
                      const pct = Math.round((cat.score / cat.maxScore) * 100);
                      return (
                        <motion.div key={cat.category} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.12 + i * 0.03 }}>
                          <div className="flex items-center justify-between text-[10px] mb-0.5">
                            <span className="font-medium">{cat.category}</span>
                            <span className={cat.type === "red" ? "text-destructive" : "text-primary"}>{pct}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: 0.15 + i * 0.04 }}
                              className="h-full rounded-full"
                              style={{ background: cat.type === "red" ? "#A85A50" : "#A8906E" }} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ─── Credibility Breakdown (real, interactive) ─── */}
              {credibilityFactors.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.12 }}
                className="glass-card rounded-lg p-4 sm:p-5 mb-3">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Credibility Breakdown</h3>
                  </div>
                  <span className="text-[8px]" style={{ color: "#A8A098", opacity: 0.6 }}>click a factor for its basis</span>
                </div>
                <div className="space-y-2 mt-3">
                  {credibilityFactors.map((item, i) => {
                    const isShort = item.score == null;
                    const isOpen = credFactor === item.key;
                    return (
                    <div key={item.key}>
                      <button type="button" className="w-full flex items-center gap-3 text-left cursor-pointer"
                        onClick={() => setCredFactor(isOpen ? null : item.key)}>
                        <span className="text-[9px] font-mono tracking-wider w-20 sm:w-28 uppercase shrink-0" style={{ color: isOpen ? "#F5F0E8" : "#A8A098" }}>{item.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          {!isShort && (
                            <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                              className="h-full rounded-full" style={{ background: "#A8906E" }} />
                          )}
                        </div>
                        <span className="text-[9px] font-mono w-8 text-right shrink-0" style={{ color: isShort ? "#A8A098" : "#A8906E" }}>
                          {isShort ? "—" : `${item.score}%`}
                        </span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden">
                            <p className="text-[9px] leading-relaxed pt-1.5 pb-1 pl-0 sm:pl-28" style={{ color: "#A8A098" }}>
                              {item.reasoning}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    );
                  })}
                </div>
              </motion.div>
              )}

              {/* ─── Source Intelligence ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.14 }}
                className="glass-card rounded-lg p-4 sm:p-5 mb-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <Globe className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Source Intelligence</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Input Type", value: inputType === "url" ? "URL" : "Text" },
                    { label: "Word Count", value: `${currentResult.wordCount}` },
                    { label: "Red Flags", value: `${currentResult.redFlags.length} detected` },
                    { label: "Green Flags", value: `${currentResult.greenFlags.length} detected` },
                  ].map((item) => (
                    <div key={item.label} className="p-2.5 rounded" style={{ background: "#111111" }}>
                      <span className="text-[8px] tracking-[0.15em] uppercase font-semibold block mb-0.5" style={{ color: "#A8A098" }}>{item.label}</span>
                      <span className="text-[11px] font-semibold" style={{ color: "#F5F0E8" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ─── NLP Language Analysis ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.16 }}
                className="glass-card rounded-lg p-4 sm:p-5 mb-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <Brain className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Language Signal</h3>
                </div>
                <div className="space-y-2.5">
                  {languageRows.map((item, i) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-[9px] mb-0.5">
                        <span className="font-mono tracking-wider uppercase" style={{ color: "#A8A098" }}>{item.label}</span>
                        <span className="font-mono" style={{ color: item.color }}>{item.value == null ? "—" : `${item.value}%`}</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        {item.value != null && (
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                            transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                            className="h-full rounded-full" style={{ background: item.color }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] mt-3 leading-relaxed" style={{ color: "#A8A098", opacity: 0.7 }}>
                  Language signal measures writing style in the submitted text — it is NOT a percentage of content that is true. Verification comes from claims and retrieved external evidence.
                </p>
              </motion.div>

              {/* Keywords */}
              {currentResult.triggeredKeywords.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.18 }}
                  className="glass-card rounded-lg p-4 sm:p-5 mb-3">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5">Detected Keywords</h3>
                  <div className="flex flex-wrap gap-1">
                    {currentResult.triggeredKeywords.map(kw => (
                      <Badge key={kw} variant="outline" className="text-[9px] border-destructive/25 text-destructive bg-destructive/5 rounded">{kw}</Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Summary + Reasoning — MorphingPanel */}
              <MorphingPanel
                preview={
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">Summary</h3>
                    <p className="text-xs leading-relaxed">{currentResult.summary}</p>
                  </div>
                }
                detail={
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">Detailed Reasoning</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{currentResult.reasoning}</p>
                  </div>
                }
                triggerLabel="VIEW REASONING"
                className="mb-3"
                accentColor="#A8906E"
              />

              {/* Red Flags — ExpandableClaim style */}
              <div className="mb-3">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-destructive" />Red Flags {currentResult.redFlags.length > 0 && <span className="text-destructive">({currentResult.redFlags.length})</span>}
                </h3>
                <div className="space-y-1.5">
                  {currentResult.redFlags.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic">No red flags detected</p>
                  ) : (
                    currentResult.redFlags.map((flag, i) => (
                      <ExpandableClaim key={i} claimNumber={String(i + 1).padStart(2, "0")} claimText={flag} status="misleading" kind="signal" signalLabel={signalLabelFor(flag)} details="Detected by linguistic pattern matching in the submitted text — this is a language signal, not a factual claim. A signal never proves or disproves a claim; the verdict is driven by retrieved claims and external evidence." />
                    ))
                  )}
                </div>
              </div>
              {/* Green Flags */}
              <div className="mb-3">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" style={{ color: "#A8906E" }} />Green Flags {currentResult.greenFlags.length > 0 && <span style={{ color: "#A8906E" }}>({currentResult.greenFlags.length})</span>}
                </h3>
                <div className="space-y-1.5">
                  {currentResult.greenFlags.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic">No positive signals detected</p>
                  ) : (
                    currentResult.greenFlags.map((flag, i) => (
                      <ExpandableClaim key={i} claimNumber={String(i + 1).padStart(2, "0")} claimText={flag} status="supported" kind="signal" signalLabel={signalLabelFor(flag)} details="Positive pattern detected in the submitted text — this is a language signal, not a factual claim. Language signals are NOT proof that any statement is true; credibility is determined by claims corroborated against retrieved external evidence." />
                    ))
                  )}
                </div>
              </div>

              {/* ─── Evidence Chain ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.3 }}
                className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Link className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Evidence Chain</h3>
                  </div>
                  <p className="text-[9px]" style={{ color: "#A8A098" }}>How Veritas reached this verdict — click each stage to explore</p>
                </div>
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
              </motion.div>

              {/* ─── Claim Analysis ─── */}
              {currentResult.claims && currentResult.claims.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.32 }}
                  className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                  <div className="px-4 sm:px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Claim Analysis</h3>
                    </div>
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>{currentResult.claims.length} factual claims extracted — click to explore evidence. Language and structural observations are reported separately as signals, never as claims.</p>
                  </div>
                  <div className="px-4 sm:px-5 pb-3">
                    <ClaimAnalysis claims={currentResult.claims} />
                  </div>
                </motion.div>
              )}

              {/* ─── Evidence Timeline ─── */}
              {currentResult.evidenceTimeline && currentResult.evidenceTimeline.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.34 }}
                  className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                  <div className="px-4 sm:px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Evidence Timeline</h3>
                    </div>
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>Chronological verification trail</p>
                  </div>
                  <div className="px-4 sm:px-5 pb-3">
                    <EvidenceTimeline events={currentResult.evidenceTimeline} />
                  </div>
                </motion.div>
              )}

              {/* ─── Source Profile ─── */}
              {currentResult.sourceProfile && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.36 }}
                  className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                  <div className="px-4 sm:px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Source Profile</h3>
                    </div>
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>Original article metadata extracted from the submitted text or the retrieved URL page — kept separate from external cross-check sources. SOURCE — NOT AVAILABLE means no publisher could be identified.</p>
                  </div>
                  <div className="px-4 sm:px-5 pb-4">
                    <SourceProfile profile={currentResult.sourceProfile} />
                  </div>
                </motion.div>
              )}

              {/* Highlighted content */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.38 }}
                className="glass-card rounded-lg p-4 sm:p-5">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">
                  Analyzed Content {currentResult.triggeredKeywords.length > 0 && <span className="text-destructive normal-case">(highlighted)</span>}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-h-36 overflow-auto whitespace-pre-wrap">
                  {currentResult.triggeredKeywords.length > 0
                    ? getHighlightedParts(currentResult.extractedText || inputText, currentResult.triggeredKeywords).map((part, i) =>
                        part.highlighted
                          ? <span key={i} className="bg-destructive/10 text-destructive font-medium px-0.5 rounded">{part.text}</span>
                          : <span key={i}>{part.text}</span>
                      )
                    : (currentResult.extractedText || inputText)
                  }
                </p>
              </motion.div>

              </div>{/* end grid */}

              {/* ─── Compare Articles ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.4 }}
                className="rounded-lg mb-3 overflow-hidden mt-3" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Compare Articles</h3>
                  </div>
                  <p className="text-[9px]" style={{ color: "#A8A098" }}>Compare this article with another to find shared claims, contradictions, and differences</p>
                </div>
                <div className="px-4 sm:px-5 pb-4">
                  <CompareArticles
                    onCompare={async (textA, textB) => {
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
                    }}
                  />
                </div>
              </motion.div>

              {/* ─── Article Fingerprint ─── */}
              {currentResult.fingerprint && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.42 }}
                  className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                  <div className="px-4 sm:px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Fingerprint className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Article Fingerprint</h3>
                    </div>
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>Analytical summary of the investigation</p>
                  </div>
                  <div className="px-4 sm:px-5 pb-4"><ArticleFingerprint fingerprint={currentResult.fingerprint} /></div>
                </motion.div>
              )}

              {/* ─── Source Cross-Check ─── */}
              {currentResult.crossCheck && currentResult.crossCheck.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.44 }}
                  className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                  <div className="px-4 sm:px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <GitCompare className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Source Cross-Check</h3>
                    </div>
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>{currentResult.crossCheck.length} claims cross-referenced · {evidenceStats?.uniqueRetrieved ?? 0} unique sources retrieved · {evidenceStats?.claimSourceRefs ?? 0} claim–source references — independent external sources retrieved during live cross-checking</p>
                  </div>
                  <div className="px-4 sm:px-5 pb-3"><SourceCrossCheck crossCheck={currentResult.crossCheck} claims={currentResult.claims ?? []} /></div>
                </motion.div>
              )}

              {/* ─── Evidence Map ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.46 }}
                className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Evidence Map</h3>
                  </div>
                  <p className="text-[9px]" style={{ color: "#A8A098" }}>Interactive investigation tree</p>
                </div>
                <div className="px-4 sm:px-5 pb-3">
                  <EvidenceMap articleTitle={(currentResult.extractedText || inputText).slice(0, 80)} claims={(currentResult.claims || []).map(c => ({ id: c.id, text: c.text, status: c.status, sources: (currentResult.crossCheck?.find(x => x.claimId === c.id)?.sources ?? []).filter(s => !!s.url).map(s => ({ name: s.name, relationship: s.relationship })) }))} verdict={currentResult.verdict} confidence={currentResult.confidence} />
                </div>
              </motion.div>

              {/* ─── Framing Signals ─── */}
              {currentResult.framingSignals && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.48 }}
                  className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                  <div className="px-4 sm:px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Framing Signals</h3>
                    </div>
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>Narrative and rhetorical analysis</p>
                  </div>
                  <div className="px-4 sm:px-5 pb-3"><FramingSignals signals={currentResult.framingSignals} /></div>
                </motion.div>
              )}

              {/* ─── Information Freshness ─── */}
              {currentResult.freshness && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.5 }}
                  className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                  <div className="px-4 sm:px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Information Freshness</h3>
                    </div>
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>Timeliness assessment</p>
                  </div>
                  <div className="px-4 sm:px-5 pb-3"><FreshnessIndicator freshness={currentResult.freshness} /></div>
                </motion.div>
              )}

              {/* ─── What Changed? ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.52 }}
                className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <GitCompare className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>What Changed?</h3>
                  </div>
                  <p className="text-[9px]" style={{ color: "#A8A098" }}>Version tracking</p>
                </div>
                <div className="px-4 sm:px-5 pb-3"><WhatChanged /></div>
              </motion.div>

              {/* ─── Investigation Replay ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.54 }}
                className="rounded-lg mb-3 overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Play className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#F5F0E8" }}>Investigation Replay</h3>
                  </div>
                  <p className="text-[9px]" style={{ color: "#A8A098" }}>Step through the verification process</p>
                </div>
                <div className="px-4 sm:px-5 pb-4"><InvestigationReplay analysis={currentResult} /></div>
              </motion.div>
              </>
            )}
            </motion.div>
          )}

          {/* ═══ HISTORY ═══ */}
          {activeView === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">Analysis History</p>
                <h1 className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Your Past Verifications</h1>
                <p className="text-xs text-muted-foreground mt-1">View and manage your previously analyzed articles.</p>
              </div>
              {!analyses ? (
                <div className="glass-card rounded-lg p-10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="glass-card rounded-lg p-10 text-center">
                  <div className="w-12 h-12 rounded bg-primary/8 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>No analyses yet</h3>
                  <p className="text-xs text-muted-foreground mb-5">Start by analyzing your first piece of content.</p>
                  <Button className="cursor-pointer bg-primary text-primary-foreground gap-1.5 text-xs h-9 rounded" onClick={() => setActiveView("analyze")}>
                    Analyze Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {analyses.map((analysis, i) => {
                    const avc = verdictConfig[analysis.verdict];
                    // Legacy rows: a stored retrieval failure is NOT an investigation.
                    const wasRetrievalFailure =
                      typeof analysis.summary === "string" &&
                      analysis.summary.startsWith("UNABLE TO RETRIEVE");
                    return (
                      <motion.div key={analysis._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="glass-card rounded-lg p-3.5 hover:shadow-sm cursor-pointer group border-b border-border last:border-b-0 first:rounded-b-none last:rounded-t-none" onClick={() => handleLoadFromHistory(analysis)}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded ${avc.bg} flex items-center justify-center shrink-0`}>
                            <avc.icon className={`w-3.5 h-3.5 ${avc.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className={`text-[11px] font-semibold ${avc.color}`}>{wasRetrievalFailure ? "Retrieval Failed" : avc.label}</span>
                              <Badge variant="outline" className={`text-[9px] ${avc.border} ${avc.color} rounded`}>{wasRetrievalFailure ? "—" : `${analysis.confidence}%`}</Badge>
                              <Badge variant="outline" className="text-[9px] ml-auto rounded">{analysis.inputType === "url" ? "URL" : "Text"}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mb-0.5">{analysis.summary}</p>
                            <p className="text-[9px] text-muted-foreground/50 line-clamp-1">{analysis.inputText.slice(0, 100)}</p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="cursor-pointer h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={e => { e.stopPropagation(); handleDelete(analysis._id); }}>
                              <Trash2 className="w-3 h-3 text-muted-foreground" />
                            </Button>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STATS ═══ */}
          {activeView === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">Insights & Statistics</p>
                <h1 className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>The Bigger Picture</h1>
                <p className="text-xs text-muted-foreground mt-1">Explore trends, patterns, and insights from analyzed articles.</p>
              </div>
              {!analyses ? (
                <div className="glass-card rounded-lg p-10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="glass-card rounded-lg p-10 text-center">
                  <div className="w-12 h-12 rounded bg-primary/8 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>No data yet</h3>
                  <p className="text-xs text-muted-foreground mb-5">Analyze some content to see statistics.</p>
                  <Button className="cursor-pointer bg-primary text-primary-foreground gap-1.5 text-xs h-9 rounded" onClick={() => setActiveView("analyze")}>
                    Analyze Content
                  </Button>
                </div>
              ) : (
                <StatsView analyses={analyses} />
              )}
            </motion.div>
          )}

          {/* ═══ METHODOLOGY ═══ */}
          {activeView === "methodology" && (
            <motion.div key="methodology" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">Our Approach</p>
                <h1 className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>How Veritas Works</h1>
                <p className="text-xs text-muted-foreground mt-1">A detailed look at the fact-checking process behind every analysis.</p>
              </div>
              <MethodologyView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
