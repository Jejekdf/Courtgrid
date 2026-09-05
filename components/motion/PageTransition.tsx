"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
  },
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 320,
  damping: 30,
  mass: 0.9,
};

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-full flex flex-col grow"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
