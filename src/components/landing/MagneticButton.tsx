import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from "react";

/* A button that leans toward the pointer by a handful of pixels and recovers
   with a spring. The pull is capped low enough that the label never appears to
   chase the cursor — it reads as weight, not novelty. Touch devices and reduced
   motion get a perfectly ordinary button. */

type Tone = "ivory" | "quiet";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: Tone;
  className?: string;
  ariaLabel?: string;
  arrow?: boolean;
};

export default function MagneticButton({
  children,
  onClick,
  href,
  tone = "ivory",
  className = "",
  ariaLabel,
  arrow = true,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.35 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.35 });

  const pull = (e: ReactPointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 12);
    my.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 8);
  };
  const release = () => {
    mx.set(0);
    my.set(0);
  };

  const shell =
    tone === "ivory"
      ? "bg-[#F1F0EA] text-[#0B0B0A] hover:bg-[#FFFEF8]"
      : "border border-[#F1F0EA]/22 text-[#F1F0EA] hover:border-[#F1F0EA]/55 hover:bg-[#F1F0EA]/[0.04]";

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {arrow && (
        <span className="relative z-10 flex h-4 w-4 items-center justify-center overflow-hidden">
          <ArrowUpRight
            size={15}
            strokeWidth={1.7}
            className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-4 group-hover:-translate-y-4 group-focus-visible:translate-x-4 group-focus-visible:-translate-y-4"
          />
          <ArrowUpRight
            size={15}
            strokeWidth={1.7}
            aria-hidden="true"
            className="absolute -translate-x-4 translate-y-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0"
          />
        </span>
      )}
    </>
  );

  const classes = `group inline-flex items-center gap-3 px-6 py-3.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F1F0EA]/60 ${shell} ${className}`;

  if (href) {
    return (
      <motion.a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        onPointerMove={pull}
        onPointerLeave={release}
        whileTap={{ scale: 0.985 }}
        style={{ x, y }}
        className={classes}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={pull}
      onPointerLeave={release}
      whileTap={{ scale: 0.985 }}
      style={{ x, y }}
      className={classes}
    >
      {inner}
    </motion.button>
  );
}
