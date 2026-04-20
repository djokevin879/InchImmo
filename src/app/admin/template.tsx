"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

export default function AdminTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1] // Subtle bezier
      }}
    >
      {children}
    </motion.div>
  );
}
