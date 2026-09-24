import { motion } from "framer-motion";
import { Fingerprint, Link2, Shield, CheckCircle2, HelpCircle, XCircle, AlertTriangle } from "lucide-react";

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

const statCards = [
  { key: "claims" as const, label: "CLAIMS", icon: Fingerprint, color: "#F5F0E8" },
  { key: "sources" as const, label: "UNIQUE SOURCES", icon: Link2, color: "#F5F0E8" },
  { key: "verified" as const, label: "VERIFIED", icon: CheckCircle2, color: "#D4C4A8" },
  { key: "uncertain" as const, label: "UNCERTAIN", icon: HelpCircle, color: "#A8A098" },
  { key: "contradicted" as const, label: "CONTRADICTED", icon: XCircle, color: "#A85A50" },
  { key: "unverified" as const, label: "UNVERIFIED", icon: AlertTriangle, color: "#A8A098" },
];

export function ArticleFingerprint({ fingerprint }: { fingerprint: FingerprintData }) {
  const now = new Date();
  const dateStr = now.getDate() + " " + now.toLocaleString("en", { month: "short" }).toUpperCase() + " " + now.getFullYear();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {statCards.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="p-2.5 rounded"
            style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}
          >
            <span className="text-[8px] tracking-[0.15em] uppercase font-semibold block mb-1" style={{ color: "#A8A098" }}>
              {s.label}
            </span>
            <span
              className="text-[18px] font-bold block leading-none"
              style={{ color: s.color, fontFamily: "'DM Serif Display', serif" }}
            >
              {fingerprint[s.key]}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.24 }}
          className="flex-1 p-2.5 rounded" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}>
          <span className="text-[8px] tracking-[0.15em] uppercase font-semibold block mb-1" style={{ color: "#A8A098" }}>SOURCE COVERAGE</span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold" style={{ color: "#F5F0E8", fontFamily: "'DM Serif Display', serif" }}>{fingerprint.sourceCoverage}%</span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#1E1E1E" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: fingerprint.sourceCoverage + "%" }}
                transition={{ duration: 0.6, delay: 0.3 }} className="h-full rounded-full" style={{ background: "#A8906E" }} />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.26 }}
          className="flex-1 p-2.5 rounded" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}>
          <span className="text-[8px] tracking-[0.15em] uppercase font-semibold block mb-1" style={{ color: "#A8A098" }}>CLAIM-SOURCE REFS</span>
          <span className="text-[14px] font-bold" style={{ color: "#F5F0E8", fontFamily: "'DM Serif Display', serif" }}>{fingerprint.sourceRefs ?? "—"}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.26 }}
          className="flex-1 p-2.5 rounded" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}>
          <span className="text-[8px] tracking-[0.15em] uppercase font-semibold block mb-1" style={{ color: "#A8A098" }}>EVIDENCE FOUND</span>
          <span className="text-[14px] font-bold" style={{ color: "#F5F0E8", fontFamily: "'DM Serif Display', serif" }}>{fingerprint.evidenceFound}</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-1.5 pt-1" style={{ borderTop: "1px solid #1E1E1E" }}>
        <Shield className="w-2.5 h-2.5" style={{ color: "#A8906E" }} />
        <span className="text-[8px] tracking-[0.1em] uppercase" style={{ color: "#A8A098" }}>LAST UPDATED {dateStr}</span>
      </div>
    </div>
  );
}
