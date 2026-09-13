import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type SplitBy = "words" | "chars";

interface TextRevealProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  splitBy?: SplitBy;
  delay?: number;
  staggerChildren?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

/**
 * Reveals text word-by-word or char-by-char on scroll.
 * Usage:
 *   <TextReveal as="h2" splitBy="words">Truth over noise.</TextReveal>
 *   <TextReveal as="p" splitBy="chars" staggerChildren={0.03}>Verify before you believe.</TextReveal>
 */
export function TextReveal({
  children,
  as = "p",
  splitBy = "words",
  delay = 0,
  staggerChildren = 0.04,
  className = "",
  style,
  once = true,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const Tag = motion[as] as any;

  const tokens = splitBy === "chars" ? children.split("") : children.split(/(\s+)/);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ ...style, display: "inline" }}
    >
      {tokens.map((token, i) => (
        <motion.span
          key={`${token}-${i}`}
          initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
          animate={
            inView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 12, filter: "blur(3px)" }
          }
          transition={{
            duration: 0.5,
            delay: delay + i * staggerChildren,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "inline-block", whiteSpace: splitBy === "words" && token.match(/^\s+$/) ? "pre" : undefined }}
        >
          {token}
        </motion.span>
      ))}
    </Tag>
  );
}
