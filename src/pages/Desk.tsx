import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { ChapterMarker } from "@/components/chapters/ChapterMarker";
import { TraceChapter } from "@/components/chapters/TraceChapter";
import { PatternsChapter } from "@/components/chapters/PatternsChapter";
import { ScrutinyChapter } from "@/components/chapters/ScrutinyChapter";
import { FrameworkChapter } from "@/components/chapters/FrameworkChapter";

/**
 * PAGE 02 · THE INVESTIGATION DESK — "How does Veritas investigate?"
 *
 * The explanatory publication: the four systems of Veritas, each as its own
 * chapter. There is no editor, no archive and no headlines here — choosing to
 * investigate navigates to the Analysis page, where the working desk lives.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const CHAPTERS = [
  {
    no: "01",
    title: "Trace",
    standfirst:
      "Every investigation follows the same path: the article is taken in, the checkable statements are isolated, independent coverage is retrieved for each one, and the verdict is built from what was found — never from how the article sounds.",
    body: <TraceChapter />,
  },
  {
    no: "02",
    title: "Patterns",
    standfirst:
      "Alongside the fact-check, Veritas reads how the article is written. These signals describe presentation — they are reported, but they are not proof of anything.",
    body: <PatternsChapter values={{}} />,
  },
  {
    no: "03",
    title: "Scrutiny",
    standfirst:
      "One claim, followed the whole way through the system — from the sentence as filed to the assessment that the evidence supports.",
    body: <ScrutinyChapter />,
  },
  {
    no: "04",
    title: "Framework",
    standfirst:
      "What runs underneath the interface: retrieval, claim extraction, source retrieval, external evidence, cross-checking, language signals and credibility assessment. Nothing more, nothing invented.",
    body: <FrameworkChapter />,
  },
];

export default function Desk() {
  const navigate = useNavigate();
  const [showEnter, setShowEnter] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowEnter(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Masthead — the publication header: back to the title page, forward to the desk work ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: "rgba(21,22,24,0.92)", backdropFilter: "blur(6px)", borderColor: "rgba(241,240,234,0.1)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-baseline gap-3"
            aria-label="Veritas — title page"
          >
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#6F7074] transition-colors duration-500 group-hover:text-[#C9C3B7]">
              V/
            </span>
            <span
              className="text-[14px] uppercase tracking-[0.28em] text-[#F1F0EA] transition-colors duration-500 group-hover:text-white"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Veritas
            </span>
          </button>

          <nav className="flex items-center gap-5 sm:gap-7">
            <span className="kicker hidden sm:inline" style={{ color: "#C9C3B7" }}>Investigation desk</span>
            <button
              type="button"
              onClick={() => navigate("/analysis")}
              className="group inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#A5A5A1] transition-colors duration-300 hover:text-[#F1F0EA]"
            >
              Analysis
              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </nav>
        </div>
      </header>

      {/* ── Opening of the desk ── */}
      <main className="mx-auto max-w-6xl px-5 pb-32 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div className="flex items-center gap-4">
            <span className="kicker shrink-0" style={{ color: "#C9C3B7" }}>
              Veritas / Investigation desk
            </span>
            <span className="h-px flex-1" style={{ background: "#3A3B3E" }} />
            <span className="kicker shrink-0 hidden sm:inline">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <h1 className="mt-10 sm:mt-14 font-serif-editorial text-[clamp(2rem,6vw,3.5rem)] leading-[1.05] text-[#F1F0EA]">
            <span className="block">How Veritas investigates.</span>
            <span className="block text-[#8E8E8A]">Four systems. One method.</span>
          </h1>

          <p className="mt-8 max-w-[58ch] text-[14px] leading-[1.75] text-muted-foreground">
            Veritas retrieves the original article, extracts the factual claims, searches live independent
            coverage and cross-checks each claim against what was found. This page explains each system in
            turn — when you are ready to run an investigation, the desk is one step away.
          </p>

          <AnimatePresence>
            {showEnter && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="mt-12"
              >
                <button
                  type="button"
                  onClick={() => navigate("/analysis")}
                  className="group inline-flex flex-col items-start gap-2.5"
                >
                  <span className="inline-flex items-baseline gap-3">
                    <span className="font-serif-editorial text-[clamp(1.15rem,3.4vw,1.7rem)] tracking-[0.12em] text-[#F1F0EA] transition-colors duration-300 group-hover:text-white">
                      BEGIN AN INVESTIGATION
                    </span>
                    <span className="text-[15px] leading-none text-[#A5A5A1] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#F1F0EA]">
                      →
                    </span>
                  </span>
                  <span className="h-px w-full max-w-[340px] origin-left bg-[#3A3B3E] transition-colors duration-500 group-hover:bg-[#C9C3B7]" />
                  <span className="kicker" style={{ opacity: 0.55 }}>
                    Paste a URL or article text on the Analysis page
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── The four chapters — each a different composition ── */}
        <div className="mt-24 lg:mt-32">
          {CHAPTERS.map((ch) => (
            <div key={ch.no} className="mt-24 first:mt-0 lg:mt-32">
              <ChapterMarker no={ch.no} title={ch.title} standfirst={ch.standfirst}>
                {ch.body}
              </ChapterMarker>
            </div>
          ))}
        </div>

        {/* ── Onward — the working desk ── */}
        <div className="mt-28 lg:mt-36 border-t border-border pt-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker" style={{ color: "#C9C3B7" }}>Ready when you are</p>
              <p className="mt-3 max-w-[52ch] text-[13.5px] leading-[1.75] text-muted-foreground">
                The method above runs exactly as described on every investigation. File one and the full
                report — verdict, claims, evidence and reasoning — is yours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/analysis")}
              className="group inline-flex items-center gap-2.5 border px-6 py-3 text-[10.5px] uppercase tracking-[0.18em] transition-all duration-300 hover:border-[#C9C3B7]"
              style={{ borderColor: "#3A3B3E", background: "#C9C3B7", color: "#151618" }}
            >
              Begin an investigation
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
