'use client';
import { motion } from 'motion/react';

import { ReactNode, useEffect, useState } from 'react';

const random = (from: number, to: number): number =>
  Math.floor(Math.random() * (to - from) + from);

interface UnderlineProps {
  children: ReactNode;
}

export const Underline = ({ children }: UnderlineProps) => {
  const [path, setPath] = useState<string>('');
  const [strokeWidth, setStrokeWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(6); // Default height

  useEffect(() => {
    const newStrokeWidth = random(12, 18) / 200;
    const newHeight = random(1, 3) * 0.1;
    const lines = random(2, 4);
    let d = `M ${random(-5, 15)} ${random(-2, 2)}`;
    let line = 0;

    while (line++ < lines) {
      const y = line * (newHeight / lines);
      d +=
        ` Q ${random(30, 70)}` +
        ` ${random(y - 5, y + 5)}` +
        ` ${line % 2 === 0 ? random(-5, 15) : random(85, 105)}` +
        ` ${random(y - 2, y + 2)}`;
    }

    setPath(d);
    setStrokeWidth(newStrokeWidth);
    setHeight(newHeight);
  }, []); // Run once on mount

  return (
    <motion.div
      className="pen-stroke"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
    >
      <span className="underline-anchor">{children}</span>
      <svg
        viewBox={`0 0 100 ${height}`}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="underline-target absolute"
      >
        <path d={path} strokeWidth={`${strokeWidth}em`} />
      </svg>
    </motion.div>
  );
};
