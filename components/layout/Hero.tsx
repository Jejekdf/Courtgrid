"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const bgImages = [
  "/futsal1.jpg",
  "/basket1.jpg",
  "/Futsal2.jpg",
  "/basket2.jpg",
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Timer untuk mengganti gambar setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      
      {/* --- BACKGROUND SLIDER --- */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.img
            key={currentIndex}
            src={bgImages[currentIndex]}
            alt="CourtGrid Venue"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        
        {/* Bright overlay so text-zinc-950 typography remains crisp and legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 z-10" />
      </div>

      {/* --- HERO CONTENT --- */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-3xl px-6">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-zinc-950 tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Pesan Lapangan Favoritmu dalam Hitungan Detik
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-zinc-500 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        >
          Platform booking venue olahraga terpercaya. Cari, pilih, dan mainkan tanpa ribet dengan konfirmasi instan.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <Button>Cari Lapangan</Button>
          <Button variant="secondary">Daftarkan Venue</Button>
        </motion.div>
      </div>

    </section>
  );
}
