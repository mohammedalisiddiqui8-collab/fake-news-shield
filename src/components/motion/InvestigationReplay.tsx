import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, CheckCircle2, FileText, Search, Brain, Target, Shield, Globe, AlertTriangle } from "lucide-react";
import { deriveSourceCounts } from "@/lib/investigationStats";

interface ReplayStage {
  id: number;
  label: string;
  detail: string;
  icon: typeof FileText;
  /** Whether the backend ACTUALLY performed this operation for this result.
   *  A stage that did not occur is never shown with a completed check. */
  occurred: boolean;
}

export function InvestigationReplay({ analysis, retrievalFailed, failedUrl, failureReason }: {
  analysis: {
    wordCount: number;
    redFlags: string[];
    greenFlags: string[];
    triggeredKeywords: string[];
    verdict: string;
    confidence: number;
    sourceProfile?: { source: string };
    claims?: Array<{ id: number; status: string }>;
    crossCheck?: Array<{ claimId: number; sources: Array<{ name: string; relationship: string; url?: string }> }>;
  };
  /** URL retrieval failed — the investigation never ran. Only the stop trace
   *  (URL received → attempt → failed → stopped) is shown. */
  retrievalFailed?: boolean;
  failedUrl?: string;
  failureReason?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  // Every stage detail below is derived from the real investigation result —
  // nothing is simulated. Missing data is reported as unavailable, never invented.
  const claims = analysis.claims ?? [];
  const crossCheck = analysis.crossCheck ?? [];
  // ONE shared derivation — identical numbers to Source Cross-Check, Evidence
  // Map, Timeline and Final Assessment (aggregate == sum of per-claim refs).
  const counts = deriveSourceCounts(crossCheck);
  const retrieved = counts.retrieved;
  const uniqueSources = counts.uniqueSources;
  const sourceRefs = counts.claimSourceRefs;
  const supporting = counts.supporting;
  const contradicting = counts.contradicting;
  const contradictedClaims = claims.filter(c => c.status === "contradicted").length;
  // Same rule as the rest of the investigation: only an explicit sentinel marks
  // an unavailable search (a "no corroboration" notice is a real result).
  const searchFailed = crossCheck.length > 0 && crossCheck.every(c =>
    c.sources.length === 0 ||
    c.sources.every(s => !s.url && s.name === "SOURCE SEARCH UNAVAILABLE"));

  const stages: ReplayStage[] = retrievalFailed ? [
    { id: 0, label: "ARTICLE URL RECEIVED", detail: failedUrl ? "URL submitted: " + failedUrl : "Article URL submitted for analysis", icon: FileText, occurred: true },
    { id: 1, label: "ARTICLE RETRIEVAL ATTEMPTED", detail: "Fetching article content from the provided URL", icon: Globe, occurred: true },
    { id: 2, label: "RETRIEVAL FAILED", detail: failureReason ? "Reason: " + failureReason : "Article content could not be retrieved", icon: AlertTriangle, occurred: true },
    { id: 3, label: "INVESTIGATION STOPPED", detail: "No claims, source search, evidence collection, cross-checking, framing analysis, confidence calculation, or verdict generation was performed.", icon: Shield, occurred: true },
  ] : [
    { id: 0, label: "ARTICLE RECEIVED", detail: analysis.wordCount + " words analyzed", icon: FileText, occurred: true },
    { id: 1, label: "CLAIMS IDENTIFIED", detail: claims.length > 0 ? claims.length + " factual claim(s) extracted from the content" : "No claim data available for this result", icon: Search, occurred: claims.length > 0 },
    { id: 2, label: "SOURCES SEARCHED", detail: crossCheck.length > 0 ? crossCheck.length + " claim(s) searched against live news coverage" : "No cross-check data available for this result", icon: Globe, occurred: crossCheck.length > 0 },
    { id: 3, label: "EVIDENCE COLLECTED", detail: searchFailed ? "Source search unavailable — insufficient evidence available" : retrieved.length > 0 ? uniqueSources + " unique independent source(s) retrieved (" + sourceRefs + " claim–source reference(s))" : crossCheck.length > 0 ? "NO INDEPENDENT CORROBORATION FOUND" : "No evidence data available for this result", icon: CheckCircle2, occurred: crossCheck.length > 0 && !searchFailed },
    { id: 4, label: "CROSS-CHECKED", detail: retrieved.length > 0 ? supporting + " supporting · " + contradicting + " contradicting claim–source reference(s) across " + uniqueSources + " unique source(s)" : "Insufficient evidence available", icon: Brain, occurred: retrieved.length > 0 },
    { id: 5, label: "CONFLICTS IDENTIFIED", detail: retrieved.length === 0 ? "Not performed — no retrieved evidence to analyse for conflicts" : contradictedClaims > 0 ? contradictedClaims + " claim(s) contradicted by retrieved coverage" : "No contradictions found in retrieved evidence", icon: AlertTriangle, occurred: retrieved.length > 0 },
    { id: 6, label: "FRAMING ANALYZED", detail: analysis.redFlags.length + " warning · " + analysis.greenFlags.length + " positive linguistic signal(s) — supplementary only, not proof of truth", icon: Target, occurred: true },
    { id: 7, label: "FINAL ASSESSMENT", detail: analysis.confidence + "% confidence — " + analysis.verdict.replace("_", " "), icon: Shield, occurred: true },
  ];

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStage(0);
  }, []);

  const stepForward = useCallback(() => {
    setCurrentStage(prev => Math.min(prev + 1, stages.length - 1));
  }, [stages.length]);

  const stepBack = useCallback(() => {
    setCurrentStage(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStage >= stages.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStage(prev => prev + 1), 800);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStage, stages.length]);

  return (
    <div>
      {/* Controls — square hairline instruments, quiet against the document */}
      <div className="flex items-center gap-1.5 mb-4">
        <button type="button" onClick={reset} title="Restart replay"
          className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-[rgba(241,240,234,0.04)]"
          style={{ border: "1px solid #3A3B3E", color: "#A5A5A1" }}>
          <RotateCcw className="w-3 h-3" />
        </button>
        <button type="button" onClick={stepBack} disabled={currentStage === 0} title="Previous stage"
          className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-[rgba(241,240,234,0.04)] disabled:opacity-30"
          style={{ border: "1px solid #3A3B3E", color: "#A5A5A1" }}>
          <SkipBack className="w-3 h-3" />
        </button>
        <button type="button" onClick={isPlaying ? pause : play} title={isPlaying ? "Pause replay" : "Play replay"}
          className="w-8 h-8 flex items-center justify-center transition-colors hover:opacity-85"
          style={{ border: "1px solid #C9C3B7", color: "#C9C3B7" }}>
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={stepForward} disabled={currentStage >= stages.length - 1} title="Next stage"
          className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-[rgba(241,240,234,0.04)] disabled:opacity-30"
          style={{ border: "1px solid #3A3B3E", color: "#A5A5A1" }}>
          <SkipForward className="w-3 h-3" />
        </button>

        {/* Progress — a single hairline rule, not a pill */}
        <div className="flex-1 relative h-px ml-2" style={{ background: "#3A3B3E" }}>
          <motion.div
            animate={{ width: ((currentStage / (stages.length - 1)) * 100) + "%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 h-px"
            style={{ background: "#C9C3B7" }}
          />
        </div>
        <span className="text-[9px] tracking-[0.14em] ml-2 tabular" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A5A5A1" }}>
          {String(currentStage + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}
        </span>
      </div>

      {/* Chronological stage list — the active step carries one sliding marker */}
      <div className="border-t border-border">
        {stages.map((stage, i) => {
          const isActive = i === currentStage;
          const isDone = i < currentStage;
          const isPending = i > currentStage;

          return (
            <div
              key={stage.id}
              className="relative flex items-stretch gap-4 border-b border-border/70"
              style={{ opacity: isPending ? 0.45 : 1 }}
            >
              {/* The active-step indicator — one marker shared across rows,
                  so it glides to the current stage instead of blinking in */}
              {isActive && (
                <motion.span
                  layoutId="replay-active"
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: "#C9C3B7" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {isActive && (
                <motion.span
                  layoutId="replay-active-bg"
                  className="absolute inset-0"
                  style={{ background: "rgba(201,195,183,0.045)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              )}

              {/* Numbered marker + rule to the next stage */}
              <div className="relative flex flex-col items-center pl-3">
                <span
                  className="w-7 shrink-0 text-center text-[9px] leading-none pt-3.5 tracking-[0.12em]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isActive ? "#C9C3B7" : isDone ? "#8A9A82" : "#A5A5A1",
                    opacity: isPending ? 0.7 : 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < stages.length - 1 && (
                  <div className="relative w-px flex-1 min-h-[18px]">
                    <div className="absolute inset-0" style={{ background: "#3A3B3E" }} />
                    <motion.div
                      animate={{ height: isDone || isActive ? "100%" : "0%" }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-0 left-0 w-full"
                      style={{ background: "rgba(201,195,183,0.35)" }}
                    />
                  </div>
                )}
              </div>

              {/* Stage entry */}
              <motion.div
                animate={{ opacity: isPending ? 0.7 : 1 }}
                transition={{ duration: 0.3 }}
                className="relative flex-1 min-w-0 py-3 pr-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-baseline gap-2.5 min-w-0">
                    <stage.icon
                      className="w-3.5 h-3.5 shrink-0 self-center"
                      style={{ color: isActive ? "#C9C3B7" : "#6F7074" }}
                    />
                    <span
                      className="text-[9.5px] tracking-[0.18em] uppercase"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isActive ? "#F1F0EA" : "#A5A5A1",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {stage.label}
                    </span>
                  </span>
                  <span className="shrink-0 flex items-center gap-1.5">
                    {isDone && stage.occurred && <CheckCircle2 className="w-3 h-3" style={{ color: "#8A9A82" }} />}
                    {isDone && !stage.occurred && (
                      <span className="text-[8px] tracking-[0.16em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#B0A183" }}>
                        not performed
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[8px] tracking-[0.16em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#C9C3B7" }}>
                        current step
                      </span>
                    )}
                  </span>
                </div>
                {(isActive || isDone) && (
                  <motion.p
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: isDone && !isActive ? 0.8 : 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-1 text-[11px] leading-relaxed"
                    style={{ color: isActive ? "#F1F0EA" : "#A5A5A1" }}
                  >
                    {stage.detail}
                  </motion.p>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
