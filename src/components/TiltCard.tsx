import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glareColor?: string;
  intensity?: number;
}

export function TiltCard({
  children,
  className = "",
  glareColor = "#8FA596",
  intensity = 10,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -intensity,
      y: (x - 0.5) * intensity,
    });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.15 });
  }, [intensity]);

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}

      className={`relative ${className}`}
      style={{ perspective: 800, transformStyle: "preserve-3d", ...style }}
    >
      {children}
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${glareColor}${Math.round(glare.opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
        }}
      />
    </motion.div>
  );
}
