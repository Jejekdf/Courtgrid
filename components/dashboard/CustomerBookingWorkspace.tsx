"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Tag,
  Zap,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createReservationAction } from "@/features/reservations/actions";
import { getCourts, getCourtAvailability } from "@/features/courts/actions";
import { courtKeys } from "@/lib/query-keys";
import { useAvailabilityRealtime } from "@/components/dashboard/useAvailabilityRealtime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

export type Court = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  imageUrl?: string | null;
};

export default function CustomerBookingWorkspace() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // 1. TanStack Query: Fetch Active Courts
  const { data: courts = [], isLoading: isLoadingCourts } = useQuery({
    queryKey: courtKeys.all,
    queryFn: async () => {
      const res = await getCourts();
      return res as Court[];
    },
  });

  // Auto select first court
  const activeCourt = useMemo(() => {
    if (selectedCourtId) {
      return courts.find((c) => c.id === selectedCourtId) || courts[0] || null;
    }
    return courts[0] || null;
  }, [courts, selectedCourtId]);

  const activeCourtId = activeCourt?.id || "";

  // 2. TanStack Query: Fetch Availability
  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: courtKeys.availability(activeCourtId, selectedDate),
    queryFn: async () => {
      if (!activeCourtId) return [];
      const res = await getCourtAvailability(activeCourtId, selectedDate);
      return res;
    },
    enabled: !!activeCourtId && !!selectedDate,
  });

  // Live refresh: invalidate availability when any slot changes on this court/date
  useAvailabilityRealtime(activeCourtId, selectedDate);

  const handleSelectCourt = (court: Court) => {
    setSelectedCourtId(court.id);
    setSelectedTimeSlots([]);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlots([]);
  };

  const toggleTimeSlot = (time: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      }
      return [...prev, time];
    });
  };

  // Determine slot status (PAST / PENDING / DP_PAID / AVAILABLE)
  const getSlotStatus = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const currentHour = new Date().getHours();

    return (time: string) => {
      const tHour = parseInt(time.split(":")[0], 10);

      if (selectedDate === todayStr && tHour <= currentHour) {
        return "PAST";
      }

      const slot = availability.find((res: { startTime: string; endTime: string; status: string }) => {
        const sHour = parseInt(res.startTime.split(":")[0], 10);
        const eHour = parseInt(res.endTime.split(":")[0], 10);
        return tHour >= sHour && tHour < eHour;
      });

      if (!slot) return "AVAILABLE";
      return slot.status;
    };
  }, [availability, selectedDate]);

  // 3. TanStack Mutation: Create Reservation Action
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (selectedTimeSlots.length === 0 || !activeCourt) throw new Error("Pilihan jam kosong.");

      const sortedSlots = [...selectedTimeSlots].sort();
      const startHour = parseInt(sortedSlots[0].split(":")[0], 10);
      const endHour = parseInt(sortedSlots[sortedSlots.length - 1].split(":")[0], 10) + 1;
      const duration = endHour - startHour;

      if (duration !== sortedSlots.length) {
        throw new Error("Jam main yang dipilih harus berurutan tanpa jeda.");
      }

      const startTime = sortedSlots[0];
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;
      const totalPrice = sortedSlots.length * activeCourt.pricePerHour;

      const result = await createReservationAction({
        courtId: activeCourt.id,
        dateStr: selectedDate,
        startTime,
        endTime,
        totalPrice,
        voucherCode: voucherCode.trim() || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Gagal memproses booking.");
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.url) {
        toast.success("Mengarahkan ke pembayaran DP (Stripe)...");
        router.replace(result.url);
      }
    },
    onError: (err) => {
      toast.error("Pemesanan Gagal", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
      });
    },
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("payment");
    if (status === "success") {
      toast.success("Pembayaran DP Berhasil! E-Ticket telah terbit.");
      router.replace("/dashboard/reservations");
    } else if (status === "cancel") {
      toast.error("Pembayaran dibatalkan.");
      router.replace("/dashboard/book");
    }
  }, [router]);

  if (isLoadingCourts) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-950" />
        <p className="text-sm text-zinc-500 font-mono">Memuat daftar arena & ketersediaan...</p>
      </div>
    );
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const dayAfterTomorrowStr = format(addDays(new Date(), 2), "yyyy-MM-dd");

  const totalPrice = activeCourt ? selectedTimeSlots.length * activeCourt.pricePerHour : 0;
  const dpAmount = Math.ceil(totalPrice / 2);
  const remainingCash = totalPrice - dpAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 max-w-7xl mx-auto text-zinc-950"
    >
      {/* Top Filter Bar: Date & Quick Selectors */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Tentukan Tanggal Main</h2>
            <p className="text-sm text-zinc-500 font-mono">
              {format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectDate(todayStr)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedDate === todayStr
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handleSelectDate(tomorrowStr)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedDate === tomorrowStr
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
            }`}
          >
            Besok
          </button>
          <button
            type="button"
            onClick={() => handleSelectDate(dayAfterTomorrowStr)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedDate === dayAfterTomorrowStr
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
            }`}
          >
            Lusa
          </button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleSelectDate(e.target.value)}
            min={todayStr}
            max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
            className="h-10 text-sm bg-zinc-50 border-zinc-200 rounded-xl font-mono max-w-36"
          />
        </div>
      </div>

      {/* Main Workspace Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2-Columns: Arena Cards & Slot Selector */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Arena Selection Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                1. Pilih Lapangan Arena
              </h3>
              <span className="text-sm text-zinc-500 font-mono">{courts.length} Arena Aktif</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courts.map((court) => {
                const isSelected = activeCourt?.id === court.id;

                return (
                  <div
                    key={court.id}
                    onClick={() => handleSelectCourt(court)}
                    className={`group relative p-5 rounded-2xl border transition-[border-color,box-shadow,background-color] duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "border-zinc-950 bg-white shadow-md ring-2 ring-zinc-950/10"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-950 text-white rounded-full text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>DIPILIH</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="inline-block px-2.5 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 text-[11px] font-mono font-bold uppercase tracking-wider rounded-md">
                        {court.type}
                      </span>
                      <h4 className="font-extrabold text-zinc-950 text-lg group-hover:text-emerald-700 transition-colors">
                        {court.name}
                      </h4>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-sm text-zinc-500 font-mono">Tarif Per Jam</span>
                      <span className="text-base font-extrabold text-zinc-950">
                        Rp {court.pricePerHour.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Interactive Time Slot Selector Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-600" />
                2. Pilih Jam Main ({activeCourt?.name || "Lapangan"})
              </h3>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-white border border-zinc-300"></span> Kosong
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span> Dipilih
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-100 border border-amber-300"></span> Terisi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-zinc-200 opacity-60"></span> Lewat
                </span>
              </div>
            </div>

            {isLoadingAvailability ? (
              <div className="py-20 flex flex-col items-center justify-center bg-zinc-50/50 rounded-2xl border border-zinc-200 border-dashed space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                <span className="text-sm text-zinc-400 font-mono">Mengecek jadwal jam main...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {TIME_SLOTS.map((time) => {
                  const status = getSlotStatus(time);
                  const isAvailable = status === "AVAILABLE";
                  const isPast = status === "PAST";
                  const isSelected = selectedTimeSlots.includes(time);

                  let btnClasses =
                    "h-14 rounded-xl text-xs font-bold transition-colors duration-150 flex flex-col items-center justify-center select-none cursor-pointer ";

                  if (isPast) {
                    btnClasses +=
                      "bg-zinc-100 text-zinc-400 border border-zinc-200/80 cursor-not-allowed opacity-50 line-through";
                  } else if (status === "PENDING" || status === "DP_PAID") {
                    btnClasses +=
                      "bg-amber-50 text-amber-800 border border-amber-200/80 cursor-not-allowed";
                  } else if (!isAvailable) {
                    btnClasses +=
                      "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed line-through opacity-60";
                  } else if (isSelected) {
                    btnClasses +=
                      "bg-zinc-950 text-white shadow-md border-transparent ring-2 ring-zinc-950/20 active:scale-95";
                  } else {
                    btnClasses +=
                      "bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-950 hover:bg-zinc-50 active:scale-95";
                  }

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => toggleTimeSlot(time)}
                      className={btnClasses}
                    >
                      <span className="font-mono text-sm">{time}</span>
                      <span className="text-[11px] block leading-tight mt-0.5 font-mono opacity-80">
                        {isPast
                          ? "Lewat"
                          : isSelected
                          ? "Dipilih"
                          : status === "PENDING" || status === "DP_PAID"
                          ? "Terisi"
                          : "Kosong"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1-Column: Live Checkout Summary Panel */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-6 sticky top-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-zinc-950" />
              <h3 className="font-extrabold text-base text-zinc-950">Ringkasan Sewa</h3>
            </div>
            <span className="text-[11px] font-mono font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
              STRIPE ONLINE
            </span>
          </div>

          {activeCourt && selectedTimeSlots.length > 0 ? (
            <div className="space-y-5">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 font-mono">Arena Lapangan:</span>
                  <span className="font-bold text-zinc-950">
                    {activeCourt.name} ({activeCourt.type})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 font-mono">Tanggal Main:</span>
                  <span className="font-semibold text-zinc-800 font-mono">
                    {format(new Date(selectedDate), "dd MMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 font-mono">Total Durasi:</span>
                  <span className="font-bold text-zinc-950 font-mono">
                    {selectedTimeSlots.length} Jam Sesi
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500 font-mono">Total Harga Sewa:</span>
                  <span className="font-extrabold text-zinc-950">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Voucher Code Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 font-mono uppercase tracking-wider">
                  Kode Voucher Diskon (Opsional)
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Masukkan kode voucher..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="h-9 pl-8 text-xs font-mono uppercase bg-zinc-50 border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              {/* DP 50% Highlight Card */}
              <div className="p-4 bg-zinc-950 text-white rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Wajib DP Online (50%):
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">
                    Rp {dpAmount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-300 pt-2 border-t border-zinc-800 font-mono">
                  <span>Pelunasan di GOR:</span>
                  <span className="font-bold text-zinc-200">
                    Rp {remainingCash.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowPreviewModal(true)}
                isLoading={bookingMutation.isPending}
                disabled={bookingMutation.isPending}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-12 text-sm rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <span>Pratinjau & Bayar DP</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-zinc-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-zinc-700">Belum Ada Jam Dipilih</p>
                <p className="text-sm text-zinc-500 mt-1 max-w-48 mx-auto">
                  Silakan pilih arena dan minimal 1 jam sesi main di sebelah kiri.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-zinc-950">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Konfirmasi & Pratinjau Booking</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Periksa kembali rincian reservasi lapangan Anda sebelum melanjutkan ke pembayaran DP 50% via Stripe.
            </DialogDescription>
          </DialogHeader>

          {activeCourt && selectedTimeSlots.length > 0 && (
            <div className="space-y-5 pt-2">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                  <span className="text-zinc-500 font-mono">Arena Lapangan:</span>
                  <span className="font-bold text-zinc-950">
                    {activeCourt.name} ({activeCourt.type})
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                  <span className="text-zinc-500 font-mono">Tanggal Main:</span>
                  <span className="font-bold text-zinc-950 font-mono">
                    {format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                  <span className="text-zinc-500 font-mono">Jam Sesi:</span>
                  <span className="font-mono font-bold text-zinc-950">
                    {selectedTimeSlots[0]} -{" "}
                    {`${(
                      parseInt(selectedTimeSlots[selectedTimeSlots.length - 1].split(":")[0], 10) +
                      1
                    )
                      .toString()
                      .padStart(2, "0")}:00`}{" "}
                    WIB
                  </span>
                </div>
                {voucherCode.trim() && (
                  <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                    <span className="text-zinc-500 font-mono">Voucher Diskon:</span>
                    <span className="font-mono font-bold text-emerald-600">{voucherCode.trim()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-sm font-bold text-zinc-950">
                  <span>Total Biaya Sewa:</span>
                  <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="bg-zinc-950 text-white rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-emerald-400 font-mono">
                  <span>Wajib DP 50% (Stripe Online):</span>
                  <span>Rp {dpAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-zinc-300 pt-1 border-t border-zinc-800 font-mono">
                  <span>Sisa Pelunasan di GOR:</span>
                  <span className="font-bold text-zinc-200">
                    Rp {remainingCash.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 text-sm cursor-pointer rounded-xl"
                >
                  Batal / Kembali
                </Button>
                <Button
                  onClick={async () => {
                    setShowPreviewModal(false);
                    bookingMutation.mutate();
                  }}
                  isLoading={bookingMutation.isPending}
                  disabled={bookingMutation.isPending}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer rounded-xl"
                >
                  Lanjut Bayar DP
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
