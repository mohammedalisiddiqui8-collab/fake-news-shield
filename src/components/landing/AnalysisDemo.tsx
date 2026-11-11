import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CircleDashed, Minus, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   ANALYSIS DEMO — a sample dossier going through the pipeline.

   This is not a screenshot and not a claim about the live system's output:
   it is an explicitly labelled illustration of the reading experience.
   A scan passes down the exhibit, three claims are checked in order, and
   the coverage meter fills as each one resolves. The loop pauses the
   moment the panel leaves the viewport or the tab is hidden, and reduced
   motion is served the settled final frame instead of the performance.
   ═══════════════════════════════════════════════════════════════════════ */

type Tone = "green" | "brass" | "crimson";

const CLAIMS: Array<{
  id: string;
  text: string;
  verdict: string;
  note: string;
  tone: Tone;
}> = [
  {
    id: "C1",
    text: "The pilot will serve fourteen stations.",
    verdict: "Supported",
    note: "Matches the published route filing.",
    tone: "green",
  },
  {
    id: "C2",
    text: "Ridership will double within six months.",
    verdict: "Uncertain",
    note: "No projection appears in the primary record.",
    tone: "brass",
  },
  {
    id: "C3",
    text: "The scheme was approved unanimously.",
    verdict: "Contradicted",
    note: "Minutes record six for, three against.",
    tone: "crimson",
  },
];

const TONE: Record<Tone, { dot: string; text: string; border: string }> = {
  green: { dot: "bg-[#6FAF78]", text: "text-[#8FC796]", border: "border-[#6FAF78]/35" },
  brass: { dot: "bg-[#B7A47A]", text: "text-[#CBBB97]", border: "border-[#B7A47A]/35" },
  crimson: { dot: "bg-[#B3263E]", text: "text-[#D06A7B]", border: "border-[#B3263E]/40" },
};

const GAUGE = [9, 27, 46, 58, 66, 66];
const BARS = [
  { label: "Primary record", values: [0, 62, 78, 78, 78, 78] },
  { label: "Wire coverage", values: [0, 22, 41, 46, 46, 46] },
  { label: "Social relay", values: [0, 4, 11, 12, 12, 12] },
];

function claimState(index: number, step: number): "pending" | "checking" | "done" {
  if (step <= index) return "pending";
  if (step === index + 1) return "checking";
  return "done";
}

function Gauge({ value }: { value: number }) {
  const rad = 76;
  return (
    <div className="relative">
      <svg viewBox="0 0 200 118" className="w-full" role="img" aria-label={`Source coverage ${value}%`}>
        <path
          d={`M 24 104 A ${rad} ${rad} 0 0 1 176 104`}
          fill="none"
          stroke="#F1F0EA"
          strokeOpacity="0.12"
          strokeWidth="1.5"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = Math.PI * (1 - t);
          const x1 = 100 + Math.cos(a) * (rad - 9);
          const y1 = 104 - Math.sin(a) * (rad - 9);
          const x2 = 100 + Math.cos(a) * (rad + 4);
          const y2 = 104 - Math.sin(a) * (rad + 4);
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#F1F0EA"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
          );
        })}
        <motion.path
          d={`M 24 104 A ${rad} ${rad} 0 0 1 176 104`}
          fill="none"
          stroke="#F1F0EA"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <text
          x="100"
          y="86"
          textAnchor="middle"
          fill="#F1F0EA"
          fontFamily="'Bodoni Moda', Georgia, serif"
          fontSize="34"
          fontWeight="600"
        >
          {value}
          <tspan fontSize="15" fillOpacity="0.6">
            %
          </tspan>
        </text>
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fill="#F1F0EA"
          fillOpacity="0.45"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="7"
          letterSpacing="2"
        >
          SOURCE COVERAGE
        </text>
      </svg>
    </div>
  );
}

