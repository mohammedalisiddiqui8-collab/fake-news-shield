import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypeWriterProps {
  phrases: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypeWriter({
  phrases,
  speed = 60,
  deleteSpeed = 30,
  pauseDuration = 2000,
  className = "",
}: TypeWriterProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const tick = useCallback(() => {
    if (isPaused) return;

    const fullText = phrases[currentPhrase];

    if (!isDeleting) {
      if (displayed.length < fullText.length) {
        setDisplayed(fullText.slice(0, displayed.length + 1));
      } else {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (displayed.length > 0) {
        setDisplayed(fullText.slice(0, displayed.length - 1));
      } else {
        setIsDeleting(false);
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [displayed, isDeleting, isPaused, currentPhrase, phrases, pauseDuration]);

  useEffect(() => {
    const timer = setTimeout(tick, isDeleting ? deleteSpeed : speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, deleteSpeed, speed]);

  return (
    <span className={className}>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayed}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
        >
          {displayed}
        </motion.span>
      </AnimatePresence>
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
}
