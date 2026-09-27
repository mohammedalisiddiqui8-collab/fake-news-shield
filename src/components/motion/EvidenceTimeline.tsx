"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FileSearch,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  AlertTriangle,
  Brain,
} from "lucide-react";

/* ─── Types ─── */
export interface TimelineEvent {
  id: number;
  type: "claim_identified" | "source_found" | "source_searched" | "corroboration" | "contradiction" | "linguistic_analysis" | "assessment";
  title: string;
  detail: string;
  source?: string;
  timestamp?: string;
}

interface EvidenceTimelineProps {
  events: TimelineEvent[];
}

/* ─── Event Config — status colour carries meaning, nothing else ─── */
const eventConfig: Record<
  TimelineEvent["type"],
  { icon: typeof FileSearch; color: string; label: string }
> = {
  claim_identified: {
    icon: FileSearch,
    color: "#596451",
    label: "CLAIM IDENTIFIED",
  },
  source_found: {
    icon: Search,
    color: "#596451",
    label: "SOURCE FOUND",
  },
  source_searched: {
    icon: Search,
    color: "#596451",
    label: "SOURCE SEARCH",
  },
  corroboration: {
    icon: CheckCircle2,
    color: "#71836B",
    label: "CORROBORATION",
  },
  contradiction: {
    icon: XCircle,
    color: "#A86155",
    label: "CONTRADICTION",
  },
  linguistic_analysis: {
    icon: Brain,
    color: "#6F6A61",
    label: "LINGUISTIC ANALYSIS",
  },
  assessment: {
    icon: Shield,
    color: "#A9854D",
    label: "ASSESSMENT",
  },
};

/**
 * Chronological investigation timeline — editorial numbering, a thin
 * vertical rule and small mono markers. Reads like the process log of a
 * published investigation, not a software workflow diagram.
 */
export function EvidenceTimeline({ events }: EvidenceTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-40px" });

  if (events.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-[10px]" style={{ color: "#6F6A61" }}>
          Insufficient evidence to construct a timeline.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {events.map((event, i) => {
        const config = eventConfig[event.type];
        const isLast = i === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            {/* Numbered marker + thin connecting rule */}
            <div className="flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="w-7 shrink-0 text-center text-[9px] tracking-[0.12em] leading-none pt-[3px]"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: config.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </motion.span>

              {!isLast && (
                <div className="relative w-px flex-1 min-h-[26px]">
                  <div className="absolute inset-0" style={{ background: "#D8D0C3" }} />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={inView ? { height: "100%" } : { height: 0 }}
                    transition={{
                      delay: i * 0.12 + 0.15,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute top-0 left-0 w-full"
                    style={{ background: config.color, opacity: 0.4 }}
                  />
                </div>
              )}
            </div>

            {/* Event entry */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{
                delay: i * 0.12 + 0.05,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-1 min-w-0 pb-7 last:pb-1"
            >
              <div className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-1">
                <span
                  className="text-[9px] tracking-[0.22em] uppercase"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: config.color,
                  }}
                >
                  {config.label}
                </span>
                {event.timestamp && (
                  <span
                    className="text-[8px] tracking-[0.14em] tabular shrink-0 uppercase"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6F6A61", opacity: 0.7 }}
                  >
                    {event.timestamp}
                  </span>
                )}
              </div>

              <p
                className="mt-2 text-[13px] leading-snug"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#171716" }}
              >
                {event.title}
              </p>

              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#6F6A61" }}>
                {event.detail}
              </p>

              {event.source && (
                <p className="mt-1.5 text-[9px] tracking-[0.14em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ color: "#6F6A61", opacity: 0.75 }}>Source · </span>
                  <span style={{ color: "#596451" }}>{event.source}</span>
                </p>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
