import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export function InvestigationReplay({ analysis }: {
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
  }
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

  const stages: ReplayStage[] = [
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
      {/* Controls */}
      <div className="flex items-center gap-1.5 mb-3">
        <button type="button" onClick={reset}
          className="cursor-pointer w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-[#1E1E1E]"
          style={{ border: "1px solid #1E1E1E", color: "#A8A098" }}>
          <RotateCcw className="w-3 h-3" />
        </button>
        <button type="button" onClick={stepBack} disabled={currentStage === 0}
          className="cursor-pointer w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-[#1E1E1E] disabled:opacity-30"
          style={{ border: "1px solid #1E1E1E", color: "#A8A098" }}>
          <SkipBack className="w-3 h-3" />
        </button>
        <button type="button" onClick={isPlaying ? pause : play}
          className="cursor-pointer w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-[#1E1E1E]"
          style={{ border: "1px solid #A8906E", color: "#A8906E" }}>
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={stepForward} disabled={currentStage >= stages.length - 1}
          className="cursor-pointer w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-[#1E1E1E] disabled:opacity-30"
          style={{ border: "1px solid #1E1E1E", color: "#A8A098" }}>
          <SkipForward className="w-3 h-3" />
        </button>
        <div className="flex-1 h-1 rounded-full overflow-hidden ml-2" style={{ background: "#1E1E1E" }}>
          <motion.div animate={{ width: ((currentStage / (stages.length - 1)) * 100) + "%" }}
            transition={{ duration: 0.3 }} className="h-full rounded-full" style={{ background: "#A8906E" }} />
        </div>
        <span className="text-[8px] font-mono ml-1" style={{ color: "#A8A098" }}>{currentStage + 1}/{stages.length}</span>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {stages.map((stage, i) => {
          const isActive = i === currentStage;
          const isDone = i < currentStage;
          const isPending = i > currentStage;
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center">
                <motion.div animate={{
                  background: isDone ? "rgba(168,144,110,0.08)" : isActive ? "rgba(168,144,110,0.06)" : "#0D0D0D",
                  borderColor: isDone ? "rgba(168,144,110,0.2)" : isActive ? "rgba(168,144,110,0.15)" : "#1E1E1E",
                }} transition={{ duration: 0.3 }}
                  className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0 z-10" style={{ border: "1px solid" }}>
                  {isDone ? (stage.occurred
                    ? <CheckCircle2 className="w-3 h-3" style={{ color: "#A8906E" }} />
                    : <AlertTriangle className="w-3 h-3" style={{ color: "#A8A098" }} />)
                    : isActive ? <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
                        <Icon className="w-3 h-3" style={{ color: "#A8906E" }} /></motion.div>
                    : <Icon className="w-3 h-3" style={{ color: "#A8A09840" }} />}
                </motion.div>
                {i < stages.length - 1 && (
                  <div className="relative w-px flex-1 min-h-[20px]">
                    <div className="absolute inset-0" style={{ background: "#1E1E1E" }} />
                    <motion.div animate={{ height: isDone || isActive ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }} className="absolute top-0 left-0 w-full" style={{ background: "rgba(168,144,110,0.25)" }} />
                  </div>
                )}
              </div>
              <motion.div animate={{ opacity: isPending ? 0.25 : 1, x: isActive ? 3 : 0 }}
                transition={{ duration: 0.3 }} className="py-1 flex-1">
                <span className="text-[9px] font-bold tracking-[0.1em] block" style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: isActive ? "#A8906E" : isDone ? "#A8A098" : "#A8A098",
                }}>{stage.label}</span>
                {isActive && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[9px] mt-0.5 leading-relaxed" style={{ color: "#A8A098" }}>{stage.detail}</motion.p>
                )}
                {!isActive && isDone && (
                  <p className="text-[8px] mt-0.5 leading-relaxed" style={{ color: "#A8A098", opacity: 0.5 }}>{stage.detail}</p>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


