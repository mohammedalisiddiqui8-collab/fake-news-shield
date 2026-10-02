import { useState } from "react";import { motion } from "framer-motion";

/**
 * The investigation as a diagram — what supports a claim, what contradicts
 * it, and how the verdict was reached. Research-drawer presentation:
 * hairlines, small capitals, no neon.
 *
 * Relationships are drawn as animated connections: opening a claim draws the
 * line from the claim to each of its sources and animates their markers in
 * sequence, so the wiring of the investigation is the thing you see.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const REL_LABEL: Record<string, string> = {
  supports: "SUPPORTS",
  contradicts: "CONTRADICTS",
  partial: "PARTIAL",
  does_not_address: "NOT ADDRESSED",
  unverified: "UNVERIFIED",
  insufficient: "INSUFFICIENT",
};

const REL_COLOR: Record<string, string> = {
  supports: "#8FA58A",
  contradicts: "#B3263E",
  partial: "#B7A47A",
  does_not_address: "#A6A39B",
  unverified: "#A6A39B",
  insufficient: "#A6A39B",
};

function statusColor(status?: string) {
  if (status === "supported") return "#8FA58A";
  if (status === "contradicted") return "#B3263E";
  return "#B7A47A";
}

function StatusMark({ status }: { status?: string }) {
  return (
    <span
      className="block h-[6px] w-[6px] shrink-0"
      style={{ background: statusColor(status) }}
      aria-hidden="true"
    />
  );
}

export function EvidenceMap({
  articleTitle,
  claims,
  verdict,
  confidence,
}: {
  articleTitle: string;
  claims: Array<{
    id: number;
    text: string;
    status: string;
    sources: Array<{ name: string; relationship: string }>;
  }>;
  verdict: string;
  confidence: number;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const verdictColor =
    verdict === "likely_real" ? "#8FA58A" : verdict === "likely_fake" ? "#B3263E" : "#B7A47A";

  // While one claim is open it holds the reader's attention: every other
  // claim quiets down so its connections read clearly. No claim is ever
  // removed — the whole map stays visible.
  const focusing = openId !== null;

  // No investigation data — an honest empty state, never a filled-in one.
  if (!claims || claims.length === 0) {
    return (
      <div className="border border-border/70 px-5 py-8">
        <p className="kicker" style={{ opacity: 0.5 }}>Evidence map</p>
        <p
          className="mt-3 text-[13px] leading-[1.8] text-muted-foreground"
          style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
        >
          No claims were extracted for this investigation, so there is nothing to map. Run an
          investigation on an article and the claim → source connections appear here, drawn from
          what was actually retrieved.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Column headers — a research drawer, not a tree widget ── */}
      <div className="hidden items-baseline gap-4 border-b pb-1.5 sm:flex">
        <span className="kicker w-6 shrink-0" style={{ opacity: 0.45 }}>No.</span>
        <span className="kicker flex-1" style={{ opacity: 0.45 }}>Claim</span>
        <span className="kicker w-28 shrink-0 text-right" style={{ opacity: 0.45 }}>Status</span>
        <span className="hidden w-8 shrink-0" />
      </div>

      <div className="border-t border-border">
        {claims.map((claim, ci) => {
          const isOpen = openId === claim.id;
          return (
            <motion.div
              key={claim.id}
              className="border-b border-border"
              initial={false}
              animate={{ opacity: focusing && !isOpen ? 0.45 : 1 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* ── Claim row ── */}
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : claim.id)}
                aria-expanded={isOpen}
                className="group flex w-full items-baseline gap-4 px-1 py-3.5 text-left row-hover"
              >
                <span className="num-marker w-6 shrink-0 pt-[2px]" style={{ opacity: isOpen ? 1 : 0.6 }}>
                  {String(ci + 1).padStart(2, "0")}
                </span>
                <span
                  className="flex-1 min-w-0 text-[12.5px] leading-snug"
                  style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#F1F0EA" }}
                >
                  {claim.text}
                </span>
                <span
                  className="hidden w-28 shrink-0 items-center justify-end gap-2 sm:flex"
                >
                  <StatusMark status={claim.status} />
                  <span
                    className="text-[9px] font-semibold tracking-[0.16em]"
                    style={{ color: statusColor(claim.status) }}
                  >
                    {claim.status === "supported"
                      ? "SUPPORTED"
                      : claim.status === "contradicted"
                        ? "CONTRADICTED"
                        : "UNCERTAIN"}
                  </span>
                </span>
                {/* The connector tick — shows how many sources hang off this claim */}
                <span className="hidden w-8 shrink-0 items-center justify-end sm:flex">
                  <span className="kicker tabular" style={{ opacity: isOpen ? 0.9 : 0.45 }}>
                    {claim.sources.length}
                  </span>
                </span>
              </button>

              {/* ── The connections, drawn when the claim opens ── */}
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="relative pb-5 pl-10 pr-1 sm:pl-12">
                  {/* The vertical rail from the claim down to its sources */}
                  <motion.span
                    className="absolute left-[13px] top-0 w-px sm:left-[17px]"
                    style={{ background: "#242424" }}
                    initial={{ height: 0 }}
                    animate={{ height: isOpen ? "100%" : 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    aria-hidden="true"
                  />

                  {claim.sources.length === 0 ? (
                    <p className="py-2 text-[11px] italic text-muted-foreground">
                      No source was retrieved for this claim — it remains unverified.
                    </p>
                  ) : (
                    <ul>
                      {claim.sources.map((src, si) => {
                        const tone = REL_COLOR[src.relationship] ?? "#A6A39B";
                        return (
                          <motion.li
                            key={si}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: 0.08 + si * 0.06, ease: EASE }}
                            className="relative flex items-baseline gap-3 py-2"
                          >
                            {/* The horizontal connector from the rail to this source */}
                            <span
                              className="absolute -left-3 top-[13px] h-px w-3 sm:-left-5"
                              style={{ background: "#242424" }}
                              aria-hidden="true"
                            />
                            <span
                              className="block h-[6px] w-[6px] shrink-0 translate-y-[-1px]"
                              style={{ background: tone }}
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                                <span className="text-[12px] font-medium" style={{ color: "#F1F0EA" }}>
                                  {src.name}
                                </span>
                                <span
                                  className="text-[8.5px] font-semibold tracking-[0.16em]"
                                  style={{ color: tone }}
                                >
                                  {REL_LABEL[src.relationship] ?? src.relationship.toUpperCase()}
                                </span>
                              </span>
                            </span>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── The verdict node, where every path ends ── */}
      <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-border pt-5">
        <span className="kicker" style={{ opacity: 0.5 }}>Assessment</span>
        <span className="flex items-center gap-2.5">
          <span className="block h-[7px] w-[7px]" style={{ background: verdictColor }} aria-hidden="true" />
          <span
            className="text-[16px] leading-none tracking-[0.03em]"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif", color: "#F1F0EA" }}
          >
            {verdict.replace(/_/g, " ")}
          </span>
        </span>
        <span className="kicker tabular ml-auto" style={{ color: verdictColor }}>
          {confidence}% confidence
        </span>
      </div>
      <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground" style={{ opacity: 0.75 }}>
        Open a claim to see the sources the investigation connected to it and how each one was read.
      </p>
    </div>
  );
}
