import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Shield, Search, Clock, Home, Loader2, CheckCircle2, AlertTriangle,
  XCircle, FileText, Link, Trash2, ChevronRight, Brain, BarChart3,
  Sparkles, ArrowLeft, ClipboardPaste, BookOpen, TrendingUp,
  Sun, Moon, Download, Share2, Lightbulb, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CredibilityGauge } from "@/components/CredibilityGauge";
import { StatsView } from "@/components/StatsView";
import { MethodologyView } from "@/components/MethodologyView";

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
}

const verdictConfig: Record<Verdict, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string; description: string }> = {
  likely_real: { label: "Likely Real", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/30", description: "This content appears to be based on credible sourcing and journalistic standards." },
  uncertain: { label: "Uncertain", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30", description: "This content has a mix of credible and questionable elements. Exercise caution." },
  likely_fake: { label: "Likely Fake", icon: XCircle, color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/30", description: "This content shows multiple indicators of misinformation or manipulation." },
};

const sampleTexts = [
  { label: "Scientists Discover New Species", text: "In a groundbreaking discovery, a team of marine biologists from the University of Oxford has identified a previously unknown deep-sea species in the Mariana Trench. The creature, dubbed 'Abyssalus luminaris,' was found at a depth of 8,200 meters during a three-month expedition funded by the National Science Foundation. Lead researcher Dr. Sarah Chen published the findings in the journal Nature on March 15, 2025, noting the species' bioluminescent properties were unlike anything documented before. The discovery was independently verified by teams from MIT and the Woods Hole Oceanographic Institution.", type: "real" as const, category: "Science" },
  { label: "Miracle Cure Hidden by Big Pharma", text: "EXPOSED!!! A secret natural cure for ALL diseases has been kept hidden by the corrupt pharmaceutical industry for DECADES!!! An anonymous insider known only as 'Dr. Truth' revealed in a viral Telegram post that a simple mixture of turmeric, apple cider vinegar, and lemon juice can cure cancer, diabetes, AND heart disease!!! The government doesn't want you to know this because they make BILLIONS from keeping you sick!!! Studies PROVE this works but the mainstream media won't report it because they're all PAID OFF!!! Share this before they delete it!!! \ud83d\udea8\ud83d\udea8\ud83d\udea8", type: "fake" as const, category: "Health" },
  { label: "Market Rate Report", text: "The Federal Reserve held interest rates steady at 5.25-5.50% during its January 2025 meeting, as widely anticipated by economists. Fed Chair Jerome Powell stated in the post-meeting press conference that while inflation has decreased from its 2022 peak of 9.1% to approximately 2.9%, the committee needs 'more confidence' that inflation is sustainably moving toward the 2% target before considering cuts. Markets reacted modestly, with the S&P 500 closing 0.3% lower. Analysts at Goldman Sachs and JPMorgan continue to project the first rate cut in June, though some Federal Reserve officials, including Governor Christopher Waller, have expressed caution about moving too quickly.", type: "real" as const, category: "Finance" },
  { label: "Political Conspiracy Post", text: "WAKE UP SHEEPLE!!! The deep state doesn't want you to know that the 2024 election was completely STOLEN by globalist elites!!! Anonymous sources confirm that George Soros paid millions to rig the voting machines!!! The mainstream media is covering it all up because they're controlled by the new world order!!! Do your own research before they censor this!!! Share before they delete it!!! The truth is OUT THERE but the corrupt politicians don't want you to see it!!! \ud83d\udc40\ud83d\udc40\ud83d\udc40", type: "fake" as const, category: "Politics" },
  { label: "Climate Change Report", text: "A comprehensive study published in the journal Science on February 12, 2025, has found that global sea levels rose by 4.5 millimeters in 2024, the fastest annual increase ever recorded. The research, conducted by scientists at NASA's Goddard Institute for Space Studies and the University of Copenhagen, analyzed satellite data from 2015 to 2024. Lead author Dr. Michael Torres stated that the findings 'confirm the accelerating trend predicted by climate models.' The study notes that while some skeptics question the methodology, the results have been independently verified by teams at the UK Met Office and the Australian Bureau of Meteorology.", type: "real" as const, category: "Environment" },
  { label: "Celebrity Health Rumor", text: "SHOCKING!!! Famous Hollywood star secretly DEAD but government hiding it from public!!! Sources say the celebrity was assassinated because they knew too much about big pharma's secret experiments!!! Friends are being threatened to stay silent!!! The deep state doesn't want you to know the truth!!! Wake up people!!! This is bigger than any conspiracy you've ever seen!!! The mainstream media won't report it because they're all controlled by the elite!!! Share this before they delete it and silence the truth forever!!! \ud83d\udca2\ud83d\udca2\ud83d\udca2", type: "fake" as const, category: "Entertainment" },
];

const mediaLiteracyTips = [
  "Always check the source. Is it a recognized news organization with editorial standards?",
  "Look for named sources. Credible articles cite specific people with their titles and affiliations.",
  "Be wary of ALL CAPS and excessive exclamation marks — professional journalism avoids these.",
  "Check if the article presents multiple perspectives or just one side of the story.",
  "Verify statistics by searching for the original study or data source.",
  "If an article makes you very angry or scared, pause before sharing — that's by design.",
  "Look for specific dates, locations, and quotes — vague articles are less reliable.",
  "Share buttons with 'before they delete it' are designed to pressure you into sharing false content.",
];

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => setCurrentTip(t => (t + 1) % mediaLiteracyTips.length), 8000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Ctrl+Enter to analyze
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
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed.");
    } finally { setIsAnalyzing(false); }
  }, [inputText, inputType, runAnalysis, createAnalysis]);

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteAnalysis({ id: id as never }); toast.success("Removed from history."); }
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

  // Highlight keywords in text
  const highlightText = useCallback((text: string, keywords: string[]) => {
    if (!keywords.length) return text;
    let result = text;
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`(${escaped})`, "gi"), `\u2761$1\u2762`);
    }
    return result;
  }, []);

  // Export as text
  const handleExport = useCallback(() => {
    if (!currentResult) return;
    const vc = verdictConfig[currentResult.verdict];
    const text = `VERITAS ANALYSIS REPORT\n${"=".repeat(40)}\n\nVerdict: ${vc.label}\nConfidence: ${currentResult.confidence}%\n\nSummary:\n${currentResult.summary}\n\nReasoning:\n${currentResult.reasoning}\n\nRed Flags (${currentResult.redFlags.length}):\n${currentResult.redFlags.map(f => "  - " + f).join("\n")}\n\nGreen Flags (${currentResult.greenFlags.length}):\n${currentResult.greenFlags.map(f => "  - " + f).join("\n")}\n\nAnalyzed Content:\n${inputText.slice(0, 500)}\n\n--- Generated by Veritas ---`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "veritas-analysis.txt"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  }, [currentResult, inputText]);

  // Share via Web Share API
  const handleShare = useCallback(async () => {
    if (!currentResult) return;
    const vc = verdictConfig[currentResult.verdict];
    const shareData = { title: "Veritas Analysis", text: `${vc.label} (${currentResult.confidence}% confidence)\n\n${currentResult.summary}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); toast.success("Copied to clipboard!"); }
    } catch { /* user cancelled */ }
  }, [currentResult]);

  const vc = currentResult ? verdictConfig[currentResult.verdict] : null;

  const navItems = [
    { key: "analyze" as ViewType, icon: Search, label: "Analyze" },
    { key: "result" as ViewType, icon: BarChart3, label: "Results", disabled: !currentResult },
    { key: "history" as ViewType, icon: Clock, label: "History" },
    { key: "stats" as ViewType, icon: TrendingUp, label: "Stats" },
    { key: "methodology" as ViewType, icon: BookOpen, label: "Method" },
  ];

  return (
    <div className="min-h-screen gradient-bg text-foreground">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[100px] animate-float" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-chart-2/6 blur-[80px] animate-float-delay" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button type="button" className="cursor-pointer flex items-center gap-2 sm:gap-3" onClick={() => navigate("/")}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary flex items-center justify-center"><Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" /></div>
            <span className="font-bold tracking-tight hidden sm:inline text-sm">Veritas</span>
          </button>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map(item => (
              <Button key={item.key} variant={activeView === item.key ? "default" : "ghost"} size="sm"
                className={`cursor-pointer gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3 h-8 ${activeView === item.key ? "bg-primary text-primary-foreground" : ""}`}
                disabled={item.disabled} onClick={() => setActiveView(item.key)}>
                <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /><span className="hidden md:inline">{item.label}</span>
              </Button>
            ))}
            <div className="w-px h-5 bg-border/50 mx-1" />
            <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={() => navigate("/")}><Home className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* ─── ANALYZE ─── */}
          {activeView === "analyze" && (
            <motion.div key="analyze" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Brain className="w-5 h-5 text-primary" /></div>
                  <div><h1 className="text-xl sm:text-2xl font-bold tracking-tight">Analyze Content</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">Paste any news article or content to verify</p></div>
                </div>
              </div>

              {/* Media literacy tip */}
              <motion.div key={currentTip} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="glass-card rounded-xl p-3 sm:p-4 mb-4 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{mediaLiteracyTips[currentTip]}</p>
              </motion.div>

              <div className="flex gap-2 mb-4">
                <Button variant={inputType === "text" ? "default" : "outline"} className={`cursor-pointer gap-2 text-xs sm:text-sm ${inputType === "text" ? "bg-primary text-primary-foreground" : "glass"}`} onClick={() => setInputType("text")}><FileText className="w-3.5 h-3.5" />Paste Text</Button>
                <Button variant={inputType === "url" ? "default" : "outline"} className={`cursor-pointer gap-2 text-xs sm:text-sm ${inputType === "url" ? "bg-primary text-primary-foreground" : "glass"}`} onClick={() => setInputType("url")}><Link className="w-3.5 h-3.5" />Paste URL</Button>
              </div>

              <div className="glass-card rounded-2xl p-1 mb-4">
                <Textarea ref={textareaRef} value={inputText} onChange={e => setInputText(e.target.value)}
                  placeholder={inputType === "text" ? "Paste a news article, social media post, or any text content here..." : "Paste a news URL here..."}
                  className="min-h-[180px] sm:min-h-[200px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed" />
              </div>

              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <span className="text-xs text-muted-foreground">{inputText.length > 0 ? `${inputText.length.toLocaleString()} characters` : "Enter content to analyze"}</span>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">Ctrl+Enter</span>
                  <Button variant="ghost" size="sm" className="cursor-pointer gap-1.5 text-xs" onClick={() => navigator.clipboard.readText().then(t => { setInputText(t); toast.success("Pasted!"); }).catch(() => toast.error("Unable to read clipboard."))}><ClipboardPaste className="w-3.5 h-3.5" />Paste</Button>
                  <Button variant="ghost" size="sm" className="cursor-pointer text-xs" onClick={() => setInputText("")} disabled={!inputText}>Clear</Button>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Try a sample</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sampleTexts.map(sample => (
                    <button key={sample.label} type="button" className="glass-card rounded-xl p-4 text-left hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => { setInputText(sample.text); setInputType("text"); }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary truncate">{sample.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{sample.text.slice(0, 80)}...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-[10px] ${sample.type === "real" ? "border-emerald-500/30 text-emerald-600" : "border-red-500/30 text-red-600"}`}>
                          {sample.type === "real" ? "Likely Real" : "Likely Fake"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">{sample.category}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button size="lg" className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 sm:h-13 text-sm sm:text-base glow-blue"
                onClick={handleAnalyze} disabled={isAnalyzing || !inputText.trim()}>
                {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Sparkles className="w-5 h-5" />Analyze Content</>}
              </Button>
            </motion.div>
          )}

          {/* ─── RESULT ─── */}
          {activeView === "result" && currentResult && vc && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center justify-between mb-6">
                <button type="button" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={() => setActiveView("analyze")}>
                  <ArrowLeft className="w-4 h-4" />New Analysis
                </button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs glass" onClick={handleExport}><Download className="w-3.5 h-3.5" />Export</Button>
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs glass" onClick={handleShare}><Share2 className="w-3.5 h-3.5" />Share</Button>
                </div>
              </div>

              {/* Verdict card */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
                className={`glass-card rounded-2xl p-6 sm:p-8 border ${vc.border} mb-6`}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <CredibilityGauge confidence={currentResult.confidence} verdict={currentResult.verdict} size={160} />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
                      <div className={`w-10 h-10 rounded-xl ${vc.bg} flex items-center justify-center`}><vc.icon className={`w-5 h-5 ${vc.color}`} /></div>
                      <h2 className={`text-xl sm:text-2xl font-bold ${vc.color}`}>{vc.label}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{vc.description}</p>
                    <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start flex-wrap">
                      {currentResult.redFlags.length > 0 && <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /><span className="text-xs text-red-600 font-medium">{currentResult.redFlags.length} red flag{currentResult.redFlags.length !== 1 ? "s" : ""}</span></div>}
                      {currentResult.greenFlags.length > 0 && <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-600 font-medium">{currentResult.greenFlags.length} green flag{currentResult.greenFlags.length !== 1 ? "s" : ""}</span></div>}
                      <span className="text-[10px] text-muted-foreground">{currentResult.wordCount} words</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-muted-foreground">Confidence Score</span><span className="font-semibold">{currentResult.confidence}%</span></div>
                  <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${currentResult.confidence}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      className={`h-full rounded-full ${currentResult.verdict === "likely_real" ? "bg-emerald-500" : currentResult.verdict === "likely_fake" ? "bg-red-500" : "bg-amber-500"}`} />
                  </div>
                </div>
              </motion.div>

              {/* Category Breakdown Chart */}
              {currentResult.categoryBreakdown.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="glass-card rounded-2xl p-5 sm:p-6 mb-4">
                  <div className="flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-primary" /><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Category Breakdown</h3></div>
                  <div className="space-y-2.5">
                    {currentResult.categoryBreakdown.filter(c => c.maxScore > 0).map((cat, i) => {
                      const pct = Math.round((cat.score / cat.maxScore) * 100);
                      return (
                        <motion.div key={cat.category} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-medium">{cat.category}</span>
                            <span className={cat.type === "red" ? "text-red-500" : "text-emerald-500"}>{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                              className={`h-full rounded-full ${cat.type === "red" ? "bg-red-400" : "bg-emerald-400"}`} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Triggered Keywords */}
              {currentResult.triggeredKeywords.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="glass-card rounded-2xl p-5 sm:p-6 mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Detected Keywords</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResult.triggeredKeywords.map(kw => (
                      <Badge key={kw} variant="outline" className="text-[10px] border-red-500/30 text-red-600 bg-red-500/5">{kw}</Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }} className="glass-card rounded-2xl p-5 sm:p-6 mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Summary</h3>
                <p className="text-sm leading-relaxed">{currentResult.summary}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="glass-card rounded-2xl p-5 sm:p-6 mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Detailed Reasoning</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{currentResult.reasoning}</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.35 }} className="glass-card rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /></div>
                    <h3 className="text-sm font-semibold text-red-600">Red Flags</h3>
                    {currentResult.redFlags.length > 0 && <Badge variant="outline" className="border-red-500/30 text-red-600 text-[10px] ml-auto">{currentResult.redFlags.length}</Badge>}
                  </div>
                  {currentResult.redFlags.length === 0 ? <p className="text-xs text-muted-foreground italic">No red flags detected</p> : (
                    <ul className="space-y-2">{currentResult.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-relaxed"><XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" /><span className="text-muted-foreground">{flag}</span></li>
                    ))}</ul>
                  )}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }} className="glass-card rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></div>
                    <h3 className="text-sm font-semibold text-emerald-600">Green Flags</h3>
                    {currentResult.greenFlags.length > 0 && <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 text-[10px] ml-auto">{currentResult.greenFlags.length}</Badge>}
                  </div>
                  {currentResult.greenFlags.length === 0 ? <p className="text-xs text-muted-foreground italic">No green flags detected</p> : (
                    <ul className="space-y-2">{currentResult.greenFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-relaxed"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /><span className="text-muted-foreground">{flag}</span></li>
                    ))}</ul>
                  )}
                </motion.div>
              </div>

              {/* Highlighted content */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.45 }} className="glass-card rounded-2xl p-5 sm:p-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Analyzed Content {currentResult.triggeredKeywords.length > 0 && <span className="text-red-500 normal-case">(highlighted keywords)</span>}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-h-40 overflow-auto whitespace-pre-wrap">
                  {currentResult.triggeredKeywords.length > 0
                    ? highlightText(inputText, currentResult.triggeredKeywords).split("\u2761").map((part, i, arr) => {
                        if (i === arr.length - 1) return <span key={i}>{part}</span>;
                        const [highlighted, rest] = arr[i + 1]?.split("\u2762") ?? [arr[i + 1], ""];
                        return <span key={i}>{part}<span className="bg-red-500/15 text-red-600 font-medium px-0.5 rounded">{highlighted}</span>{rest}</span>;
                      })
                    : inputText
                  }
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ─── HISTORY ─── */}
          {activeView === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-6 sm:mb-8"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div><div><h1 className="text-xl sm:text-2xl font-bold tracking-tight">Analysis History</h1><p className="text-xs sm:text-sm text-muted-foreground">Your recent detection results</p></div></div></div>
              {!analyses ? <div className="glass-card rounded-2xl p-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" /></div>
                : analyses.length === 0 ? <div className="glass-card rounded-2xl p-12 text-center"><div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Search className="w-6 h-6 text-primary" /></div><h3 className="text-lg font-semibold mb-2">No analyses yet</h3><p className="text-sm text-muted-foreground mb-6">Start by analyzing your first piece of content.</p><Button className="cursor-pointer bg-primary text-primary-foreground gap-2" onClick={() => setActiveView("analyze")}><Sparkles className="w-4 h-4" />Analyze Content</Button></div>
                : <div className="space-y-3">{analyses.map((analysis, i) => { const avc = verdictConfig[analysis.verdict]; return (
                  <motion.div key={analysis._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="glass-card rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => handleLoadFromHistory(analysis)}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${avc.bg} flex items-center justify-center shrink-0`}><avc.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${avc.color}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs sm:text-sm font-semibold ${avc.color}`}>{avc.label}</span>
                          <Badge variant="outline" className={`text-[10px] ${avc.border} ${avc.color}`}>{analysis.confidence}%</Badge>
                          <Badge variant="outline" className="text-[10px] ml-auto">{analysis.inputType === "url" ? <Link className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}{analysis.inputType === "url" ? "URL" : "Text"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{analysis.summary}</p>
                        <p className="text-[11px] text-muted-foreground/60 line-clamp-1">{analysis.inputText.slice(0, 120)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="cursor-pointer h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); handleDelete(analysis._id); }}><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ); })}</div>
              }
            </motion.div>
          )}

          {/* ─── STATS ─── */}
          {activeView === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-6 sm:mb-8"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div><div><h1 className="text-xl sm:text-2xl font-bold tracking-tight">Statistics</h1><p className="text-xs sm:text-sm text-muted-foreground">Overview of your analysis activity</p></div></div></div>
              {!analyses ? <div className="glass-card rounded-2xl p-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" /></div>
                : analyses.length === 0 ? <div className="glass-card rounded-2xl p-12 text-center"><div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-6 h-6 text-primary" /></div><h3 className="text-lg font-semibold mb-2">No data yet</h3><p className="text-sm text-muted-foreground mb-6">Analyze some content to see statistics.</p><Button className="cursor-pointer bg-primary text-primary-foreground gap-2" onClick={() => setActiveView("analyze")}><Sparkles className="w-4 h-4" />Analyze Content</Button></div>
                : <StatsView analyses={analyses} />}
            </motion.div>
          )}

          {/* ─── METHODOLOGY ─── */}
          {activeView === "methodology" && (
            <motion.div key="methodology" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-6 sm:mb-8"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-primary" /></div><div><h1 className="text-xl sm:text-2xl font-bold tracking-tight">Methodology</h1><p className="text-xs sm:text-sm text-muted-foreground">Technical documentation of the detection approach</p></div></div></div>
              <MethodologyView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
