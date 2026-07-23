"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Info, Clock, CheckCircle, ShieldCheck } from "lucide-react";
import { getCourts, getCourtAvailability } from "@/actions/court";
import { Input } from "@/components/ui/Input";

type Court = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
};

type ReservationSlot = {
  startTime: string;
  endTime: string;
  status: string;
};

// Generate time slots from 08:00 to 22:00
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

export default function CourtBookingSystem() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [availability, setAvailability] = useState<ReservationSlot[]>([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    async function loadCourts() {
      try {
        const data = await getCourts();
        setCourts(data);
        if (data.length > 0) {
          setSelectedCourt(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingCourts(false);
      }
    }
    loadCourts();
  }, []);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      async function loadAvailability() {
        setIsLoadingAvailability(true);
        try {
          const data = await getCourtAvailability(selectedCourt!.id, selectedDate);
          setAvailability(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingAvailability(false);
        }
      }
      loadAvailability();
    }
  }, [selectedCourt, selectedDate]);

  const getSlotStatus = (time: string) => {
    const slot = availability.find((res) => res.startTime === time);
    if (!slot) return "AVAILABLE";
    return slot.status;
  };

  const totalSlots = TIME_SLOTS.length;
  const bookedSlotsCount = availability.filter((res) =>
    ["PENDING", "DP_PAID", "DONE"].includes(res.status)
  ).length;
  const availableSlotsCount = totalSlots - bookedSlotsCount;

  if (isLoadingCourts) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-950" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Title & Info */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
          Cek Ketersediaan Lapangan
        </h2>
        <p className="text-zinc-500">
          Gunakan fitur ini untuk melihat jadwal lapangan yang kosong secara real-time sebelum melakukan booking via admin atau login.
        </p>
      </div>

      {/* Informational Status Card for Today/Selected Date */}
      {selectedCourt && (
        <div className="bg-zinc-950 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-zinc-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Sistem Anti-Palkor Aktif
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {selectedCourt.name} <span className="text-zinc-400 text-lg font-medium">({selectedCourt.type})</span>
            </h3>
            <p className="text-sm text-zinc-400">
              Ketersediaan untuk tanggal: {format(new Date(selectedDate), "dd MMMM yyyy")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <div className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium backdrop-blur-md">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>{availableSlotsCount} Jam Tersedia</span>
            </div>
            {bookedSlotsCount > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium backdrop-blur-md">
                <Clock className="h-5 w-5 text-amber-400" />
                <span>{bookedSlotsCount} Jam Terisi</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Court Selection */}
      <section className="space-y-5">
        <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-sm">1</div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Pilih Lapangan
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => {
            const isSelected = selectedCourt?.id === court.id;
            return (
              <div
                key={court.id}
                onClick={() => setSelectedCourt(court)}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-50 shadow-md ring-1 ring-zinc-950"
                    : "border-zinc-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold tracking-tight text-zinc-950">
                      {court.name}
                    </h3>
                    <span className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-600 text-[10px] rounded-md uppercase font-bold tracking-wider">
                      {court.type}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-200/60">
                  <p className="text-sm font-medium text-zinc-500">Mulai dari</p>
                  <p className="text-lg font-bold text-zinc-950">
                    Rp {court.pricePerHour.toLocaleString("id-ID")} <span className="text-sm font-normal text-zinc-500">/ jam</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Date Selection */}
      <section className="space-y-5">
        <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-sm">2</div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Pilih Tanggal
          </h2>
        </div>
        <div className="max-w-xs">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={format(new Date(), "yyyy-MM-dd")}
            max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
            leftIcon={<CalendarIcon className="h-5 w-5 text-zinc-500" />}
            className="h-12 bg-white"
          />
        </div>
      </section>

      {/* 3. Time Slot Grid */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-sm">3</div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              Ketersediaan Waktu
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-200">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-white border border-zinc-300 rounded-sm"></div>
              <span>Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-sm"></div>
              <span>DP/Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-zinc-100 border border-zinc-200 rounded-sm"></div>
              <span>Penuh</span>
            </div>
          </div>
        </div>

        {isLoadingAvailability ? (
          <div className="py-20 flex justify-center bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {TIME_SLOTS.map((time) => {
              const status = getSlotStatus(time);
              const isAvailable = status === "AVAILABLE";

              let styleClasses = "h-14 rounded-xl text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ";

              if (status === "PENDING" || status === "DP_PAID") {
                styleClasses += "bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed";
              } else if (!isAvailable) {
                styleClasses += "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed line-through opacity-70";
              } else {
                styleClasses += "bg-white border border-zinc-200 text-zinc-950 hover:border-zinc-950 hover:bg-zinc-50 shadow-sm cursor-default";
              }

              return (
                <div
                  key={time}
                  className={styleClasses}
                >
                  <span>{time}</span>
                  <span className="text-[10px] uppercase opacity-70">
                    {isAvailable ? "Kosong" : (status === "PENDING" || status === "DP_PAID") ? "Pending" : "Booked"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
