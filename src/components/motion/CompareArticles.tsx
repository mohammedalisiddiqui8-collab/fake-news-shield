"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  ChevronDown,
  FileText,
  Link,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/* ─── Types ─── */
export interface ComparisonResult {
  sharedClaims: Array<{ claim: string; relationship: "agree" | "conflict" | "unverified" }>;
  contradictoryClaims: Array<{ claimA: string; claimB: string; explanation: string }>;
  differentFraming: Array<{ topic: string; framingA: string; framingB: string }>;
  missingInformation: Array<{ present: "A" | "B"; information: string }>;
  sourceDifferences: Array<{ source: string; inArticle: "A" | "B"; detail: string }>;
}

interface CompareArticlesProps {
  onCompare: (textA: string, textB: string) => Promise<ComparisonResult>;
}

/* ─── Comparison state badge ─── */
const relConfig: Record<string, { label: string; color: string }> = {
  agree: { label: "AGREE", color: "#F1F0EA" },
  conflict: { label: "CONFLICT", color: "#B3263E" },
  unverified: { label: "UNVERIFIED", color: "#B7A47A" },
};

/**
 * Compare two articles side by side.
 * User provides two text inputs; the component runs comparison and displays results.
 */
export function CompareArticles({ onCompare }: CompareArticlesProps) {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [inputTypeA, setInputTypeA] = useState<"text" | "url">("text");
  const [inputTypeB, setInputTypeB] = useState<"text" | "url">("text");
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("shared");

  const handleCompare = async () => {
    if (!textA.trim() || !textB.trim()) return;
    setIsComparing(true);
    try {
      const r = await onCompare(textA.trim(), textB.trim());
      setResult(r);
    } catch {
      // silent fail
    } finally {
      setIsComparing(false);
    }
  };

  const sections = result
    ? [
        { key: "shared", label: "SHARED CLAIMS", count: result.sharedClaims.length },
        { key: "contradictions", label: "CONTRADICTIONS", count: result.contradictoryClaims.length },
        { key: "framing", label: "DIFFERENT FRAMING", count: result.differentFraming.length },
        { key: "missing", label: "MISSING INFORMATION", count: result.missingInformation.length },
        { key: "sources", label: "SOURCE DIFFERENCES", count: result.sourceDifferences.length },
      ]
    : [];

  return (
    <div>
      {/* Input section — a research workspace: ARTICLE A vs ARTICLE B */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-8 mb-4">
        {/* The between — "vs." on a hairline, the workspace's centre line */}
        <div className="pointer-events-none absolute inset-y-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
          <span className="h-6 w-px" style={{ background: "#242424" }} />
          <span className="kicker" style={{ color: "#6B6963" }}>vs.</span>
          <span className="h-6 w-px" style={{ background: "#242424" }} />
        </div>
        {/* Article A */}
        <div>
          <div className="flex items-baseline gap-2.5 mb-2">
            <span
              className="text-[13px] leading-none tracking-[0.08em]"
              style={{ fontFamily: "'Bodoni Moda', Georgia, serif", color: "#F1F0EA" }}
            >
              ARTICLE A
            </span>
            <span className="kicker" style={{ opacity: 0.5 }}>Subject of comparison</span>
            <div className="flex gap-1">
              {(["text", "url"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="text-[9.5px] px-1.5 py-0.5 cursor-pointer transition-colors uppercase tracking-wider"
                  style={{
                    color: inputTypeA === t ? "#F1F0EA" : "#A6A39B",
                    background: inputTypeA === t ? "rgba(201,195,183,0.08)" : "transparent",
                    border: `1px solid ${inputTypeA === t ? "rgba(201,195,183,0.2)" : "#242424"}`,
                    borderRadius: "1px",
                  }}
                  onClick={() => setInputTypeA(t)}
                >
                  {t === "text" ? <FileText className="w-2.5 h-2.5 inline mr-0.5" /> : <Link className="w-2.5 h-2.5 inline mr-0.5" />}
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-sm overflow-hidden" style={{ background: "#0C0C0C", border: "1px solid #242424" }}>
            <Textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder={inputTypeA === "text" ? "Paste first article..." : "Paste URL..."}
              className="min-h-[100px] border-0 bg-transparent resize-none focus-visible:ring-0 text-[11px] leading-relaxed"
            />
          </div>
        </div>

        {/* Article B */}
        <div>
          <div className="flex items-baseline gap-2.5 mb-2">
            <span
              className="text-[13px] leading-none tracking-[0.08em]"
              style={{ fontFamily: "'Bodoni Moda', Georgia, serif", color: "#F1F0EA" }}
            >
              ARTICLE B
            </span>
            <span className="kicker" style={{ opacity: 0.5 }}>Subject of comparison</span>
            <div className="flex gap-1">
              {(["text", "url"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="text-[9.5px] px-1.5 py-0.5 cursor-pointer transition-colors uppercase tracking-wider"
                  style={{
                    color: inputTypeB === t ? "#F1F0EA" : "#A6A39B",
                    background: inputTypeB === t ? "rgba(201,195,183,0.08)" : "transparent",
                    border: `1px solid ${inputTypeB === t ? "rgba(201,195,183,0.2)" : "#242424"}`,
                    borderRadius: "1px",
                  }}
                  onClick={() => setInputTypeB(t)}
                >
                  {t === "text" ? <FileText className="w-2.5 h-2.5 inline mr-0.5" /> : <Link className="w-2.5 h-2.5 inline mr-0.5" />}
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-sm overflow-hidden" style={{ background: "#0C0C0C", border: "1px solid #242424" }}>
            <Textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder={inputTypeB === "text" ? "Paste second article..." : "Paste URL..."}
              className="min-h-[100px] border-0 bg-transparent resize-none focus-visible:ring-0 text-[11px] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Compare button */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-1.5 text-[10px] uppercase tracking-[0.16em] h-9 px-5 transition-opacity hover:opacity-90 disabled:opacity-40"
          disabled={isComparing || !textA.trim() || !textB.trim()}
          onClick={handleCompare}
          style={{
            background: isComparing ? "rgba(201,195,183,0.06)" : "#F1F0EA",
            color: "#080808",
            border: "none",
          }}
        >
          {isComparing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ArrowLeftRight className="w-3 h-3" />
          )}
          {isComparing ? "Comparing..." : "Compare Articles"}
        </Button>
        {result && (
          <button
            type="button"
            className="text-[9.5px] cursor-pointer"
            style={{ color: "#A6A39B" }}
            onClick={() => { setResult(null); setTextA(""); setTextB(""); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-0"
        >
          {sections.map((section) => (
            <div key={section.key}>
              <button
                type="button"
                className="w-full flex items-center gap-3 py-2.5 cursor-pointer transition-colors hover:bg-[rgba(241,240,234,0.025)] text-left"
                style={{ borderBottom: "1px solid #242424" }}
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.key ? null : section.key,
                  )
                }
              >
                <span
                  className="text-[9.5px] font-bold tracking-[0.15em] flex-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A6A39B" }}
                >
                  {section.label}
                </span>
                <span
                  className="text-[9.5px] px-1.5 py-0.5"
                  style={{ color: "#F1F0EA", background: "rgba(201,195,183,0.08)", borderRadius: "1px" }}
                >
                  {section.count}
                </span>
                <motion.div animate={{ rotate: expandedSection === section.key ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3" style={{ color: "#A6A39B" }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedSection === section.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="py-3 px-2 space-y-2">
                      {section.key === "shared" &&
                        result.sharedClaims.map((item, i) => {
                          const rel = relConfig[item.relationship];
                          return (
                            <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: "1px solid #24242410" }}>
                              <div className="flex-1">
                                <p className="text-[11px] italic" style={{ color: "#F1F0EA" }}>
                                  "{item.claim}"
                                </p>
                              </div>
                              <span
                                className="text-[9.5px] font-bold tracking-wider px-1.5 py-0.5 shrink-0"
                                style={{ color: rel.color, background: `${rel.color}15`, borderRadius: "1px" }}
                              >
                                {rel.label}
                              </span>
                            </div>
                          );
                        })}

                      {section.key === "contradictions" &&
                        result.contradictoryClaims.map((item, i) => (
                          <div key={i} className="py-2" style={{ borderBottom: "1px solid #24242410" }}>
                            <div className="flex items-start gap-2 mb-1">
                              <span className="text-[9.5px] font-bold tracking-wider shrink-0 mt-0.5" style={{ color: "#F1F0EA" }}>A</span>
                              <p className="font-quote text-[11px] flex-1" style={{ color: "#F1F0EA" }}>"{item.claimA}"</p>
                            </div>
                            <div className="flex items-center gap-2 my-1 pl-4">
                              <div className="w-4 h-px" style={{ background: "#B3263E" }} />
                              <span className="text-[9.5px] font-bold" style={{ color: "#B3263E" }}>CONFLICT</span>
                              <div className="w-4 h-px" style={{ background: "#B3263E" }} />
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-[9.5px] font-bold tracking-wider shrink-0 mt-0.5" style={{ color: "#B7A47A" }}>B</span>
                              <p className="font-quote text-[11px] flex-1" style={{ color: "#F1F0EA" }}>"{item.claimB}"</p>
                            </div>
                            <p className="text-[9.5px] mt-1.5 pl-4" style={{ color: "#A6A39B" }}>{item.explanation}</p>
                          </div>
                        ))}

                      {section.key === "framing" &&
                        result.differentFraming.map((item, i) => (
                          <div key={i} className="py-2" style={{ borderBottom: "1px solid #24242410" }}>
                            <p className="text-[9.5px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: "#F1F0EA" }}>
                              {item.topic}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2" style={{ background: "#0C0C0C", border: "1px solid #242424" }}>
                                <span className="text-[9.5px] font-bold block mb-0.5" style={{ color: "#F1F0EA" }}>ARTICLE A</span>
                                <p className="text-[9.5px] leading-relaxed" style={{ color: "#A6A39B" }}>{item.framingA}</p>
                              </div>
                              <div className="p-2" style={{ background: "#0C0C0C", border: "1px solid #242424" }}>
                                <span className="text-[9.5px] font-bold block mb-0.5" style={{ color: "#B7A47A" }}>ARTICLE B</span>
                                <p className="text-[9.5px] leading-relaxed" style={{ color: "#A6A39B" }}>{item.framingB}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                      {section.key === "missing" &&
                        result.missingInformation.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: "1px solid #24242410" }}>
                            <span
                              className="text-[9.5px] font-bold tracking-wider px-1 py-0.5 shrink-0"
                              style={{ color: item.present === "A" ? "#F1F0EA" : "#B7A47A", background: item.present === "A" ? "rgba(201,195,183,0.1)" : "rgba(176,161,131,0.1)", borderRadius: "1px" }}
                            >
                              {item.present === "A" ? "IN A" : "IN B"}
                            </span>
                            <p className="text-[11px]" style={{ color: "#A6A39B" }}>{item.information}</p>
                          </div>
                        ))}

                      {section.key === "sources" &&
                        result.sourceDifferences.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: "1px solid #24242410" }}>
                            <span
                              className="text-[9.5px] font-bold tracking-wider px-1 py-0.5 shrink-0"
                              style={{ color: item.inArticle === "A" ? "#F1F0EA" : "#B7A47A", background: item.inArticle === "A" ? "rgba(201,195,183,0.1)" : "rgba(176,161,131,0.1)", borderRadius: "1px" }}
                            >
                              {item.inArticle === "A" ? "A" : "B"}
                            </span>
                            <div>
                              <span className="text-[11px] font-semibold block" style={{ color: "#F1F0EA" }}>{item.source}</span>
                              <span className="text-[9.5px]" style={{ color: "#A6A39B" }}>{item.detail}</span>
                            </div>
                          </div>
                        ))}

                      {section.count === 0 && (
                        <p className="text-[11px] text-center py-3 italic" style={{ color: "#A6A39B" }}>
                          No {section.label.toLowerCase()} found.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
