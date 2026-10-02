import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="veritas-night min-h-screen flex flex-col bg-background text-foreground"
    >
      <div className="h-px w-full bg-[#2A2B2E]" />

      <header className="px-6 py-6 sm:px-10 sm:py-8">
        <span className="font-mono text-[10px] tracking-[0.3em] text-[#6B6963]">V/</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="kicker mb-8 text-[#5C5D61]">Filing not found</p>

        <h1 className="font-serif-editorial text-[clamp(3rem,14vw,6.5rem)] leading-none tracking-[0.08em] text-[#F1F0EA]">
          404
        </h1>

        <div className="mt-9 h-px w-14 bg-[#242424]" />

        <p className="mt-9 text-[12px] leading-relaxed text-[#A6A39B] max-w-sm">
          The page you requested is not in this edition.
        </p>

        <button
          onClick={() => navigate("/")}
          className="group mt-12 flex items-center gap-3 text-[11px] font-light uppercase tracking-[0.28em] text-[#A6A39B] transition-colors duration-500 hover:text-[#F1F0EA]"
        >
          <span className="ul-hover">Return to the title page</span>
          <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-x-1">
            →
          </span>
        </button>
      </main>

      <div className="h-px w-full bg-[#2A2B2E]" />
    </motion.div>
  );
}
