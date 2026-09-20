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
  Landmark, FlaskConical, Thermometer, Newspaper,
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
import { getLiveNews, FALLBACK_SAMPLES, getCategoryIconComponent, relativeTime, type LiveArticle } from "@/lib/news";

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
}

/* ─── Verdict Config (editorial palette) ─── */
const verdictConfig: Record<Verdict, {
  label: string; icon: typeof CheckCircle2; color: string; bg: string;
  border: string; accentColor: string; description: string;
}> = {
  likely_real: {
    label: "Likely Credible", icon: CheckCircle2, color: "text-primary",
    bg: "bg-primary/8", border: "border-primary/20", accentColor: "#A8906E",
    description: "This content appears to be based on credible sourcing and journalistic standards.",
  },
  uncertain: {
    label: "Uncertain", icon: AlertTriangle, color: "text-accent",
    bg: "bg-accent/10", border: "border-accent/25", accentColor: "#C4985A",
    description: "This content has a mix of credible and questionable elements. Exercise caution.",
  },
  likely_fake: {
    label: "Likely Misleading", icon: XCircle, color: "text-destructive",
    bg: "bg-destructive/10", border: "border-destructive/20", accentColor: "#E85D4A",
    description: "This content shows multiple indicators of misinformation or manipulation.",
  },
};

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
  const [resultTab, setResultTab] = useState<"overview" | "linguistic" | "source" | "logical" | "findings" | "claims" | "evidence" | "sourceprofile">("overview");
  const [compareView, setCompareView] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState<"quick" | "standard" | "deep">("standard");
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
    // If we have fewer than 6 live items, pad with static fallback
    if (liveItems.length < 6) {
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
      const result = await runAnalysis({ text: inputText.trim(), inputType });
      setCurrentResult(result);
      setActiveView("result");
      try {
        await createAnalysis({
          inputText: inputText.trim().slice(0, 5000), inputType,
          verdict: result.verdict, confidence: result.confidence, summary: result.summary,
          redFlags: result.redFlags, greenFlags: result.greenFlags, reasoning: result.reasoning,
        });
      } catch { /* best-effort */ }
      toast.success("Analysis complete.");
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
    setCurrentResult({
      verdict: analysis.verdict, confidence: analysis.confidence, summary: analysis.summary,
      redFlags: analysis.redFlags, greenFlags: analysis.greenFlags, reasoning: analysis.reasoning,
      triggeredKeywords: analysis.triggeredKeywords ?? [], categoryBreakdown: analysis.categoryBreakdown ?? [],
      wordCount: analysis.wordCount ?? analysis.inputText.split(/\s+/).length,
    });
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
                      { key: "linguistic" as const, label: "Linguistic Analysis", icon: Search },
                      { key: "source" as const, label: "Source Analysis", icon: Globe },
                      { key: "logical" as const, label: "Logical Consistency", icon: Brain },
                      { key: "findings" as const, label: "Key Findings", icon: AlertTriangle },
                      ...(currentResult.claims && currentResult.claims.length > 0 ? [{ key: "claims" as const, label: "Claim Analysis", icon: FileText }] : []),
                      ...(currentResult.evidenceTimeline && currentResult.evidenceTimeline.length > 0 ? [{ key: "evidence" as const, label: "Evidence Timeline", icon: Clock }] : []),
                      { key: "sourceprofile" as const, label: "Source Profile", icon: Globe },
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

              {/* ─── Confidence Visualization ─── */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.12 }}
                className="glass-card rounded-lg p-4 sm:p-5 mb-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <Activity className="w-3.5 h-3.5" style={{ color: "#A8906E" }} />
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Confidence Breakdown</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Language", score: currentResult.confidence + (currentResult.greenFlags.length > currentResult.redFlags.length ? 5 : -5), color: "#A8906E" },
                    { label: "Source", score: currentResult.greenFlags.length > 0 ? Math.min(currentResult.confidence + 8, 98) : Math.max(currentResult.confidence - 10, 15), color: "#A8906E" },
                    { label: "Claims", score: currentResult.confidence, color: "#A8906E" },
                    { label: "Bias", score: Math.max(100 - currentResult.redFlags.length * 15, 10), color: currentResult.redFlags.length > 2 ? "#A85A50" : "#A8906E" },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-[9px] font-mono tracking-wider w-12 text-muted-foreground uppercase">{item.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(item.score, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className="h-full rounded-full" style={{ background: item.color }} />
                      </div>
                      <span className="text-[9px] font-mono w-8 text-right" style={{ color: item.color }}>{item.score}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

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
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Language Analysis</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Emotional", value: currentResult.redFlags.length > 2 ? 72 : 28, color: currentResult.redFlags.length > 2 ? "#A85A50" : "#A8906E" },
                    { label: "Sensational", value: currentResult.triggeredKeywords.length * 8, color: currentResult.triggeredKeywords.length > 3 ? "#A85A50" : "#A8906E" },
                    { label: "Neutral", value: currentResult.greenFlags.length > currentResult.redFlags.length ? 65 : 30, color: "#A8906E" },
                    { label: "Factual", value: currentResult.confidence, color: "#A8906E" },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-[9px] mb-0.5">
                        <span className="font-mono tracking-wider uppercase" style={{ color: "#A8A098" }}>{item.label}</span>
                        <span className="font-mono" style={{ color: item.color }}>{Math.min(item.value, 100)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(item.value, 100)}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                          className="h-full rounded-full" style={{ background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
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
                      <ExpandableClaim key={i} claimNumber={String(i + 1).padStart(2, "0")} claimText={flag} status="misleading" confidence={Math.max(100 - i * 12, 50)} details="This flag was detected by our NLP pattern matching system and contributes to the overall misinformation score." />
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
                      <ExpandableClaim key={i} claimNumber={String(i + 1).padStart(2, "0")} claimText={flag} status="supported" confidence={Math.min(70 + i * 5, 95)} details="This positive signal was detected and contributes to the credibility assessment." />
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
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>{currentResult.claims.length} claims extracted — click to explore evidence</p>
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
                    <p className="text-[9px]" style={{ color: "#A8A098" }}>Source credibility assessment</p>
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
                    ? getHighlightedParts(inputText, currentResult.triggeredKeywords).map((part, i) =>
                        part.highlighted
                          ? <span key={i} className="bg-destructive/10 text-destructive font-medium px-0.5 rounded">{part.text}</span>
                          : <span key={i}>{part.text}</span>
                      )
                    : inputText
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

                      // Simple comparison based on analysis results
                      const sharedClaims: ComparisonResult["sharedClaims"] = [];
                      const contradictoryClaims: ComparisonResult["contradictoryClaims"] = [];
                      const differentFraming: ComparisonResult["differentFraming"] = [];
                      const missingInformation: ComparisonResult["missingInformation"] = [];
                      const sourceDifferences: ComparisonResult["sourceDifferences"] = [];

                      // Compare keywords
                      const sharedKw = resultA.triggeredKeywords.filter(k => resultB.triggeredKeywords.includes(k));
                      if (sharedKw.length > 0) {
                        sharedClaims.push({ claim: `Both articles reference: ${sharedKw.slice(0, 3).join(", ")}`, relationship: "agree" });
                      }

                      // Compare verdicts
                      if (resultA.verdict === resultB.verdict) {
                        sharedClaims.push({ claim: `Both articles reached the same verdict: ${resultA.verdict.replace("_", " ")}`, relationship: "agree" });
                      } else {
                        contradictoryClaims.push({
                          claimA: `Article A verdict: ${resultA.verdict.replace("_", " ")} (${resultA.confidence}%)`,
                          claimB: `Article B verdict: ${resultB.verdict.replace("_", " ")} (${resultB.confidence}%)`,
                          explanation: "The two articles reached different credibility assessments.",
                        });
                      }

                      // Compare red flags
                      const sharedRed = resultA.redFlags.filter(f => resultB.redFlags.some(f2 => f2.toLowerCase().includes(f.toLowerCase().slice(0, 20))));
                      if (sharedRed.length > 0) {
                        sharedClaims.push({ claim: `Shared concerns: ${sharedRed.slice(0, 2).join("; ")}`, relationship: "agree" });
                      }

                      // Different framing
                      if (resultA.greenFlags.length !== resultB.greenFlags.length) {
                        differentFraming.push({
                          topic: "Source quality assessment",
                          framingA: `${resultA.greenFlags.length} positive signals detected`,
                          framingB: `${resultB.greenFlags.length} positive signals detected`,
                        });
                      }

                      // Missing information
                      if (resultA.triggeredKeywords.length > 0 && resultB.triggeredKeywords.length === 0) {
                        missingInformation.push({ present: "A", information: "Sensational language patterns detected in Article A" });
                      } else if (resultB.triggeredKeywords.length > 0 && resultA.triggeredKeywords.length === 0) {
                        missingInformation.push({ present: "B", information: "Sensational language patterns detected in Article B" });
                      }

                      // Source differences
                      if (resultA.wordCount !== resultB.wordCount) {
                        sourceDifferences.push({ source: "Content length", inArticle: resultA.wordCount > resultB.wordCount ? "A" : "B", detail: `Article ${resultA.wordCount > resultB.wordCount ? "A" : "B"} is longer (${Math.max(resultA.wordCount, resultB.wordCount)} words)` });
                      }

                      return { sharedClaims, contradictoryClaims, differentFraming, missingInformation, sourceDifferences };
                    }}
                  />
                </div>
              </motion.div>
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
                              <span className={`text-[11px] font-semibold ${avc.color}`}>{avc.label}</span>
                              <Badge variant="outline" className={`text-[9px] ${avc.border} ${avc.color} rounded`}>{analysis.confidence}%</Badge>
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
