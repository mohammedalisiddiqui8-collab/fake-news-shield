import { motion } from "framer-motion";

/**
 * The one mark that appears on the title page.
 *
 * A hairline shield drawn once with a single travelling node — a check being
 * traced, nothing more. Monochrome, square, no glow, no rotation, no loop of
 * decorative motion: it settles and stays settled so it never competes with
 * the wordmark.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function VerificationGlyph({ size = 44 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      initial="rest"
      animate="rest"
    >
      {/* Shield outline — drawn once, left resting */}
      <motion.path
        d="M24 5 L40 11 V24 C40 33.5 33 40.5 24 43.5 C15 40.5 8 33.5 8 24 V11 Z"
        stroke="#F1F0EA"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
      />

      {/* The check itself — traced after the shield settles */}
      <motion.path
        d="M16.5 24.5 L21.5 29.5 L31.5 18.5"
        stroke="#F1F0EA"
        strokeOpacity="0.85"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.75, ease: EASE, delay: 1.85 }}
      />

      {/* A single node tracing the shield edge once — an investigation in
          progress, then it stops. It never loops. */}
      <motion.circle
        r="1.7"
        fill="#F1F0EA"
        initial={{ offsetDistance: "0%", opacity: 0 }}
        animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.4, times: [0, 0.12, 0.78, 1], delay: 0.45, ease: "easeInOut" }}
        style={{
          offsetPath: "path('M24 5 L40 11 V24 C40 33.5 33 40.5 24 43.5 C15 40.5 8 33.5 8 24 V11 Z')",
          offsetRotate: "0deg",
        }}
      />
    </motion.svg>
  );
}
