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
      "Follow each claim from the article to the evidence behind the verdict.",
    body: <TraceChapter />,
  },
  {
    no: "02",
    title: "Patterns",
    standfirst:
      "How the article is written — reported as signals, never treated as proof.",
    body: <PatternsChapter values={{}} />,
  },
  {
    no: "03",
    title: "Scrutiny",
    standfirst:
      "One claim, followed through the complete verification process.",
    body: <ScrutinyChapter />,
  },
  {
    no: "04",
    title: "Framework",
    standfirst:
      "The pipeline beneath every investigation — the system as it actually runs.",
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
            <span className="font-masthead text-[14px] uppercase tracking-[0.28em] text-[#F1F0EA] transition-colors duration-500 group-hover:text-white">
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

          <p className="mt-8 max-w-[52ch] text-[14px] leading-[1.75] text-muted-foreground">
            Retrieve, extract, cross-check, assess. Each system is shown below exactly as it runs.
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
                  className="ctrl-frame group h-12 px-8 text-[11px] sm:text-[12px]"
                  data-primary="true"
                >
                  Begin an investigation
                  <span className="block text-[14px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-[5px]">
                    →
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
              <p className="mt-3 max-w-[46ch] text-[13.5px] leading-[1.75] text-muted-foreground">
                File an investigation and the full report — verdict, claims, evidence, reasoning — is yours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/analysis")}
              className="ctrl-frame group h-11 px-6 text-[10.5px]"
              data-primary="true"
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
