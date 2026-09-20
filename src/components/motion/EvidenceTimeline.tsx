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
} from "lucide-react";

/* ─── Types ─── */
export interface TimelineEvent {
  id: number;
  type: "claim_identified" | "source_found" | "corroboration" | "contradiction" | "assessment";
  title: string;
  detail: string;
  source?: string;
  timestamp?: string;
}

interface EvidenceTimelineProps {
  events: TimelineEvent[];
}

/* ─── Event Config ─── */
const eventConfig: Record<
  TimelineEvent["type"],
  { icon: typeof FileSearch; color: string; label: string }
> = {
  claim_identified: {
    icon: FileSearch,
    color: "#A8906E",
    label: "CLAIM IDENTIFIED",
  },
  source_found: {
    icon: Search,
    color: "#A8906E",
    label: "SOURCE FOUND",
  },
  corroboration: {
    icon: CheckCircle2,
    color: "#A8906E",
    label: "CORROBORATION",
  },
  contradiction: {
    icon: XCircle,
    color: "#A85A50",
    label: "CONTRADICTION",
  },
  assessment: {
    icon: Shield,
    color: "#8A6A45",
    label: "ASSESSMENT",
  },
};

/**
 * Chronological evidence timeline showing the verification process.
 * Each node connects via a thin vertical line with staggered reveal animation.
 */
export function EvidenceTimeline({ events }: EvidenceTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-40px" });

  if (events.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-[10px]" style={{ color: "#A8A098" }}>
          Insufficient evidence to construct a timeline.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {events.map((event, i) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;
        const isLast = i === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            {/* Vertical line + node */}
            <div className="flex flex-col items-center">
              {/* Node */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  inView
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0, opacity: 0 }
                }
                transition={{
                  delay: i * 0.12,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0 z-10"
                style={{
                  background: `${config.color}12`,
                  border: `1px solid ${config.color}30`,
                }}
              >
                <Icon className="w-3 h-3" style={{ color: config.color }} />
              </motion.div>

              {/* Connecting line */}
              {!isLast && (
                <div className="relative w-px flex-1 min-h-[20px]">
                  <div className="absolute inset-0" style={{ background: "#1E1E1E" }} />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={inView ? { height: "100%" } : { height: 0 }}
                    transition={{
                      delay: i * 0.12 + 0.15,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute top-0 left-0 w-full"
                    style={{ background: `${config.color}30` }}
                  />
                </div>
              )}
            </div>

            {/* Event content */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={
                inView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -8 }
              }
              transition={{
                delay: i * 0.12 + 0.05,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-1 pb-4"
            >
              {/* Type label */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[7px] font-bold tracking-[0.2em]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: config.color,
                  }}
                >
                  {config.label}
                </span>
                {event.timestamp && (
                  <span
                    className="text-[7px]"
                    style={{ color: "#A8A098", opacity: 0.5 }}
                  >
                    {event.timestamp}
                  </span>
                )}
              </div>

              {/* Title */}
              <p
                className="text-[11px] font-semibold mb-0.5"
                style={{ color: "#F5F0E8" }}
              >
                {event.title}
              </p>

              {/* Detail */}
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: "#A8A098" }}
              >
                {event.detail}
              </p>

              {/* Source */}
              {event.source && (
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className="text-[8px]"
                    style={{ color: "#A8A098", opacity: 0.5 }}
                  >
                    Source:
                  </span>
                  <span
                    className="text-[8px]"
                    style={{ color: "#A8906E" }}
                  >
                    {event.source}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