function Status({ state, claim }: { state: "pending" | "checking" | "done"; claim: (typeof CLAIMS)[number] }) {
  const reduce = useReducedMotion();
  const tone = TONE[claim.tone];
  return (
    <span className="flex min-h-5 items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em]">
      <AnimatePresence mode="wait" initial={false}>
        {state === "pending" && (
          <motion.span
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-[#F1F0EA]/30"
          >
            <CircleDashed size={10} strokeWidth={1.5} /> queued
          </motion.span>
        )}
        {state === "checking" && (
          <motion.span
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-[#B7A47A]"
          >
            <motion.span
              className="inline-block h-2 w-2 rounded-full border border-current border-t-transparent"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />
            checking
          </motion.span>
        )}
        {state === "done" && (
          <motion.span
            key="done"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-1.5 ${tone.text}`}
          >
            {claim.tone === "crimson" ? (
              <ShieldAlert size={10} strokeWidth={1.8} />
            ) : claim.tone === "brass" ? (
              <Minus size={10} strokeWidth={2} />
            ) : (
              <Check size={10} strokeWidth={2} />
            )}
            {claim.verdict}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default function AnalysisDemo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(reduce ? 5 : 0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) {
      setStep(5);
      return;
    }
    if (!inView) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setStep((s) => (s + 1) % 7);
    }, 1500);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const phase = Math.min(step, 5);
  const coverage = GAUGE[phase];
  const resolved = CLAIMS.filter((_, i) => claimState(i, phase) === "done").length;

  return (
    <div
      ref={ref}
      className="relative border border-[#F1F0EA]/15 bg-[#0B0B0A] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)]"
    >
      {/* registration marks — the panel reads as a plate, not an app card */}
      {[
        "left-2 top-2 border-l border-t",
        "right-2 top-2 border-r border-t",
        "left-2 bottom-2 border-b border-l",
        "right-2 bottom-2 border-b border-r",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`pointer-events-none absolute h-2.5 w-2.5 border-[#F1F0EA]/35 ${pos}`}
        />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F0EA]/10 px-5 py-3">
        <div className="flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#F1F0EA]/55">
          <span className="flex items-center gap-2 text-[#F1F0EA]/80">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B7A47A]/60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#B7A47A]" />
            </span>
            Case 0417
          </span>
          <span className="h-3 w-px bg-[#F1F0EA]/15" />
          <span>Sample dossier</span>
        </div>
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#F1F0EA]/35">
          Illustrative — not a live verdict
        </span>
      </div>

      <div className="grid md:grid-cols-[1.25fr_1fr]">
        {/* ── the exhibit ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden border-b border-[#F1F0EA]/10 p-5 sm:p-7 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#F1F0EA]/40">
            <span>Exhibit A · news article</span>
            <span className="hidden sm:inline">Scanning 00:0{Math.min(phase, 9)}</span>
          </div>

          <h3 className="mt-6 max-w-[26ch] font-masthead text-[1.65rem] leading-[1.12] tracking-[-0.01em] text-[#F1F0EA] sm:text-[1.95rem]">
            Transit authority approves night-bus pilot across the eastern corridor
          </h3>
          <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#F1F0EA]/35">
            Sample text written for demonstration
          </p>

          <div className="relative mt-6 space-y-4 text-[0.83rem] leading-[1.75] text-[#F1F0EA]/60">
            <p>
              The regional transport board voted on Tuesday to fund a six-month night-bus pilot,
              extending service on four existing routes and{" "}
              <Mark active={phase >= 1} tone="green">
                adding fourteen new stops across the eastern corridor
              </Mark>
              . The pilot begins in spring and will be reviewed before any permanent timetable is
              set.
            </p>
            <p>
              Officials said the trial is intended to test demand rather than to promise a fixed
              outcome. The board's own briefing notes describe the ridership model as provisional,
              and{" "}
              <Mark active={phase >= 2} tone="brass">
                no document in the record projects that ridership will double within six months
              </Mark>
              . Several members pressed for monthly reporting instead.
            </p>
            <p>
              The measure passed after two hours of debate.{" "}
              <Mark active={phase >= 3} tone="crimson">
                The minutes record six votes in favour and three against
              </Mark>
              , with one abstention — a detail absent from the version of the story that circulated
              most widely.
            </p>

            {!reduce && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#F1F0EA]/45"
                style={{
                  boxShadow: "0 0 24px 2px rgba(241,240,234,0.16)",
                  background:
                    "linear-gradient(90deg, transparent, rgba(241,240,234,0.15) 15%, rgba(241,240,234,0.7) 50%, rgba(241,240,234,0.15) 85%, transparent)",
                }}
                animate={{ top: ["0%", "100%"], opacity: [0, 0.85, 0.85, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </div>

        {/* ── the instrument ──────────────────────────────────────────── */}
        <div className="relative p-5 sm:p-7">
          <div className="flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#F1F0EA]/40">
            <span>Verification</span>
            <span>{resolved}/3 resolved</span>
          </div>

          <div className="mt-4">
            <Gauge value={coverage} />
          </div>

          <div className="mt-5 space-y-2.5">
            {BARS.map((bar, i) => (
              <div key={bar.label}>
                <div className="flex items-baseline justify-between font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[#F1F0EA]/45">
                  <span>{bar.label}</span>
                  <span className="tabular">{bar.values[phase]}%</span>
                </div>
                <div className="mt-1 h-px w-full bg-[#F1F0EA]/10">
                  <motion.div
                    className="h-px bg-[#F1F0EA]/70"
                    initial={false}
                    animate={{ width: `${bar.values[phase]}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-px border-t border-[#F1F0EA]/10 pt-1">
            {CLAIMS.map((claim, i) => {
              const state = claimState(i, phase);
              const tone = TONE[claim.tone];
              return (
                <div key={claim.id} className="flex items-start gap-3 py-2.5">
                  <span
                    className={`mt-0.5 font-mono text-[0.55rem] tracking-[0.12em] ${
                      state === "done" ? tone.text : "text-[#F1F0EA]/30"
                    }`}
                  >
                    {claim.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[0.72rem] leading-snug transition-colors duration-500 ${
                        state === "done" ? "text-[#F1F0EA]/80" : "text-[#F1F0EA]/45"
                      }`}
                    >
                      {claim.text}
                    </p>
                    <AnimatePresence initial={false}>
                      {state === "done" && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-1 text-[0.62rem] leading-snug ${tone.text} opacity-70`}
                        >
                          {claim.note}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <Status state={state} claim={claim} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* A sentence that the scan has picked up. The marker is drawn, not coloured in:
   a hairline that fills as the line is read. */
function Mark({
  children,
  active,
  tone,
}: {
  children: ReactNode;
  active: boolean;
  tone: Tone;
}) {
  const colour =
    tone === "green" ? "rgba(111,175,120,0.75)" : tone === "brass" ? "rgba(183,164,122,0.8)" : "rgba(179,38,62,0.85)";
  return (
    <span className="relative text-[#F1F0EA]/85">
      {children}
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 left-0 h-px w-full transition-all duration-700"
        style={{
          background: active ? colour : "rgba(241,240,234,0.12)",
          boxShadow: active ? "0 0 12px rgba(241,240,234,0.14)" : "none",
        }}
      />
    </span>
  );
}
