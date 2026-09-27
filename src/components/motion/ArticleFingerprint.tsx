import { motion } from "framer-motion";

export interface FingerprintData {
  claims: number;
  /** UNIQUE sources (distinct retrieved URLs). */
  sources: number;
  /** CLAIM–SOURCE REFERENCES — one source cited by N claims counts N times. */
  sourceRefs?: number;
  verified: number;
  uncertain: number;
  contradicted: number;
  unverified: number;
  sourceCoverage: number;
  evidenceFound: number;
}

/**
 * Article Fingerprint as a compact typographic investigation summary —
 * serif numerals on hairline cells, status colours used only for meaning.
 * No analytics cards, no charts: typography and thin separators only.
 */
export function ArticleFingerprint({ fingerprint, note }: { fingerprint: FingerprintData; note?: string }) {
  const now = new Date();
  const dateStr = now.getDate() + " " + now.toLocaleString("en", { month: "short" }).toUpperCase() + " " + now.getFullYear();

  const cells = [
    { label: "Claims", value: String(fingerprint.claims), color: "#171716" },
    { label: "Unique sources", value: String(fingerprint.sources), color: "#171716" },
    { label: "Verified", value: String(fingerprint.verified), color: "#71836B" },
    { label: "Uncertain", value: String(fingerprint.uncertain), color: "#A9854D" },
    { label: "Contradicted", value: String(fingerprint.contradicted), color: "#A86155" },
    { label: "Unverified", value: String(fingerprint.unverified), color: "#6F6A61" },
    { label: "Source coverage", value: `${fingerprint.sourceCoverage}%`, color: "#171716", bar: fingerprint.sourceCoverage },
    { label: "Claim–source refs", value: fingerprint.sourceRefs != null ? String(fingerprint.sourceRefs) : "—", color: "#171716" },
    { label: "Evidence found", value: String(fingerprint.evidenceFound), color: "#171716" },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 border-t border-border">
        {cells.map((cell, i) => (
          <motion.div
            key={cell.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className={`px-3 sm:px-4 py-4 border-b border-border ${i % 3 !== 0 ? "border-l border-border" : ""}`}
          >
            <span
              className="block text-[24px] sm:text-[27px] leading-none tabular"
              style={{ fontFamily: "'DM Serif Display', serif", color: cell.color }}
            >
              {cell.value}
            </span>
            {cell.bar != null && (
              <span className="block h-[2px] mt-2 w-full" style={{ background: "#D8D0C3" }}>
                <motion.span
                  className="block h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${cell.bar}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{ background: "#596451" }}
                />
              </span>
            )}
            <span className="block kicker mt-2" style={{ opacity: 0.75 }}>{cell.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span className="kicker" style={{ opacity: 0.55 }}>{note ?? `Last updated ${dateStr}`}</span>
      </div>
    </div>
  );
}
