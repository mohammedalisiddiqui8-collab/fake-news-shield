/**
 * SINGLE SOURCE OF TRUTH for investigation source counting.
 *
 * Used by the analysis engine (convex/analyzeNews.ts) AND every frontend
 * section (Source Cross-Check, Evidence Map, Evidence Timeline,
 * Investigation Replay, Final Assessment), so all numbers agree by
 * construction:
 *
 *   UNIQUE SOURCES         = distinct retrieved URLs across all claims.
 *   CLAIM-SOURCE REFERENCES = one entry per (claim, retrieved source) pair —
 *     the aggregate ALWAYS equals the sum of the per-claim reference counts.
 *
 * Sentinel notices ("NO INDEPENDENT CORROBORATION FOUND",
 * "SOURCE SEARCH UNAVAILABLE") carry no URL: they are honest notices, never
 * sources, and are never counted as sources or references.
 */

export interface CrossCheckSourceLike {
  name: string;
  relationship: string;
  url?: string;
}

export interface CrossCheckClaimLike {
  claimId: number;
  sources: CrossCheckSourceLike[];
}

/** Real retrieved sources only, flattened across all cross-checked claims. */
export function retrievedSources(
  crossCheck?: CrossCheckClaimLike[] | null,
): CrossCheckSourceLike[] {
  return (crossCheck ?? []).flatMap((c) => c.sources).filter((s) => !!s.url);
}

/** Claim-source references for ONE claim — same rule as the aggregate. */
export function claimSourceRefs(
  sources?: CrossCheckSourceLike[] | null,
): number {
  return (sources ?? []).filter((s) => !!s.url).length;
}

export interface SourceCounts {
  /** All real retrieved source entries (claim-source references). */
  retrieved: CrossCheckSourceLike[];
  /** Distinct external sources (unique URLs). */
  uniqueSources: number;
  /** Sum over claims of claimSourceRefs(sources) — always equal by construction. */
  claimSourceRefs: number;
  supporting: number;
  contradicting: number;
  partial: number;
}

/** Derive every source count from one crossCheck array. */
export function deriveSourceCounts(
  crossCheck?: CrossCheckClaimLike[] | null,
): SourceCounts {
  const retrieved = retrievedSources(crossCheck);
  return {
    retrieved,
    uniqueSources: new Set(retrieved.map((s) => s.url as string)).size,
    claimSourceRefs: retrieved.length,
    supporting: retrieved.filter((s) => s.relationship === "supports").length,
    contradicting: retrieved.filter((s) => s.relationship === "contradicts").length,
    partial: retrieved.filter((s) => s.relationship === "partial").length,
  };
}
