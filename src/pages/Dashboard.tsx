import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Shield,
  Search,
  Clock,
  Home,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Link,
  Trash2,
  ChevronRight,
  Brain,
  BarChart3,
  Sparkles,
  ArrowLeft,
  ClipboardPaste,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Verdict = "likely_real" | "likely_fake" | "uncertain";

interface AnalysisResult {
  verdict: Verdict;
  confidence: number;
  summary: string;
  redFlags: string[];
  greenFlags: string[];
  reasoning: string;
}

const verdictConfig: Record<
  Verdict,
  {
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    bg: string;
    border: string;
    description: string;
  }
> = {
  likely_real: {
    label: "Likely Real",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    description:
      "This article appears to be based on credible sourcing and journalistic standards.",
  },
  uncertain: {
    label: "Uncertain",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    description:
      "This article contains a mix of credible and questionable elements. Exercise caution.",
  },
  likely_fake: {
    label: "Likely Fake",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    description:
      "This article shows multiple indicators of misinformation or manipulation.",
  },
};

const sampleTexts = [
  {
    label: "Breaking: Scientists Discover New Species",
    text: "In a groundbreaking discovery, a team of marine biologists from the University of Oxford has identified a previously unknown deep-sea species in the Mariana Trench. The creature, dubbed 'Abyssalus luminaris,' was found at a depth of 8,200 meters during a three-month expedition funded by the National Science Foundation. Lead researcher Dr. Sarah Chen published the findings in the journal Nature on March 15, 2025, noting the species bioluminescent properties were unlike anything documented before. The discovery was independently verified by teams from MIT and the Woods Hole Oceanographic Institution.",
  },
  {
    label: "URGENT: Miracle Cure Hidden by Big Pharma",
    text: "EXPOSED!!! A secret natural cure for ALL diseases has been kept hidden by the corrupt pharmaceutical industry for DECADES!!! An anonymous insider known only as 'Dr. Truth' revealed in a viral Telegram post that a simple mixture of turmeric, apple cider vinegar, and lemon juice can cure cancer, diabetes, AND heart disease!!! The government doesn't want you to know this because they make BILLIONS from keeping you sick!!! Studies PROVE this works but the mainstream media won't report it because they're all PAID OFF!!! Share this before they delete it!!! 🚨🚨🚨",
  },
  {
    label: "Balanced: Market Report",
    text: "The Federal Reserve held interest rates steady at 5.25-5.50% during its January 2025 meeting, as widely anticipated by economists. Fed Chair Jerome Powell stated in the post-meeting press conference that while inflation has decreased from its 2022 peak of 9.1% to approximately 2.9%, the committee needs 'more confidence' that inflation is sustainably moving toward the 2% target before considering cuts. Markets reacted modestly, with the S&P 500 closing 0.3% lower. Analysts at Goldman Sachs and JPMorgan continue to project the first rate cut in June, though some Federal Reserve officials, including Governor Christopher Waller, have expressed caution about moving too quickly.",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const analyses = useQuery(api.analyses.listByUser);
  const createAnalysis = useMutation(api.analyses.create);
  const deleteAnalysis = useMutation(api.analyses.remove);
  const runAnalysis = useAction(api.analyzeNews.analyzeNews);

  const [inputText, setInputText] = useState("");
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(
    null,
  );
  const [activeView, setActiveView] = useState<"analyze" | "result" | "history">(
    "analyze",
  );

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to analyze.");
      return;
    }

    if (inputText.trim().length < 20) {
      toast.error("Please enter at least 20 characters for a meaningful analysis.");
      return;
    }

    setIsAnalyzing(true);
    setCurrentResult(null);

    try {
      const result = await runAnalysis({
        text: inputText.trim(),
        inputType,
      });

      setCurrentResult(result);
      setActiveView("result");

      // Save to history (best-effort — if user is not authenticated this may fail silently)
      try {
        await createAnalysis({
          inputText: inputText.trim().slice(0, 5000),
          inputType,
          verdict: result.verdict,
          confidence: result.confidence,
          summary: result.summary,
          redFlags: result.redFlags,
          greenFlags: result.greenFlags,
          reasoning: result.reasoning,
        });
      } catch {
        // History save is best-effort — analysis still works
      }

      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Analysis failed. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, inputType, runAnalysis, createAnalysis]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteAnalysis({ id: id as never });
        toast.success("Removed from history.");
      } catch {
        toast.error("Failed to delete.");
      }
    },
    [deleteAnalysis],
  );

  const handleLoadFromHistory = useCallback(
    (analysis: (typeof analyses extends (infer T)[] | undefined ? T : never)) => {
      if (!analysis) return;
      setCurrentResult({
        verdict: analysis.verdict,
        confidence: analysis.confidence,
        summary: analysis.summary,
        redFlags: analysis.redFlags,
        greenFlags: analysis.greenFlags,
        reasoning: analysis.reasoning,
      });
      setInputText(analysis.inputText);
      setInputType(analysis.inputType);
      setActiveView("result");
    },
    [],
  );

  const vc = currentResult ? verdictConfig[currentResult.verdict] : null;

  return (
    <div className="min-h-screen gradient-bg text-foreground">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[100px] animate-float" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-chart-2/6 blur-[80px] animate-float-delay" />
      </div>

      {/* Top nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="cursor-pointer flex items-center gap-3"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold tracking-tight hidden sm:inline">
                Fake News Shield
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant={activeView === "analyze" ? "default" : "ghost"}
              size="sm"
              className={`cursor-pointer gap-1.5 text-xs sm:text-sm ${
                activeView === "analyze" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => setActiveView("analyze")}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analyze</span>
            </Button>
            <Button
              variant={activeView === "result" ? "default" : "ghost"}
              size="sm"
              className={`cursor-pointer gap-1.5 text-xs sm:text-sm ${
                activeView === "result" ? "bg-primary text-primary-foreground" : ""
              }`}
              disabled={!currentResult}
              onClick={() => setActiveView("result")}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Results</span>
            </Button>
            <Button
              variant={activeView === "history" ? "default" : "ghost"}
              size="sm"
              className={`cursor-pointer gap-1.5 text-xs sm:text-sm ${
                activeView === "history" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => setActiveView("history")}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </Button>

            <div className="w-px h-6 bg-border/50 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-8 w-8"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ─── ANALYZE VIEW ─────────────────────────────────────── */}
          {activeView === "analyze" && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Analyze Content
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Paste any news article or content to check its credibility
                    </p>
                  </div>
                </div>
              </div>

              {/* Input type toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={inputType === "text" ? "default" : "outline"}
                  className={`cursor-pointer gap-2 ${
                    inputType === "text"
                      ? "bg-primary text-primary-foreground"
                      : "glass"
                  }`}
                  onClick={() => setInputType("text")}
                >
                  <FileText className="w-4 h-4" />
                  Paste Text
                </Button>
                <Button
                  variant={inputType === "url" ? "default" : "outline"}
                  className={`cursor-pointer gap-2 ${
                    inputType === "url"
                      ? "bg-primary text-primary-foreground"
                      : "glass"
                  }`}
                  onClick={() => setInputType("url")}
                >
                  <Link className="w-4 h-4" />
                  Paste URL
                </Button>
              </div>

              {/* Text input */}
              <div className="glass-card rounded-2xl p-1 mb-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    inputType === "text"
                      ? "Paste a news article, social media post, or any text content here for analysis..."
                      : "Paste a news URL here for analysis..."
                  }
                  className="min-h-[200px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between mb-8">
                <span className="text-xs text-muted-foreground">
                  {inputText.length > 0
                    ? `${inputText.length.toLocaleString()} characters`
                    : "Enter content to analyze"}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer gap-1.5 text-xs"
                    onClick={() => {
                      navigator.clipboard.readText().then((text) => {
                        setInputText(text);
                        toast.success("Pasted from clipboard");
                      }).catch(() => {
                        toast.error("Unable to read clipboard. Please paste manually.");
                      });
                    }}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={() => setInputText("")}
                    disabled={!inputText}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Sample texts */}
              <div className="mb-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                  Try a sample
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sampleTexts.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      className="glass-card rounded-xl p-4 text-left hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => {
                        setInputText(sample.text);
                        setInputType("text");
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-primary truncate">
                          {sample.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {sample.text.slice(0, 100)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Analyze button */}
              <Button
                size="lg"
                className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-13 text-base glow-blue"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Content
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* ─── RESULT VIEW ──────────────────────────────────────── */}
          {activeView === "result" && currentResult && vc && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
                onClick={() => setActiveView("analyze")}
              >
                <ArrowLeft className="w-4 h-4" />
                New Analysis
              </button>

              {/* Verdict card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`glass-card rounded-2xl p-8 border ${vc.border} mb-6`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div
                    className={`w-16 h-16 rounded-2xl ${vc.bg} flex items-center justify-center shrink-0`}
                  >
                    <vc.icon className={`w-8 h-8 ${vc.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className={`text-2xl font-bold ${vc.color}`}>
                        {vc.label}
                      </h2>
                      <Badge
                        variant="outline"
                        className={`${vc.border} ${vc.color} text-xs`}
                      >
                        {currentResult.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {vc.description}
                    </p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold">
                      {currentResult.confidence}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${currentResult.confidence}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                      }}
                      className={`h-full rounded-full ${
                        currentResult.verdict === "likely_real"
                          ? "bg-emerald-500"
                          : currentResult.verdict === "likely_fake"
                            ? "bg-red-500"
                            : "bg-amber-500"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="glass-card rounded-2xl p-6 mb-6"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Summary
                </h3>
                <p className="text-sm leading-relaxed">
                  {currentResult.summary}
                </p>
              </motion.div>

              {/* Reasoning */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="glass-card rounded-2xl p-6 mb-6"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Detailed Reasoning
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {currentResult.reasoning}
                </p>
              </motion.div>

              {/* Flags grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Red Flags */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-red-600">
                      Red Flags
                    </h3>
                    {currentResult.redFlags.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-red-500/30 text-red-600 text-[10px] ml-auto"
                      >
                        {currentResult.redFlags.length}
                      </Badge>
                    )}
                  </div>
                  {currentResult.redFlags.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No red flags detected
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {currentResult.redFlags.map((flag, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs leading-relaxed"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>

                {/* Green Flags */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-600">
                      Green Flags
                    </h3>
                    {currentResult.greenFlags.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-600 text-[10px] ml-auto"
                      >
                        {currentResult.greenFlags.length}
                      </Badge>
                    )}
                  </div>
                  {currentResult.greenFlags.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No green flags detected
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {currentResult.greenFlags.map((flag, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs leading-relaxed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </div>

              {/* Input preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Analyzed Content
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-h-32 overflow-auto">
                  {inputText}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ─── HISTORY VIEW ─────────────────────────────────────── */}
          {activeView === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Analysis History
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Your recent fake news detection results
                    </p>
                  </div>
                </div>
              </div>

              {!analyses ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Start by analyzing your first piece of content.
                  </p>
                  <Button
                    className="cursor-pointer bg-primary text-primary-foreground gap-2"
                    onClick={() => setActiveView("analyze")}
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((analysis, i) => {
                    const avc = verdictConfig[analysis.verdict];
                    return (
                      <motion.div
                        key={analysis._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="glass-card rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        onClick={() => handleLoadFromHistory(analysis)}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl ${avc.bg} flex items-center justify-center shrink-0`}
                          >
                            <avc.icon className={`w-5 h-5 ${avc.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-sm font-semibold ${avc.color}`}
                              >
                                {avc.label}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${avc.border} ${avc.color}`}
                              >
                                {analysis.confidence}%
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[10px] ml-auto"
                              >
                                {analysis.inputType === "url" ? (
                                  <Link className="w-3 h-3 mr-1" />
                                ) : (
                                  <FileText className="w-3 h-3 mr-1" />
                                )}
                                {analysis.inputType === "url" ? "URL" : "Text"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                              {analysis.summary}
                            </p>
                            <p className="text-[11px] text-muted-foreground/60 line-clamp-1">
                              {analysis.inputText.slice(0, 120)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(analysis._id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
