import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import HeroSpecimen from "@/components/landing/HeroSpecimen";
import MagneticButton from "@/components/landing/MagneticButton";
import { FadeUp, HeadlineRotator, TextReveal } from "@/components/landing/Reveal";
import Ticker from "@/components/landing/Ticker";
import AnalysisDemo from "@/components/landing/AnalysisDemo";

/* The WebGL atmosphere is the heaviest thing on the page and the least
   urgent: the typography, the specimen and the CSS light are already on
   screen before it arrives. Loading it as its own chunk keeps three.js off
   the path to the first headline, especially on a phone. */
const CinematicBackdrop = lazy(() => import("@/components/landing/CinematicBackdrop"));

/* ═══════════════════════════════════════════════════════════════════════
   PAGE 01 · THE TITLE PAGE

   A publication front, not a product landing page. The hero is a dark
   reading room with dust in the light; the argument is made typographically
   and then demonstrated, not asserted in feature cards. The supplied
   artwork returns as atmosphere behind the principles — blurred past
   legibility, so nothing fights the live type.

   The way in is unchanged: every primary action goes to /desk.
   ═══════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;

const METHOD = [
  {
    no: "01",
    title: "Retrieve",
    body: "Break the article into individual claims, then fetch the records those claims actually depend on — filings, minutes, transcripts, datasets.",
  },
  {
    no: "02",
    title: "Trace",
    body: "Attach each claim to the exact passage, date and document that carries it. No source, no trace, no verdict.",
  },
  {
    no: "03",
    title: "Compare",
    body: "Read the record against the sentence. Note what it supports, what it quietly omits, and what it directly contradicts.",
  },
  {
    no: "04",
    title: "Weigh",
    body: "Score directness and coverage. A wire summary is not a primary filing, and a screenshot is not an archive.",
  },
  {
    no: "05",
    title: "Withhold",
    body: "When the evidence is silent or unreachable, the result is unresolved. Uncertainty is recorded, never smoothed over.",
  },
  {
    no: "06",
    title: "Report",
    body: "Return the verdict with its full evidence trail, so a reader can retrace the reasoning and disagree with it.",
  },
];

const PRINCIPLES = [
  {
    no: "I",
    title: "The record decides",
    body: "Every verdict is anchored to a retrievable source. Confidence is not evidence, and neither is repetition.",
  },
  {
    no: "II",
    title: "Silence is a finding",
    body: "If the record cannot support a claim, Veritas says so. An unresolved claim is a result, not a failure of the interface.",
  },
  {
    no: "III",
    title: "Show the trail",
    body: "Sources, passages and contradictions stay visible. The work is only useful if it can be checked.",
  },
];

function scrollToId(id: string, reduce: boolean | null) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function Masthead({ onEnter }: { onEnter: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
        scrolled
          ? "border-b border-[#F1F0EA]/10 bg-[#080807]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[92rem] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <button
          onClick={onEnter}
          className="group flex items-baseline gap-3 text-left"
          aria-label="Veritas — enter the investigation desk"
        >
          <span className="font-mono text-[0.62rem] tracking-[0.3em] text-[#F1F0EA]/40 transition-colors duration-500 group-hover:text-[#F1F0EA]/80">
            V/
          </span>
          <span className="font-masthead text-[0.72rem] uppercase tracking-[0.36em] text-[#F1F0EA]/85 transition-colors duration-500 group-hover:text-[#F1F0EA]">
            Veritas
          </span>
          <span className="hidden pl-3 font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1F0EA]/25 lg:block">
            Investigative intelligence
          </span>
        </button>

        <nav aria-label="Sections" className="flex items-center gap-1 sm:gap-7">
          <div className="hidden items-center gap-7 md:flex">
            {[
              ["Method", "method"],
              ["Evidence", "evidence"],
              ["Principles", "principles"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollToId(id, reduce)}
                className="group relative py-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#F1F0EA]/55 transition-colors duration-300 hover:text-[#F1F0EA]/90"
              >
                {label}
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#F1F0EA]/50 transition-transform duration-500 group-hover:scale-x-100" />
              </button>
            ))}
          </div>
          <span className="mx-2 hidden h-3 w-px bg-[#F1F0EA]/15 md:block" />
          <button
            onClick={onEnter}
            className="group flex items-center gap-2 border border-[#F1F0EA]/20 px-3.5 py-2 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#F1F0EA]/80 transition-colors duration-500 hover:border-[#F1F0EA]/50 hover:bg-[#F1F0EA]/[0.05] hover:text-[#F1F0EA]"
          >
            Enter the desk
            <ArrowUpRight
              size={11}
              strokeWidth={1.7}
              className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </nav>
      </div>
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-[#F1F0EA]/35"
      />
    </header>
  );
}

function Hero({ onEnter }: { onEnter: () => void }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-28 sm:pt-32 lg:min-h-[100svh] lg:pb-24">
      <Suspense fallback={null}>
        <CinematicBackdrop />
      </Suspense>

      {/* a faint column grid, like the edge rules of a printed page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[92rem] -translate-x-1/2 px-5 sm:px-8 lg:block lg:px-12"
      >
        <div className="h-full border-x border-[#F1F0EA]/[0.045]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[92rem] flex-col justify-center px-5 sm:px-8 lg:min-h-[calc(100svh-8rem)] lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <span className="flex items-center gap-2 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#F1F0EA]/55">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F1F0EA]/35 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#F1F0EA]/75" />
                </span>
                Automated fact-checking
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-[#F1F0EA]/15" />
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#F1F0EA]/30">
                B.Sc. Data Science · 2026
              </span>
            </motion.div>

            <TextReveal
              as="h1"
              lines={["Every claim", "leaves a trace."]}
              className="mt-7 font-masthead text-[clamp(2.9rem,7.2vw,6.4rem)] leading-[0.94] tracking-[-0.02em] text-[#F1F0EA] sm:mt-8"
              delay={0.25}
              stagger={0.09}
            />

            <div className="mt-6 max-w-xl border-l border-[#F1F0EA]/20 pl-4 sm:mt-7 sm:pl-5">
              <HeadlineRotator
                phrases={[
                  "We follow it back to the record.",
                  "We weigh what the source actually says.",
                  "We tell you when the evidence runs out.",
                ]}
                className="font-quote text-[clamp(1.05rem,2.2vw,1.5rem)] leading-snug tracking-[0.005em] text-[#F1F0EA]/80"
              />
            </div>

            <FadeUp delay={0.55} className="mt-6 max-w-[46ch]">
              <p className="text-[0.95rem] leading-[1.75] text-[#F1F0EA]/60 sm:text-base">
                Veritas reads a news article, isolates the claims that matter, and retrieves the
                primary record behind each one. The verdict arrives with its evidence attached —
                including the parts that refuse to agree.
              </p>
            </FadeUp>

            <FadeUp delay={0.7} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <MagneticButton onClick={onEnter} ariaLabel="Enter the Veritas desk">
                Enter Veritas
              </MagneticButton>
              <button
                onClick={() => scrollToId("method", reduce)}
                className="group flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#F1F0EA]/50 transition-colors duration-300 hover:text-[#F1F0EA]/90"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#F1F0EA]/20 transition-colors duration-300 group-hover:border-[#F1F0EA]/50">
                  <ArrowDown
                    size={12}
                    strokeWidth={1.6}
                    className="transition-transform duration-500 group-hover:translate-y-0.5"
                  />
                </span>
                Examine the method
              </button>
            </FadeUp>

            <FadeUp delay={0.9} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#F1F0EA]/10 pt-4">
              <span className="font-mono text-[0.52rem] uppercase tracking-[0.2em] text-[#F1F0EA]/30">
                Guest access · no account required
              </span>
              <span className="hidden h-2.5 w-px bg-[#F1F0EA]/15 sm:block" />
              <span className="font-mono text-[0.52rem] uppercase tracking-[0.2em] text-[#F1F0EA]/30">
                Claim by claim · source by source
              </span>
            </FadeUp>
          </div>

          <div className="relative lg:pl-4">
            <HeroSpecimen />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-16 flex items-center justify-between border-t border-[#F1F0EA]/10 pt-4 lg:mt-20"
        >
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1F0EA]/25">
            Scroll to examine
          </span>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1F0EA]/25">
              Retrieval · Trace · Verdict
            </span>
            <span aria-hidden="true" className="h-px w-16 bg-gradient-to-r from-[#F1F0EA]/40 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section id="method" className="relative scroll-mt-20 border-t border-[#F1F0EA]/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <FadeUp>
              <p className="flex items-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#F1F0EA]/35">
                <span className="h-px w-8 bg-[#F1F0EA]/30" />
                01 — Method
              </p>
            </FadeUp>
            <TextReveal
              as="h2"
              lines={["The claim is the", "beginning. The record", "is the answer."]}
              className="mt-6 font-masthead text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] tracking-[-0.015em] text-[#F1F0EA]"
            />
            <FadeUp delay={0.15} className="mt-6 max-w-[38ch]">
              <p className="text-[0.93rem] leading-[1.8] text-[#F1F0EA]/55">
                Six stages, run in order, every time. Nothing is published as a verdict until the
                record has been retrieved and read against the sentence in front of it.
              </p>
            </FadeUp>
            <FadeUp delay={0.25} className="mt-8 hidden border-t border-[#F1F0EA]/10 pt-4 lg:block">
              <p className="font-mono text-[0.52rem] uppercase leading-relaxed tracking-[0.18em] text-[#F1F0EA]/25">
                The pipeline is deliberately slow.
                <br />
                Speed is not a source.
              </p>
            </FadeUp>
          </div>

          <ol className="border-t border-[#F1F0EA]/10">
            {METHOD.map((step, i) => (
              <li key={step.no}>
                <FadeUp delay={i * 0.04} className="group relative grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-[#F1F0EA]/10 py-6 sm:grid-cols-[4rem_1fr_auto] sm:gap-x-6 sm:py-7">
                  <span className="pt-1 font-mono text-[0.6rem] tracking-[0.16em] text-[#F1F0EA]/30 transition-colors duration-500 group-hover:text-[#F1F0EA]/70">
                    {step.no}
                  </span>
                  <div>
                    <h3 className="font-masthead text-[1.4rem] leading-none tracking-[-0.01em] text-[#F1F0EA]/90 transition-colors duration-500 group-hover:text-[#F1F0EA] sm:text-[1.55rem]">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 max-w-[52ch] text-[0.85rem] leading-[1.7] text-[#F1F0EA]/50 transition-colors duration-500 group-hover:text-[#F1F0EA]/70">
                      {step.body}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.4}
                    className="mt-1 hidden text-[#F1F0EA]/20 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#F1F0EA]/60 sm:block"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-[#F1F0EA]/30 transition-transform duration-700 group-hover:scale-y-100"
                  />
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Evidence() {
  const reduce = useReducedMotion();
  return (
    <section
      id="evidence"
      className="relative scroll-mt-20 overflow-hidden border-t border-[#F1F0EA]/10 py-24 sm:py-32"
    >
      {/* a single scan rule crossing the whole section, very slowly */}
      {!reduce && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-[#F1F0EA]/[0.07] to-transparent"
            animate={{ left: ["10%", "88%"] }}
            transition={{ duration: 38, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <FadeUp>
              <p className="flex items-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#F1F0EA]/35">
                <span className="h-px w-8 bg-[#F1F0EA]/30" />
                02 — Evidence
              </p>
            </FadeUp>
            <TextReveal
              as="h2"
              lines={["Watch a claim", "meet the record."]}
              className="mt-6 font-masthead text-[clamp(2.1rem,5vw,3.8rem)] leading-[1.02] tracking-[-0.02em] text-[#F1F0EA]"
            />
          </div>
          <FadeUp delay={0.15} className="max-w-[40ch] md:pb-2">
            <p className="text-[0.9rem] leading-[1.8] text-[#F1F0EA]/55">
              A sample dossier, scanned end to end. Claims resolve one by one; coverage fills only
              as far as the retrieved record allows.
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.1} className="mt-12">
          <AnalysisDemo />
        </FadeUp>

        <div className="mt-10 grid gap-px border-t border-[#F1F0EA]/10 sm:grid-cols-3">
          {[
            ["Direct sources first", "The filing, the minutes, the transcript — before the report about them."],
            ["Contradiction is a finding", "Disagreement is surfaced, not averaged into a comfortable middle."],
            ["Unresolved is honest", "A silent record produces a silent verdict. We do not invent the missing page."],
          ].map(([title, body], i) => (
            <FadeUp key={title} delay={0.06 * i}>
              <div className="border-b border-[#F1F0EA]/10 py-6 sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0 sm:first:pl-0">
                <h3 className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-[#F1F0EA]/70">
                  {title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-[0.8rem] leading-[1.7] text-[#F1F0EA]/45">
                  {body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Principles() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.08, 0.22, 0.22, 0.08]);

  return (
    <section
      ref={ref}
      id="principles"
      className="relative isolate scroll-mt-20 overflow-hidden border-t border-[#F1F0EA]/10 py-28 sm:py-36"
    >
      {/* The title-page artwork, returned as weather rather than as a picture:
          blurred beyond legibility and held well below the type. */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y }}
        className="pointer-events-none absolute inset-0 z-0 scale-110"
      >
        <motion.img
          src="/veritas-hero.png"
          alt=""
          style={reduce ? { opacity: 0.18 } : { opacity }}
          className="h-full w-full object-cover blur-[14px] grayscale-[0.4]"
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 45%, rgba(8,8,7,0.55) 0%, rgba(8,8,7,0.88) 62%, #080807 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <FadeUp>
            <p className="flex items-center justify-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#F1F0EA]/35">
              <span className="h-px w-8 bg-[#F1F0EA]/25" />
              03 — Principles
              <span className="h-px w-8 bg-[#F1F0EA]/25" />
            </p>
          </FadeUp>
          <TextReveal
            as="h2"
            lines={["Evidence before", "certainty."]}
            className="mt-8 font-masthead text-[clamp(2.8rem,7.5vw,6.2rem)] leading-[0.95] tracking-[-0.025em] text-[#F1F0EA]"
          />
          <FadeUp delay={0.2} className="mx-auto mt-7 max-w-[48ch]">
            <p className="text-[0.92rem] leading-[1.85] text-[#F1F0EA]/55">
              A fact-check is not a verdict that arrives from nowhere. It is a visible path between
              a sentence and the record that carries — or refuses — it.
            </p>
          </FadeUp>
        </div>

        <div className="mt-20 grid gap-px border-y border-[#F1F0EA]/10 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <FadeUp key={p.no} delay={i * 0.08}>
              <div className="group relative h-full border-b border-[#F1F0EA]/10 px-0 py-8 md:border-b-0 md:border-r md:px-8 md:last:border-r-0">
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#F1F0EA]/25">
                  {p.no}
                </span>
                <h3 className="mt-4 font-masthead text-[1.45rem] leading-tight tracking-[-0.01em] text-[#F1F0EA]/90">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[32ch] text-[0.83rem] leading-[1.75] text-[#F1F0EA]/50">
                  {p.body}
                </p>
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-px w-0 bg-[#F1F0EA]/40 transition-all duration-700 group-hover:w-full md:left-8 md:right-8 md:w-0"
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing({ onEnter }: { onEnter: () => void }) {
  const reduce = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden border-t border-[#F1F0EA]/10 py-28 sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 800 800"
          className="h-[130%] w-auto opacity-[0.14]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 220, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="400" cy="400" r="330" fill="none" stroke="#F1F0EA" strokeOpacity="0.4" strokeDasharray="1 10" />
          <ellipse cx="400" cy="400" rx="390" ry="150" fill="none" stroke="#F1F0EA" strokeOpacity="0.3" transform="rotate(-18 400 400)" />
          <ellipse cx="400" cy="400" rx="240" ry="400" fill="none" stroke="#F1F0EA" strokeOpacity="0.2" transform="rotate(28 400 400)" />
        </motion.svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[92rem] px-5 text-center sm:px-8 lg:px-12">
        <FadeUp>
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#F1F0EA]/35">
            04 — Enter
          </p>
        </FadeUp>
        <TextReveal
          as="h2"
          lines={["Bring a claim.", "We'll bring the record."]}
          className="mx-auto mt-7 max-w-4xl font-masthead text-[clamp(2.4rem,6.4vw,5.4rem)] leading-[0.98] tracking-[-0.025em] text-[#F1F0EA]"
        />
        <FadeUp delay={0.2} className="mx-auto mt-6 max-w-[42ch]">
          <p className="text-[0.92rem] leading-[1.8] text-[#F1F0EA]/55">
            Paste an article into the desk and watch the pipeline work. No account, no ceremony —
            just the claim and the evidence.
          </p>
        </FadeUp>
        <FadeUp delay={0.32} className="mt-9 flex justify-center">
          <MagneticButton onClick={onEnter} ariaLabel="Open the Veritas desk">
            Open the desk
          </MagneticButton>
        </FadeUp>
        <FadeUp delay={0.45}>
          <p className="mt-6 font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1F0EA]/25">
            Guest session · no sign-in required
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer({ onEnter }: { onEnter: () => void }) {
  const reduce = useReducedMotion();
  return (
    <footer className="border-t border-[#F1F0EA]/10">
      <div className="mx-auto max-w-[92rem] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[0.62rem] tracking-[0.3em] text-[#F1F0EA]/35">V/</span>
              <span className="font-masthead text-[0.8rem] uppercase tracking-[0.34em] text-[#F1F0EA]/80">
                Veritas
              </span>
            </div>
            <p className="mt-4 max-w-[32ch] text-[0.78rem] leading-[1.7] text-[#F1F0EA]/30">
              An automated fact-checking study built around retrieval, traceability and the
              discipline to withhold a verdict.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-20">
            <div>
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1F0EA]/25">
                Read
              </p>
              <ul className="mt-4 space-y-2.5">
                {[
                  ["Method", "method"],
                  ["Evidence", "evidence"],
                  ["Principles", "principles"],
                ].map(([label, id]) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToId(id, reduce)}
                      className="text-[0.8rem] text-[#F1F0EA]/55 transition-colors duration-300 hover:text-[#F1F0EA]"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1F0EA]/25">
                Work
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <button
                    onClick={onEnter}
                    className="group inline-flex items-center gap-1.5 text-[0.8rem] text-[#F1F0EA]/55 transition-colors duration-300 hover:text-[#F1F0EA]"
                  >
                    The desk
                    <ArrowUpRight
                      size={11}
                      strokeWidth={1.6}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>
                </li>
                <li>
                  <a
                    href="/veritas-files/Veritas-Project-Documentation.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[0.8rem] text-[#F1F0EA]/55 transition-colors duration-300 hover:text-[#F1F0EA]"
                  >
                    Project documentation
                    <ArrowUpRight
                      size={11}
                      strokeWidth={1.6}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#F1F0EA]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#F1F0EA]/25">
            © 2026 Veritas · B.Sc. Data Science
          </p>
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#F1F0EA]/25">
            Evidence before certainty
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const enter = () => navigate("/desk");

  return (
    <div className="veritas-night relative min-h-screen bg-[#080807] text-[#F1F0EA] antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-[#F1F0EA] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-[#080807]"
      >
        Skip to content
      </a>

      <Masthead onEnter={enter} />

      <main id="main">
        <Hero onEnter={enter} />
        <Ticker />
        <Method />
        <Evidence />
        <Principles />
        <Closing onEnter={enter} />
      </main>

      <Footer onEnter={enter} />
    </div>
  );
}
