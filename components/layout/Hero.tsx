"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Zap, ShieldCheck } from "lucide-react";

export default function Hero() {
  const images = [
    "/futsal1.png",
    "/badminton1.png",
    "/futsal2.png",
    "/badminton2.png",
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-40 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28 flex flex-col items-center text-center">
        
        {/* Anti-Slop Clean Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 mb-8 shadow-xs"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950">
            Sistem Anti-Palkor 2.0 Realtime
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-zinc-950 tracking-tight max-w-5xl leading-[1.1] mb-6"
        >
          Pesan Lapangan Olahraga Favoritmu Tanpa Risiko Double Booking
        </motion.h1>

        {/* Hero Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="text-base md:text-lg text-zinc-500 max-w-2xl leading-relaxed mb-10 font-sans"
        >
          Platform reservasi arena futsal dan badminton terlengkap. Garansi jadwal 100% akurat dengan pembayaran DP 50% via Stripe & QRIS.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Link href="/dashboard/book" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-xs font-bold h-12 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl shadow-xs cursor-pointer group">
              <span>Cek Jadwal Lapangan</span>
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover-fine:translate-x-1 text-white" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xs font-bold h-12 px-6 bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-50 rounded-xl cursor-pointer">
              Daftar Akun Baru
            </Button>
          </Link>
        </motion.div>

        {/* Trust Indicators / Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 pt-8 border-t border-zinc-200/80 w-full max-w-3xl mx-auto"
        >
          <div className="flex flex-col items-center text-center gap-1.5">
            <Zap className="w-5 h-5 text-zinc-950 mb-1" aria-hidden />
            <span className="text-xl font-extrabold text-zinc-950 font-mono">Real-time</span>
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Slot Langsung Terkunci</span>
          </div>

          <div className="flex flex-col items-center text-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" aria-hidden />
            <span className="text-xl font-extrabold text-zinc-950 font-mono">100%</span>
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Bebas Palkor / Bentrok</span>
          </div>

          <div className="flex flex-col items-center text-center gap-1.5 col-span-2 md:col-span-1">
            <CalendarDays className="w-5 h-5 text-zinc-950 mb-1" aria-hidden />
            <span className="text-xl font-extrabold text-zinc-950 font-mono">5 Lapangan</span>
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Futsal & Badminton</span>
          </div>
        </motion.div>

        {/* Visual Showcase - Courts */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
          className="mt-16 w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {images.map((src, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-2xl overflow-hidden shadow-xs border border-zinc-200/80 aspect-video md:aspect-4/5 bg-zinc-100 ${idx % 2 !== 0 ? 'md:translate-y-6' : ''}`}
            >
              <Image 
                src={src} 
                alt="Sport Arena CourtGrid" 
                fill 
                className="object-cover transition-transform duration-500 hover-fine:scale-105" 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-zinc-950/50 via-transparent to-transparent opacity-0 hover-fine:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">GOR CourtGrid Arena</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
