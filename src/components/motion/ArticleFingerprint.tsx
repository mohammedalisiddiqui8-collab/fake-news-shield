"use client";
import { motion } from "framer-motion";

export interface FingerprintData {
  claims: number;
  sources: number;
  verified: number;
  uncertain: number;
  contradicted: number;
  unverified: number;
  sourceCoverage: number;
  sourceRefs?: number;
  evidenceFound: number;
}

interface ArticleFingerprintProps {
  fingerprint: FingerprintData;
  dateStr?: string;
  note?: string;
  /**
   * false when no fingerprint was produced at all (retrieval never yielded
   * content). Zeros are then NOT a result and are never printed: every figure
   * reads "—" so no investigation appears to have happened.
   */
  available?: boolean;
}

/**
 * The fingerprint as an editorial ledger: figures set in serif against
 * hairline rules, two columns on desktop — a data page, not nine tiles.
 */
export function ArticleFingerprint({ fingerprint, dateStr, note, available = true }: ArticleFingerprintProps) {
  const value = (n: number) => (available ? String(n) : "—");
  // Source coverage is a claim ratio: with no extracted claims there is no
  // ratio to report, so it reads "—" rather than 0%.
  const coverageAvailable = available && fingerprint.claims > 0;
  const coverage = coverageAvailable ? fingerprint.sourceCoverage + "%" : "—";
  const coverageWidth = coverageAvailable ? `${fingerprint.sourceCoverage}%` : "0%";
  const cells = [
    { label: "Claims", value: value(fingerprint.claims), color: "#F1F0EA" },
    { label: "Unique sources", value: value(fingerprint.sources), color: "#F1F0EA" },
    { label: "Verified", value: value(fingerprint.verified), color: "#8A9A82" },
    { label: "Uncertain", value: value(fingerprint.uncertain), color: "#B0A183" },
    { label: "Contradicted", value: value(fingerprint.contradicted), color: "#B08479" },
    { label: "Unverified", value: value(fingerprint.unverified), color: "#A5A5A1" },
    { label: "Claim–source refs", value: available ? (fingerprint.sourceRefs != null ? String(fingerprint.sourceRefs) : "—") : "—", color: "#F1F0EA" },
    { label: "Evidence found", value: value(fingerprint.evidenceFound), color: "#F1F0EA" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border">
        {cells.map((cell, i) => (
          <motion.div
            key={cell.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className={`py-6 ${i % 2 !== 0 ? "border-l border-border pl-5" : "pr-5"} ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l sm:border-border sm:pl-5" : ""} ${i === 3 ? "sm:border-l sm:border-border sm:pl-5" : ""}`}
          >
            <span
              className="block font-serif-editorial text-[28px] sm:text-[32px] leading-none tabular"
              style={{ color: cell.color }}
            >
              {cell.value}
            </span>
            <span className="block kicker mt-3" style={{ opacity: 0.65, letterSpacing: "0.16em" }}>{cell.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Source coverage — a single restrained indicator, set apart on its own rule */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <span className="kicker" style={{ opacity: 0.7 }}>Source coverage</span>
          <span className="font-mono text-[11px] tabular" style={{ color: "#C9C3B7" }}>
            {coverage}
          </span>
        </div>
        <div className="h-[2px] w-full" style={{ background: "#3A3B3E" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: coverageWidth }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
            style={{ background: "#C9C3B7" }}
          />
        </div>
        <p className="kicker mt-4" style={{ opacity: 0.45 }}>
          {note ?? `Last updated ${dateStr}`}
        </p>
      </div>
    </div>
  );
}
