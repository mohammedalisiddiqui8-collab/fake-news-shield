import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Plus } from "lucide-react";
import type { CrossCheckSource } from "@/components/motion/SourceCrossCheck";

/**
 * The source trail — every source the investigation touched, read the way a
 * researcher logs them: where it came from, when it was published, how it
 * stands relative to the claim, and — on expansion — the passage that earned
 * that marking.
 *
 * Presented as a ledger of hairline rows. Each row expands to reveal its
 * evidence; nothing is shown that the investigation did not itself return.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const REL: Record<string, { label: string; color: string }> = {
  supports: { label: "SUPPORTS", color: "#8A9A82" },
  contradicts: { label: "CONTRADICTS", color: "#B08479" },
  partial: { label: "PARTIAL", color: "#B0A183" },
  does_not_address: { label: "NOT ADDRESSED", color: "#A5A5A1" },
  unverified: { label: "UNVERIFIED", color: "#A5A5A1" },
  insufficient: { label: "INSUFFICIENT", color: "#A5A5A1" },
};

export function SourceTrail({
  sources,
}: {
  /** Flat trail across all cross-checked claims, in retrieval order. */
  sources: Array<CrossCheckSource & { claimId: number; claimText: string }>;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (sources.length === 0) {
    return (
      <p className="py-2 text-[11px] italic text-muted-foreground">
        No source trail — no independent source was retrieved for this claim.
      </p>
    );
  }

  return (
    <div>
      {/* Ledger header — the collapsed columns */}
      <div className="hidden items-baseline gap-4 border-b border-border pb-1.5 sm:flex">
        <span className="kicker w-28 shrink-0" style={{ opacity: 0.45 }}>Source</span>
        <span className="kicker w-24 shrink-0" style={{ opacity: 0.45 }}>Date</span>
        <span className="kicker w-28 shrink-0" style={{ opacity: 0.45 }}>Relationship</span>
        <span className="kicker flex-1" style={{ opacity: 0.45 }}>Claim</span>
        <span className="w-5 shrink-0" />
      </div>

      <div className="border-t border-border">
        {sources.map((src, i) => {
          const key = `${src.claimId}-${i}`;
          const isOpen = openKey === key;
          const rel = REL[src.relationship] ?? REL.insufficient;
          const domain = (() => {
            if (!src.url) return null;
            try {
              return new URL(src.url).hostname.replace(/^www\./, "");
            } catch {
              return null;
            }
          })();

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-4%" }}
              transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04, ease: EASE }}
              className="border-b border-border/70"
            >
              {/* ── The collapsed ledger row — tap to open its evidence ── */}
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                aria-expanded={isOpen}
                className="group flex w-full flex-col gap-1.5 py-3.5 text-left min-h-[44px] sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="min-w-0 sm:w-28 sm:shrink-0">
                  <span className="block truncate text-[12px] font-medium" style={{ color: "#F1F0EA" }}>
                    {src.name}
                  </span>
                  {domain && domain !== src.name && (
                    <span className="kicker block truncate" style={{ opacity: 0.55 }}>{domain}</span>
                  )}
                </span>

                <span className="kicker tabular sm:w-24 sm:shrink-0" style={{ opacity: 0.75 }}>
                  {src.date !== "N/A" ? src.date : "—"}
                </span>

                <span className="flex items-center gap-1.5 sm:w-28 sm:shrink-0">
                  <span className="block h-[6px] w-[6px] shrink-0" style={{ background: rel.color }} aria-hidden="true" />
                  <span className="text-[8.5px] font-semibold tracking-[0.16em]" style={{ color: rel.color }}>
                    {rel.label}
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="kicker truncate sm:hidden" style={{ opacity: 0.45 }}>
                    Claim {String(src.claimId).padStart(2, "0")}
                  </span>
                  <span className="hidden truncate text-[11.5px] sm:block" style={{ color: "#A5A5A1" }}>
                    Claim {String(src.claimId).padStart(2, "0")} · {src.claimText}
                  </span>
                </span>

                {/* The expansion mark — a hairline plus, rotating to close */}
                <span className="w-5 shrink-0 self-end sm:self-auto">
                  <motion.span
                    className="inline-flex items-center justify-center"
                    initial={false}
                    animate={{ rotate: isOpen ? 45 : 0, opacity: isOpen ? 1 : 0.45 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <Plus className="h-3 w-3" style={{ color: "#C9C3B7" }} />
                  </motion.span>
                </span>
              </button>

              {/* ── The evidence, revealed ── */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="evidence"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mb-4 ml-0 border-l pl-4 sm:ml-32 sm:pl-5"
                      style={{ borderColor: rel.color }}
                    >
                      <p className="kicker" style={{ opacity: 0.5 }}>Evidence · {rel.label.toLowerCase()}</p>
                      <p
                        className="mt-2 text-[12px] leading-snug"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#F1F0EA" }}
                      >
                        {src.headline}
                      </p>
                      {src.excerpt && (
                        <p className="mt-1.5 max-w-[70ch] text-[10.5px] leading-relaxed" style={{ color: "#A5A5A1" }}>
                          {src.excerpt}
                        </p>
                      )}
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ul-hover mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em]"
                          style={{ color: "#C9C3B7" }}
                        >
                          Read the source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground" style={{ opacity: 0.75 }}>
        Open a row to read the passage behind its marking. Every entry is a source the investigation
        actually retrieved — the trail is the record.
      </p>
    </div>
  );
}
