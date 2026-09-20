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
  agree: { label: "AGREE", color: "#A8906E" },
  conflict: { label: "CONFLICT", color: "#A85A50" },
  unverified: { label: "UNVERIFIED", color: "#8A6A45" },
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
      {/* Input section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Article A */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[8px] font-bold tracking-[0.2em]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A8906E" }}
            >
              ARTICLE A
            </span>
            <div className="flex gap-1">
              {(["text", "url"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="text-[7px] px-1.5 py-0.5 cursor-pointer transition-colors uppercase tracking-wider"
                  style={{
                    color: inputTypeA === t ? "#F5F0E8" : "#A8A098",
                    background: inputTypeA === t ? "rgba(168,144,110,0.08)" : "transparent",
                    border: `1px solid ${inputTypeA === t ? "rgba(168,144,110,0.2)" : "#1E1E1E"}`,
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
          <div className="rounded-sm overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
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
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[8px] font-bold tracking-[0.2em]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A6A45" }}
            >
              ARTICLE B
            </span>
            <div className="flex gap-1">
              {(["text", "url"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="text-[7px] px-1.5 py-0.5 cursor-pointer transition-colors uppercase tracking-wider"
                  style={{
                    color: inputTypeB === t ? "#F5F0E8" : "#A8A098",
                    background: inputTypeB === t ? "rgba(168,144,110,0.08)" : "transparent",
                    border: `1px solid ${inputTypeB === t ? "rgba(168,144,110,0.2)" : "#1E1E1E"}`,
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
          <div className="rounded-sm overflow-hidden" style={{ background: "#111111", border: "1px solid #1E1E1E" }}>
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
          className="cursor-pointer gap-1.5 text-[10px] h-8"
          disabled={isComparing || !textA.trim() || !textB.trim()}
          onClick={handleCompare}
          style={{
            background: isComparing ? "rgba(168,144,110,0.06)" : "#A8906E",
            color: "#0A0A0A",
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
            className="text-[9px] cursor-pointer"
            style={{ color: "#A8A098" }}
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
                className="w-full flex items-center gap-3 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.02] text-left"
                style={{ borderBottom: "1px solid #1E1E1E" }}
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.key ? null : section.key,
                  )
                }
              >
                <span
                  className="text-[9px] font-bold tracking-[0.15em] flex-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A8A098" }}
                >
                  {section.label}
                </span>
                <span
                  className="text-[8px] px-1.5 py-0.5"
                  style={{ color: "#A8906E", background: "rgba(168,144,110,0.08)", borderRadius: "1px" }}
                >
                  {section.count}
                </span>
                <motion.div animate={{ rotate: expandedSection === section.key ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3" style={{ color: "#A8A098" }} />
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
                            <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: "1px solid #1E1E1E10" }}>
                              <div className="flex-1">
                                <p className="text-[10px] italic" style={{ color: "#F5F0E8" }}>
                                  "{item.claim}"
                                </p>
                              </div>
                              <span
                                className="text-[7px] font-bold tracking-wider px-1.5 py-0.5 shrink-0"
                                style={{ color: rel.color, background: `${rel.color}15`, borderRadius: "1px" }}
                              >
                                {rel.label}
                              </span>
                            </div>
                          );
                        })}

                      {section.key === "contradictions" &&
                        result.contradictoryClaims.map((item, i) => (
                          <div key={i} className="py-2" style={{ borderBottom: "1px solid #1E1E1E10" }}>
                            <div className="flex items-start gap-2 mb-1">
                              <span className="text-[7px] font-bold tracking-wider shrink-0 mt-0.5" style={{ color: "#A8906E" }}>A</span>
                              <p className="text-[10px] italic flex-1" style={{ color: "#F5F0E8" }}>"{item.claimA}"</p>
                            </div>
                            <div className="flex items-center gap-2 my-1 pl-4">
                              <div className="w-4 h-px" style={{ background: "#A85A50" }} />
                              <span className="text-[7px] font-bold" style={{ color: "#A85A50" }}>CONFLICT</span>
                              <div className="w-4 h-px" style={{ background: "#A85A50" }} />
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-[7px] font-bold tracking-wider shrink-0 mt-0.5" style={{ color: "#8A6A45" }}>B</span>
                              <p className="text-[10px] italic flex-1" style={{ color: "#F5F0E8" }}>"{item.claimB}"</p>
                            </div>
                            <p className="text-[9px] mt-1.5 pl-4" style={{ color: "#A8A098" }}>{item.explanation}</p>
                          </div>
                        ))}

                      {section.key === "framing" &&
                        result.differentFraming.map((item, i) => (
                          <div key={i} className="py-2" style={{ borderBottom: "1px solid #1E1E1E10" }}>
                            <p className="text-[8px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: "#A8906E" }}>
                              {item.topic}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded-sm" style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
                                <span className="text-[7px] font-bold block mb-0.5" style={{ color: "#A8906E" }}>ARTICLE A</span>
                                <p className="text-[9px] leading-relaxed" style={{ color: "#A8A098" }}>{item.framingA}</p>
                              </div>
                              <div className="p-2 rounded-sm" style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
                                <span className="text-[7px] font-bold block mb-0.5" style={{ color: "#8A6A45" }}>ARTICLE B</span>
                                <p className="text-[9px] leading-relaxed" style={{ color: "#A8A098" }}>{item.framingB}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                      {section.key === "missing" &&
                        result.missingInformation.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: "1px solid #1E1E1E10" }}>
                            <span
                              className="text-[7px] font-bold tracking-wider px-1 py-0.5 shrink-0"
                              style={{ color: item.present === "A" ? "#A8906E" : "#8A6A45", background: item.present === "A" ? "rgba(168,144,110,0.1)" : "rgba(138,106,69,0.1)", borderRadius: "1px" }}
                            >
                              {item.present === "A" ? "IN A" : "IN B"}
                            </span>
                            <p className="text-[10px]" style={{ color: "#A8A098" }}>{item.information}</p>
                          </div>
                        ))}

                      {section.key === "sources" &&
                        result.sourceDifferences.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: "1px solid #1E1E1E10" }}>
                            <span
                              className="text-[7px] font-bold tracking-wider px-1 py-0.5 shrink-0"
                              style={{ color: item.inArticle === "A" ? "#A8906E" : "#8A6A45", background: item.inArticle === "A" ? "rgba(168,144,110,0.1)" : "rgba(138,106,69,0.1)", borderRadius: "1px" }}
                            >
                              {item.inArticle === "A" ? "A" : "B"}
                            </span>
                            <div>
                              <span className="text-[10px] font-semibold block" style={{ color: "#F5F0E8" }}>{item.source}</span>
                              <span className="text-[9px]" style={{ color: "#A8A098" }}>{item.detail}</span>
                            </div>
                          </div>
                        ))}

                      {section.count === 0 && (
                        <p className="text-[10px] text-center py-3 italic" style={{ color: "#A8A098" }}>
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
