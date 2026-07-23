"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Zap } from "lucide-react";

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
      
      {/* Blur Orbs for Soft Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/50 blur-[100px] z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-100/40 blur-[100px] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col items-center text-center">
        
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 mb-8 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-950">
            Sistem Anti-Palkor 2.0 Live
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-950 tracking-tight max-w-4xl leading-tight md:leading-tight lg:leading-tight mb-8"
        >
          Booking Lapangan Favoritmu dalam{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-zinc-950 to-zinc-500">
            Hitungan Detik
          </span>
        </motion.h1>

        {/* Hero Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-500 max-w-2xl leading-relaxed mb-10"
        >
          Platform reservasi venue olahraga paling dipercaya. Amankan slot latihanmu tanpa risiko jadwal bentrok dengan pembayaran instan yang aman.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="/schedule" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base group">
              Cek Jadwal Lapangan
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base bg-white">
              Daftar Akun
            </Button>
          </Link>
        </motion.div>

        {/* Trust Indicators / Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 pt-8 border-t border-zinc-200 w-full max-w-3xl mx-auto"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="text-2xl font-bold text-zinc-950">Real-time</h4>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tanpa Delay</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-1">
              <CalendarDays className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-2xl font-bold text-zinc-950">100%</h4>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Akurasi Jadwal</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-1">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full border-2 border-white bg-zinc-300" />
                <div className="w-5 h-5 rounded-full border-2 border-white bg-zinc-400" />
                <div className="w-5 h-5 rounded-full border-2 border-white bg-zinc-800" />
              </div>
            </div>
            <h4 className="text-2xl font-bold text-zinc-950">500+</h4>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tim Bergabung</span>
          </div>
        </motion.div>

        {/* Visual Showcase - Courts */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="mt-20 w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {images.map((src, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-xl overflow-hidden shadow-sm border border-zinc-200 aspect-video md:aspect-4/5 bg-zinc-100 ${idx % 2 !== 0 ? 'md:translate-y-8' : ''}`}
            >
              <Image 
                src={src} 
                alt="Sport Venue" 
                fill 
                className="object-cover transition-transform duration-700 hover:scale-105" 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-zinc-950/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
