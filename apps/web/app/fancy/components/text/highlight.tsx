"use client";
import { motion } from "motion/react";
import { ReactNode, useEffect, useState } from "react";

const random = (from: number, to: number): number =>
  Math.floor(Math.random() * (to - from) + from);

interface HighlightProps {
  children: ReactNode;
  className?: string;
}

export const Highlight = ({
  children,
  className = "fill-accent/30",
}: HighlightProps) => {
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    const height = 50;
    const startY = random(-10, -5);
    const endY = random(-10, -5);

    const d = `
      M -10 ${startY}
      C ${random(20, 30)} ${random(-15, -5)},
        ${random(70, 80)} ${random(-15, -5)},
        110 ${endY}
      L 110 ${height + endY}
      C ${random(70, 80)} ${height + random(5, 15)},
        ${random(20, 30)} ${height + random(5, 15)},
        -10 ${height + startY}
      Z
    `;

    setPath(d);
  }, []);

  return (
    <motion.div
      className="relative inline-block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
    >
      <span className="relative z-[1]">{children}</span>
      <svg
        viewBox="-10 -20 120 140"
        preserveAspectRatio="none"
        className={`absolute inset-0 z-0 h-full w-full ${className}`}
      >
        <path d={path} />
      </svg>
    </motion.div>
  );
};
