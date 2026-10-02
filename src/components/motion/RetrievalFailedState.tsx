import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, ClipboardPaste, Fingerprint, Link2, Play, FileText, Globe } from "lucide-react";
import { ArticleFingerprint, type FingerprintData } from "./ArticleFingerprint";
import { EvidenceChain } from "./EvidenceChain";
import { InvestigationReplay } from "./InvestigationReplay";
import { SourceProfile, type SourceProfileData } from "./SourceProfile";

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
  /** Platform whose own restrictions blocked retrieval (e.g. "instagram"). */
  failedPlatform?: string;
  /** The submission WAS a URL — never submitted article text. */
  inputType?: "url" | "text";
  /** Only genuinely identified facts (domain, platform kind) are shown. */
  sourceProfile?: SourceProfileData;
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
      className="mb-3 overflow-hidden"
      style={{ background: "#252629", border: "1px solid #3A3B3E" }}
    >
      <div className="px-4 sm:px-5 pt-4 pb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          <h3
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "#F1F0EA" }}
          >
            {title}
          </h3>
        </div>
        <p className="text-[9px]" style={{ color: "#A5A5A1" }}>
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
  failedPlatform,
  inputType,
  sourceProfile,
  onRetry,
  onPasteText,
}: RetrievalFailedStateProps) {
  const reason =
    failureReason || "URL could not be accessed or article content could not be retrieved.";
  // Wording only — a valid Instagram URL is a retrieval limit of that platform,
  // never an invalid URL.
  const isInstagram = failedPlatform === "instagram";
  const headline = isInstagram
    ? "Could not retrieve content from this Instagram post."
    : "Could not retrieve article content from the provided URL.";
  const platformLabel = isInstagram ? "Instagram" : undefined;

  return (
    <div>
      {/* ─── Header: UNABLE TO ANALYZE — verdict RETRIEVAL FAILED, confidence — ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="glass-card p-5 sm:p-7 mb-4"
        style={{ border: "1px solid rgba(176,132,121,0.25)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="w-14 h-14 rounded flex items-center justify-center shrink-0"
            style={{ background: "rgba(176,132,121,0.08)", border: "1px solid rgba(176,132,121,0.25)" }}
          >
            <AlertTriangle className="w-6 h-6" style={{ color: "#B08479" }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mb-1">
              Investigation
            </p>
            <h2
              className="text-lg sm:text-xl font-bold mb-2"
              style={{ fontFamily: "'DM Serif Display', serif", color: "#F1F0EA" }}
            >
              UNABLE TO ANALYZE
            </h2>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-2">
              <span
                className="text-[8px] font-bold tracking-[0.1em] px-1.5 py-0.5"
                style={{ background: "rgba(176,132,121,0.15)", color: "#B08479", borderRadius: "1px" }}
              >
                RETRIEVAL FAILED
              </span>
              <span
                className="text-[9px] font-mono tracking-wider"
                style={{ color: "#A5A5A1" }}
              >
                CONFIDENCE —
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {headline}
            </p>
            <p className="text-[11px] leading-relaxed mt-1" style={{ color: "#A5A5A1" }}>
              Reason: {reason}
            </p>
            {failedUrl && (
              <p
                className="text-[9px] font-mono mt-1 break-all"
                style={{ color: "#A5A5A1", opacity: 0.7 }}
              >
                {inputType === "url" ? "URL" : "Input type: URL"} {failedUrl}
              </p>
            )}
            <p className="text-[11px] font-semibold mt-2" style={{ color: "#B08479" }}>
              No factual verification was performed.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 mt-5">
          <button
            type="button"
            className="cursor-pointer flex items-center justify-center gap-2 h-9 px-5 text-xs font-medium rounded transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.98]"
            style={{ background: "#C9C3B7", color: "#151618" }}
            onClick={onRetry}
          >
            <RotateCcw className="w-3.5 h-3.5" />Try Again
          </button>
          <button
            type="button"
            className="cursor-pointer flex items-center justify-center gap-2 h-9 px-5 text-xs font-medium rounded transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.98]"
            style={{ background: "#252629", color: "#F1F0EA", border: "1px solid #3A3B3E" }}
            onClick={onPasteText}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />Paste Article Text
          </button>
        </div>
      </motion.div>

      {/* ─── Article Fingerprint — no fingerprint exists, never zeros as a result ─── */}
      <Panel
        icon={Fingerprint}
        title="Article Fingerprint"
        subtitle="Retrieval never returned content, so no fingerprint was produced"
        accent="#C9C3B7"
        delay={0.1}
      >
        <ArticleFingerprint
          fingerprint={EMPTY_FINGERPRINT}
          note="RETRIEVAL UNAVAILABLE — ANALYSIS NOT PERFORMED"
          available={false}
        />
      </Panel>

      {/* ─── Content not retrieved — the URL is never shown as article text ─── */}
      <Panel
        icon={FileText}
        title="Content Not Retrieved"
        subtitle="No article text was available for analysis"
        accent="#B08479"
        delay={0.13}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: "#A5A5A1" }}>
          {isInstagram
            ? "The Instagram post could not be retrieved for analysis."
            : "The article content could not be retrieved for analysis."}{" "}
          The submitted URL is a source address, not article text: it was not
          analysed, and no words of it were counted as content.
        </p>
      </Panel>

      {/* ─── Source Profile — only what is genuinely known about the source ─── */}
      {sourceProfile && (
        <Panel
          icon={Globe}
          title="Source Profile"
          subtitle="Known from the submitted URL; nothing inferred"
          accent="#C9C3B7"
          delay={0.16}
        >
          <SourceProfile profile={sourceProfile} />
        </Panel>
      )}

      {/* ─── Evidence Chain — INPUT → RETRIEVAL FAILED, stages disabled ─── */}
      <Panel
        icon={Link2}
        title="Evidence Chain"
        subtitle="Investigation stopped at retrieval"
        accent="#B08479"
        delay={0.19}
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
        accent="#B08479"
        delay={0.22}
      >
        <InvestigationReplay
          analysis={EMPTY_ANALYSIS}
          retrievalFailed
          failedUrl={failedUrl}
          failureReason={reason}
          detailedFailure={isInstagram}
          platformLabel={platformLabel}
        />
      </Panel>
    </div>
  );
}
