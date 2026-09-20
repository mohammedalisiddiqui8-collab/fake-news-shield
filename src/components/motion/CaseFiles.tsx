"use client";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Clock,
  Globe,
  Trash2,
} from "lucide-react";

/* ─── Types ─── */
export interface CaseFile {
  id: string;
  caseNumber: string;
  analyzedAt: string;
  type: string;
  source: string;
  verdict: "likely_real" | "likely_fake" | "uncertain";
  confidence: number;
  summary: string;
  inputText: string;
}

interface CaseFilesProps {
  cases: CaseFile[];
  onSelect: (caseFile: CaseFile) => void;
  onDelete: (id: string) => void;
}

/* ─── Verdict config ─── */
const verdictDisplay: Record<
  CaseFile["verdict"],
  { icon: typeof CheckCircle2; color: string; label: string; bg: string }
> = {
  likely_real: {
    icon: CheckCircle2,
    color: "#A8906E",
    label: "CREDIBLE",
    bg: "rgba(168,144,110,0.08)",
  },
  likely_fake: {
    icon: XCircle,
    color: "#A85A50",
    label: "MISLEADING",
    bg: "rgba(168,90,80,0.08)",
  },
  uncertain: {
    icon: AlertTriangle,
    color: "#8A6A45",
    label: "UNCERTAIN",
    bg: "rgba(138,106,69,0.08)",
  },
};

/**
 * Investigation-style history records.
 * Each analysis becomes a case file with professional investigative aesthetics.
 */
export function CaseFiles({ cases, onSelect, onDelete }: CaseFilesProps) {
  if (cases.length === 0) {
    return (
      <div className="py-10 text-center">
        <div
          className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-3"
          style={{ background: "rgba(168,144,110,0.06)", border: "1px solid #1E1E1E" }}
        >
          <Shield className="w-5 h-5" style={{ color: "#A8906E" }} />
        </div>
        <h3
          className="text-sm font-semibold mb-1"
          style={{ fontFamily: "'DM Serif Display', serif", color: "#F5F0E8" }}
        >
          No case files
        </h3>
        <p className="text-[10px]" style={{ color: "#A8A098" }}>
          Start analyzing to create your first investigation case.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {cases.map((caseFile, i) => {
        const vc = verdictDisplay[caseFile.verdict];
        const Icon = vc.icon;

        return (
          <motion.div
            key={caseFile.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="group cursor-pointer transition-all duration-200 hover:bg-white/[0.015]"
            style={{
              borderBottom: "1px solid #1E1E1E",
            }}
            onClick={() => onSelect(caseFile)}
          >
            <div className="flex items-start gap-3 py-3.5 px-1">
              {/* Case icon */}
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                style={{ background: vc.bg, border: `1px solid ${vc.color}20` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: vc.color }} />
              </div>

              {/* Case content */}
              <div className="flex-1 min-w-0">
                {/* Case ID */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[8px] font-bold tracking-[0.2em]"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#8A6A45",
                    }}
                  >
                    {caseFile.caseNumber}
                  </span>
                  <span
                    className="text-[7px] font-bold tracking-wider px-1.5 py-0.5"
                    style={{ color: vc.color, background: `${vc.color}15`, borderRadius: "1px" }}
                  >
                    {vc.label}
                  </span>
                  <span
                    className="text-[8px] font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: vc.color,
                    }}
                  >
                    {caseFile.confidence}%
                  </span>
                </div>

                {/* Summary */}
                <p
                  className="text-[10px] leading-relaxed line-clamp-1"
                  style={{ color: "#A8A098" }}
                >
                  {caseFile.summary}
                </p>

                {/* Metadata row */}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" style={{ color: "#A8A098", opacity: 0.4 }} />
                    <span
                      className="text-[8px]"
                      style={{ color: "#A8A098", opacity: 0.5 }}
                    >
                      {caseFile.analyzedAt}
                    </span>
                  </div>
                  {caseFile.source && caseFile.source !== "N/A" && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" style={{ color: "#A8A098", opacity: 0.4 }} />
                      <span
                        className="text-[8px]"
                        style={{ color: "#A8A098", opacity: 0.5 }}
                      >
                        {caseFile.source}
                      </span>
                    </div>
                  )}
                  <span
                    className="text-[7px] px-1.5 py-0.5"
                    style={{ color: "#A8A098", opacity: 0.4, border: "1px solid #1E1E1E", borderRadius: "1px" }}
                  >
                    {caseFile.type}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  className="cursor-pointer h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(caseFile.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" style={{ color: "#A8A098" }} />
                </button>
                <ChevronRight
                  className="w-3.5 h-3.5 transition-colors"
                  style={{ color: "#A8A098" }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
