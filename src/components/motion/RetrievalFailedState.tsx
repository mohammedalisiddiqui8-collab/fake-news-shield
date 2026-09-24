import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, ClipboardPaste, Fingerprint, Link2, Play } from "lucide-react";
import { ArticleFingerprint, type FingerprintData } from "./ArticleFingerprint";
import { EvidenceChain } from "./EvidenceChain";
import { InvestigationReplay } from "./InvestigationReplay";

/**
 * RETRIEVAL FAILED state — shown when a submitted URL could not be fetched.
 *
 * This is one of three strictly separated states:
 *   1. VERIFIED INVESTIGATION → evidence-based assessment (normal result view)
 *   2. INSUFFICIENT EVIDENCE → investigated, evidence thin → UNCERTAIN
 *   3. RETRIEVAL FAILED     → investigation NOT performed → NO VERDICT
 *
 * No confidence score, verdict, claim, source or evidence is fabricated here:
 * confidence shows "—" and the verdict is "RETRIEVAL FAILED", never
 * "UNCERTAIN". Same design system as the rest of Veritas.
 */

const EMPTY_FINGERPRINT: FingerprintData = {
  claims: 0,
  sources: 0,
  sourceRefs: 0,
  verified: 0,
  uncertain: 0,
  contradicted: 0,
  unverified: 0,
  sourceCoverage: 0,
  evidenceFound: 0,
};

const EMPTY_ANALYSIS = {
  wordCount: 0,
  redFlags: [] as string[],
  greenFlags: [] as string[],
  triggeredKeywords: [] as string[],
  verdict: "uncertain",
  confidence: 0,
};

interface RetrievalFailedStateProps {
  failedUrl?: string;
  failureReason?: string;
  onRetry: () => void;
  onPasteText: () => void;
}

function Panel({
  icon: Icon,
  title,
  subtitle,
  accent,
  delay,
  children,
}: {
  icon: typeof Fingerprint;
  title: string;
  subtitle: string;
  accent: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="rounded-lg mb-3 overflow-hidden"
      style={{ background: "#111111", border: "1px solid #1E1E1E" }}
    >
      <div className="px-4 sm:px-5 pt-4 pb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          <h3
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "#F5F0E8" }}
          >
            {title}
          </h3>
        </div>
        <p className="text-[9px]" style={{ color: "#A8A098" }}>
          {subtitle}
        </p>
      </div>
      <div className="px-4 sm:px-5 pb-4">{children}</div>
    </motion.div>
  );
}

export function RetrievalFailedState({
  failedUrl,
  failureReason,
  onRetry,
  onPasteText,
}: RetrievalFailedStateProps) {
  const reason =
    failureReason || "URL could not be accessed or article content could not be retrieved.";

  return (
    <div>
      {/* ─── Header: UNABLE TO ANALYZE — verdict RETRIEVAL FAILED, confidence — ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="glass-card rounded-lg p-5 sm:p-7 mb-4"
        style={{ border: "1px solid rgba(168,90,80,0.25)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="w-14 h-14 rounded flex items-center justify-center shrink-0"
            style={{ background: "rgba(168,90,80,0.08)", border: "1px solid rgba(168,90,80,0.25)" }}
          >
            <AlertTriangle className="w-6 h-6" style={{ color: "#A85A50" }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mb-1">
              Investigation
            </p>
            <h2
              className="text-lg sm:text-xl font-bold mb-2"
              style={{ fontFamily: "'DM Serif Display', serif", color: "#F5F0E8" }}
            >
              UNABLE TO ANALYZE
            </h2>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-2">
              <span
                className="text-[8px] font-bold tracking-[0.1em] px-1.5 py-0.5"
                style={{ background: "rgba(168,90,80,0.15)", color: "#A85A50", borderRadius: "1px" }}
              >
                RETRIEVAL FAILED
              </span>
              <span
                className="text-[9px] font-mono tracking-wider"
                style={{ color: "#A8A098" }}
              >
                CONFIDENCE —
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Could not retrieve article content from the provided URL.
            </p>
            <p className="text-[11px] leading-relaxed mt-1" style={{ color: "#A8A098" }}>
              Reason: {reason}
            </p>
            {failedUrl && (
              <p
                className="text-[9px] font-mono mt-1 break-all"
                style={{ color: "#A8A098", opacity: 0.7 }}
              >
                URL {failedUrl}
              </p>
            )}
            <p className="text-[11px] font-semibold mt-2" style={{ color: "#A85A50" }}>
              No factual verification was performed.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 mt-5">
          <button
            type="button"
            className="cursor-pointer flex items-center justify-center gap-2 h-9 px-5 text-xs font-medium rounded transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.98]"
            style={{ background: "#A8906E", color: "#0A0A0A" }}
            onClick={onRetry}
          >
            <RotateCcw className="w-3.5 h-3.5" />Try Again
          </button>
          <button
            type="button"
            className="cursor-pointer flex items-center justify-center gap-2 h-9 px-5 text-xs font-medium rounded transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.98]"
            style={{ background: "#111111", color: "#F5F0E8", border: "1px solid #1E1E1E" }}
            onClick={onPasteText}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />Paste Article Text
          </button>
        </div>
      </motion.div>

      {/* ─── Article Fingerprint — zeros, explicitly labeled ─── */}
      <Panel
        icon={Fingerprint}
        title="Article Fingerprint"
        subtitle="Zeros below mean no investigation ran — they are not an analysis result"
        accent="#A8906E"
        delay={0.1}
      >
        <ArticleFingerprint fingerprint={EMPTY_FINGERPRINT} note="ANALYSIS NOT PERFORMED" />
      </Panel>

      {/* ─── Evidence Chain — INPUT → RETRIEVAL FAILED, stages disabled ─── */}
      <Panel
        icon={Link2}
        title="Evidence Chain"
        subtitle="Investigation stopped at retrieval"
        accent="#A85A50"
        delay={0.16}
      >
        <EvidenceChain
          verdict="uncertain"
          confidence={0}
          redFlags={[]}
          greenFlags={[]}
          triggeredKeywords={[]}
          categoryBreakdown={[]}
          retrievalFailed
          failureReason={reason}
        />
      </Panel>

      {/* ─── Investigation Replay — only the operations that actually occurred ─── */}
      <Panel
        icon={Play}
        title="Investigation Replay"
        subtitle="Trace of what actually happened"
        accent="#A85A50"
        delay={0.22}
      >
        <InvestigationReplay
          analysis={EMPTY_ANALYSIS}
          retrievalFailed
          failedUrl={failedUrl}
          failureReason={reason}
        />
      </Panel>
    </div>
  );
}
