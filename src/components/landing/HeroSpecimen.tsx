import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ShieldAlert, Minus } from "lucide-react";
import { useEffect, useState } from "react";

/* The hero's exhibit: a case file suspended inside the orbit field.
   It is a live object, not a screenshot — the article is always being read,
   and one claim at a time resolves in the margin. The animation is slow
   enough to notice on a second look, which is the point: the page should
   reward attention rather than demand it. */

const RESULTS = [
  {
    id: "C1",
    verdict: "Supported",
    note: "primary filing · route 14",
    colour: "#8FC796",
    Icon: Check,
  },
  {
    id: "C2",
    verdict: "Uncertain",
    note: "no projection in record",
    colour: "#CBBB97",
    Icon: Minus,
  },
  {
    id: "C3",
    verdict: "Contradicted",
    note: "minutes: 6 for, 3 against",
    colour: "#D06A7B",
    Icon: ShieldAlert,
  },
];

const LINES = [
  ["92%", "84%", "70%"],
  ["96%", "88%", "64%"],
  ["72%", "94%", "82%"],
  ["88%", "60%"],
];

export default function HeroSpecimen() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % RESULTS.length), 4200);
    return () => window.clearInterval(id);
  }, [reduce]);

  const result = RESULTS[index];

  return (
    <div className="relative isolate mx-auto w-full max-w-[30rem] lg:max-w-none">
      {/* ── orbit field ──────────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-16 -inset-y-20 z-0">
        <motion.svg
          viewBox="0 0 520 520"
          className="h-full w-full"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
        >
          <ellipse cx="260" cy="260" rx="238" ry="112" fill="none" stroke="#F1F0EA" strokeOpacity="0.09" />
          <ellipse
            cx="260"
            cy="260"
            rx="196"
            ry="196"
            fill="none"
            stroke="#F1F0EA"
            strokeOpacity="0.055"
            strokeDasharray="1 9"
          />
          <ellipse
            cx="260"
            cy="260"
            rx="170"
            ry="248"
            fill="none"
            stroke="#F1F0EA"
            strokeOpacity="0.07"
            transform="rotate(34 260 260)"
          />
        </motion.svg>
        {/* the scan beam crossing the orbit, not the page */}
        {!reduce && (
          <motion.div
            className="absolute inset-y-0 w-px"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(241,240,234,0.35) 35%, rgba(241,240,234,0.35) 65%, transparent)",
            }}
            animate={{ left: ["2%", "98%"], opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          />
        )}
        <span className="absolute -left-1 top-2 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#F1F0EA]/25">
          21°18′N
        </span>
        <span className="absolute -right-2 bottom-3 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#F1F0EA]/25">
          TRACE / 0417
        </span>
      </div>

      {/* ── the file ─────────────────────────────────────────────────── */}
      <motion.div
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
      <motion.div
        initial={{ opacity: 0, y: 34, rotate: reduce ? 0 : -2.2 }}
        animate={{ opacity: 1, y: 0, rotate: reduce ? 0 : -1.3 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 border border-[#F1F0EA]/18 bg-[#0C0C0B]/88 p-5 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)] sm:p-6 md:backdrop-blur-sm"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F1F0EA]/50 to-transparent" />

        <div className="flex items-center justify-between border-b border-[#F1F0EA]/10 pb-3 font-mono text-[0.54rem] uppercase tracking-[0.18em]">
          <span className="flex items-center gap-2 text-[#F1F0EA]/70">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[#B7A47A]"
              animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            Retrieval active
          </span>
          <span className="text-[#F1F0EA]/35">case 0417</span>
        </div>

        <div className="pt-4">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1F0EA]/35">
            Exhibit A · article
          </p>
          <p className="mt-2 max-w-[26ch] font-masthead text-[1.28rem] leading-[1.2] tracking-[-0.01em] text-[#F1F0EA]/90">
            Transit authority approves night-bus pilot across the eastern corridor
          </p>

          <div className="relative mt-4 space-y-2 overflow-hidden pb-2">
            {LINES.map((group, gi) => (
              <div key={gi} className="flex gap-2">
                {group.map((w, wi) => (
                  <motion.span
                    key={wi}
                    className="block h-[3px] rounded-full bg-[#F1F0EA]/15"
                    style={{ width: w }}
                    animate={reduce ? undefined : { opacity: [0.55, 1, 0.55] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      delay: (gi + wi) * 0.25,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            ))}
            {!reduce && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 h-px bg-[#F1F0EA]/60"
                animate={{ top: ["0%", "100%"], opacity: [0, 0.8, 0.8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-[#F1F0EA]/10 pt-3">
          <div className="flex items-center justify-between font-mono text-[0.54rem] uppercase tracking-[0.16em] text-[#F1F0EA]/40">
            <span>{result.id} · claim under review</span>
            <span className="tabular">04 / 09</span>
          </div>

          <div className="mt-2 flex min-h-[3.1rem] items-start justify-between gap-3">
            <div className="min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={result.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[0.82rem] leading-snug text-[#F1F0EA]/75"
                >
                  {result.id === "C1"
                    ? "“Adding fourteen new stops across the eastern corridor.”"
                    : result.id === "C2"
                      ? "“Ridership will double within six months.”"
                      : "“The scheme was approved unanimously.”"}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={result.note}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[#F1F0EA]/35"
                >
                  {result.note}
                </motion.p>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={result.verdict}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: reduce ? 0 : 0.4 }}
                className="flex shrink-0 items-center gap-1.5 border px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.14em]"
                style={{ color: result.colour, borderColor: `${result.colour}55` }}
              >
                <result.Icon size={9} strokeWidth={2} />
                {result.verdict}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-[#F1F0EA]/10 pt-3">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#F1F0EA]/35">
            Coverage
          </span>
          <div className="relative h-px flex-1 bg-[#F1F0EA]/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#F1F0EA]/70"
              animate={{ width: result.id === "C1" ? "42%" : result.id === "C2" ? "57%" : "66%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
            {[0, 25, 50, 75, 100].map((t) => (
              <span
                key={t}
                aria-hidden="true"
                className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-[#F1F0EA]/20"
                style={{ left: `${t}%` }}
              />
            ))}
          </div>
          <span className="font-mono text-[0.55rem] tabular text-[#F1F0EA]/60">
            {result.id === "C1" ? "42" : result.id === "C2" ? "57" : "66"}%
          </span>
        </div>
      </motion.div>
      </motion.div>

      {/* caption, like a plate in a printed report */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="mt-4 text-center font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#F1F0EA]/25"
      >
        Fig. 01 — claim resolution, illustrative
      </motion.p>
    </div>
  );
}
