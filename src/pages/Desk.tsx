import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { ChapterMarker } from "@/components/chapters/ChapterMarker";
import { TraceChapter, TRACE_STATIONS } from "@/components/chapters/TraceChapter";
import { PatternsChapter } from "@/components/chapters/PatternsChapter";
import { ScrutinyChapter } from "@/components/chapters/ScrutinyChapter";
import { FrameworkChapter } from "@/components/chapters/FrameworkChapter";

/**
 * PAGE 02 · THE INVESTIGATION DESK — "How does Veritas investigate?"
 *
 * The explanatory publication: the four systems of Veritas, each as its own
 * chapter. The opening is a folio line and a directive — the longer method
 * note sits one interaction down (ABOUT THE METHOD) so the reader reaches
 * the investigation route almost immediately.
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

/* ── The route of an investigation ──────────────────────────────────────
   A thin table of contents for the inquiry itself: six stations on one
   hairline, ARTICLE through VERDICT. The line draws in as the reader
   arrives; on small screens the numbers alone still read as a route. ──── */
function InvestigationRoute() {
  return (
    <motion.nav
      aria-label="The route of an investigation"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <ol className="relative flex items-start">
        {TRACE_STATIONS.map((station, i) => {
          const last = i === TRACE_STATIONS.length - 1;
          return (
            <li key={station.no} className="relative flex-1">
              {/* The hairline segment — a short tail after the last marker */}
              <span
                className={`absolute top-[3px] h-px ${last ? "left-0 right-[82%]" : "left-0 right-0"}`}
                style={{ background: "#3A3B3E" }}
                aria-hidden="true"
              />
              <motion.span
                className={`absolute top-[3px] h-px origin-left ${last ? "left-0 right-[82%]" : "left-0 right-0"}`}
                style={{ background: "rgba(201,195,183,0.6)" }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.1, ease: EASE }}
                aria-hidden="true"
              />
              {/* The station marker */}
              <motion.span
                className="relative block h-[7px] w-[7px]"
                style={{ background: "#202124", border: "1px solid #6F7074" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
                aria-hidden="true"
              />
              <span className="num-marker mt-3 block">{station.no}</span>
              <span
                className="mt-1 hidden text-[8.5px] uppercase tracking-[0.16em] text-[#8E8E8A] sm:block"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {station.label}
              </span>
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}

export default function Desk() {
  const navigate = useNavigate();
  const [showEnter, setShowEnter] = useState(false);
  const [showMethod, setShowMethod] = useState(false);

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

      {/* ── Opening of the desk — folio line, directive, then straight into the work ── */}
      <main className="mx-auto max-w-6xl px-5 pb-32 pt-12 sm:px-8 lg:px-12 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {/* The folio line — printed annotation, not chrome. Carries the
              chapter number, the case file and the edition date. */}
          <div className="flex items-baseline gap-4">
            <span className="kicker shrink-0" style={{ color: "#C9C3B7" }}>
              01 / The investigation desk
            </span>
            <span className="hidden h-px w-10 shrink-0 self-center sm:block" style={{ background: "#3A3B3E" }} aria-hidden="true" />
            <span className="kicker hidden shrink-0 lg:inline">
              Case / 001 · Veritas investigation desk · Live verification system
            </span>
            <span className="h-px flex-1" style={{ background: "#3A3B3E" }} aria-hidden="true" />
            <span className="kicker shrink-0 hidden sm:inline">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          {/* The directive — one voice, then nothing */}
          <h1 className="mt-9 font-masthead text-[clamp(2.4rem,7.5vw,4.75rem)] leading-[0.98] tracking-[0.02em] text-[#F1F0EA] sm:mt-12">
            Follow the evidence.
          </h1>

          <p className="mt-4 text-[10.5px] uppercase tracking-[0.18em] text-[#A5A5A1]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Trace how each claim becomes a verdict.
          </p>

          {/* The way in — the desk CTA, with the method note one interaction down */}
          <div className="mt-9 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            <AnimatePresence>
              {showEnter && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
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

            <button
              type="button"
              onClick={() => setShowMethod((s) => !s)}
              aria-expanded={showMethod}
              className="group inline-flex items-center gap-2 text-[9.5px] uppercase tracking-[0.22em] text-[#8E8E8A] transition-colors duration-300 hover:text-[#F1F0EA]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {showMethod ? "Close the method" : "About the method"}
              <span
                className="inline-block transition-transform duration-300 ease-out"
                style={{ transform: showMethod ? "translate(0, 2px)" : undefined }}
              >
                <span className="block transition-transform duration-300 ease-out group-hover:translate-x-[3px]">
                  ↓
                </span>
              </span>
            </button>
          </div>

          {/* The longer method note — same content as before, one interaction down */}
          <AnimatePresence initial={false}>
            {showMethod && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <p
                  className="max-w-[56ch] pt-6 text-[13px] leading-[1.8] text-muted-foreground"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  How Veritas investigates: retrieve the article, extract its checkable claims, retrieve
                  independent coverage, weigh the evidence, assess. Each chapter below shows one system
                  exactly as it runs.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* The route of an investigation — the page's own wayfinding */}
        <div className="mt-16 sm:mt-20">
          <InvestigationRoute />
        </div>

        {/* ── The four chapters — each a different composition ── */}
        <div className="mt-16 lg:mt-20">
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
