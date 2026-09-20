"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Globe,
  User,
  Calendar,
  Building,
  BookOpen,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

/* ─── Types ─── */
export interface SourceProfileData {
  source: string;
  domain: string;
  author: string;
  publishedDate: string;
  updatedDate: string;
  sourceType: string;
  availableEvidence: string[];
  signals: Array<{ label: string; available: boolean }>;
}

interface SourceProfileProps {
  profile: SourceProfileData;
}

/**
 * Source credibility profile for an analyzed article.
 * Displays source metadata, signals, and available evidence.
 */
export function SourceProfile({ profile }: SourceProfileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="space-y-4">
      {/* Source metadata grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Globe, label: "SOURCE", value: profile.source },
          { icon: Building, label: "DOMAIN", value: profile.domain },
          { icon: User, label: "AUTHOR", value: profile.author },
          { icon: Calendar, label: "PUBLISHED", value: profile.publishedDate },
          { icon: Calendar, label: "UPDATED", value: profile.updatedDate },
          { icon: BookOpen, label: "TYPE", value: profile.sourceType },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="p-2.5 rounded-sm"
            style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon
                className="w-2.5 h-2.5"
                style={{ color: "#A8906E", opacity: 0.6 }}
              />
              <span
                className="text-[7px] font-bold tracking-[0.15em]"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#A8A098",
                }}
              >
                {item.label}
              </span>
            </div>
            <span
              className="text-[10px] font-semibold block leading-snug"
              style={{
                color: item.value === "NOT AVAILABLE" ? "#A8A098" : "#F5F0E8",
                opacity: item.value === "NOT AVAILABLE" ? 0.5 : 1,
                fontStyle: item.value === "NOT AVAILABLE" ? "italic" : "normal",
              }}
            >
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Source Signals */}
      <div>
        <p
          className="text-[8px] font-bold tracking-[0.15em] uppercase mb-2"
          style={{ color: "#A8906E" }}
        >
          Source Signals
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {profile.signals.map((signal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
              transition={{ delay: 0.2 + i * 0.04, duration: 0.25 }}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-sm"
              style={{ background: "#0A0A0A" }}
            >
              {signal.available ? (
                <CheckCircle2
                  className="w-2.5 h-2.5 shrink-0"
                  style={{ color: "#A8906E" }}
                />
              ) : (
                <HelpCircle
                  className="w-2.5 h-2.5 shrink-0"
                  style={{ color: "#A8A098", opacity: 0.4 }}
                />
              )}
              <span
                className="text-[9px]"
                style={{
                  color: signal.available ? "#A8A098" : "#A8A098",
                  opacity: signal.available ? 1 : 0.5,
                }}
              >
                {signal.available ? "✓" : "—"} {signal.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Available Evidence */}
      {profile.availableEvidence.length > 0 && (
        <div>
          <p
            className="text-[8px] font-bold tracking-[0.15em] uppercase mb-2"
            style={{ color: "#A8906E" }}
          >
            Available Evidence
          </p>
          <div className="space-y-1.5">
            {profile.availableEvidence.map((evidence, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.25 }}
                className="flex items-start gap-2 py-1"
              >
                <span
                  className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                  style={{ background: "#A8906E" }}
                />
                <span
                  className="text-[10px] leading-relaxed"
                  style={{ color: "#A8A098" }}
                >
                  {evidence}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
