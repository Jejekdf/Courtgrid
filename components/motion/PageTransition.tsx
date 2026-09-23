"use client";

import { motion, AnimatePresence, type Transition } from "motion/react";
import { usePathname } from "next/navigation";

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const pageTransition: Transition = {
  duration: 0.15,
  ease: "easeOut",
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
