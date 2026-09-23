"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, WifiOff, ArrowRight } from "lucide-react";
import { addDays, format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNetworkState } from "@react-hookz/web";
import { createReservationAction } from "@/features/reservations/actions";
import { getCourts, getCourtAvailability } from "@/features/courts/actions";
import { courtKeys } from "@/lib/query-keys";
import { useAvailabilityRealtime } from "@/components/dashboard/useAvailabilityRealtime";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { BookingDateSelector } from "./booking/BookingDateSelector";
import { CourtSelector } from "./booking/CourtSelector";
import { TimeSlotPicker } from "./booking/TimeSlotPicker";
import { BookingSummaryPanel } from "./booking/BookingSummaryPanel";
import { BookingPreviewModal } from "./booking/BookingPreviewModal";

import { useTranslations } from "next-intl";
import { getJakartaNow } from "@/lib/timezone";

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
  const tVal = useTranslations("validation");
  const tFlow = useTranslations("dashboard.book");
  const tFlowSummary = useTranslations("dashboard.bookingFlow");
  const [paymentStatus, setPaymentStatus] = useQueryState("payment", parseAsString);
  const [courtId, setCourtId] = useQueryState("courtId", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [urlDate] = useQueryState("date", parseAsString);
  const [urlTime] = useQueryState("time", parseAsString);

  const network = useNetworkState();
  const isOnline = network.online ?? true;

  const [selectedDate, setSelectedDate] = useState<string>(
    () => urlDate || getJakartaNow().dateStr
  );
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(
    () => (urlTime ? [urlTime] : [])
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch active courts for selector
  const { data: courts = [], isLoading: isLoadingCourts } = useQuery({
    queryKey: courtKeys.all,
    queryFn: async () => {
      const res = await getCourts();
      return res as Court[];
    },
  });

  // Fallback to first available court if none explicitly chosen
  const activeCourt = useMemo(() => {
    if (courtId) {
      return courts.find((c) => c.id === courtId) || courts[0] || null;
    }
    return courts[0] || null;
  }, [courts, courtId]);

  const activeCourtId = activeCourt?.id || "";

  // Fetch slot availability for selected court and date
  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery(
    {
      queryKey: courtKeys.availability(activeCourtId, selectedDate),
      queryFn: async () => {
        if (!activeCourtId) return [];
        const res = await getCourtAvailability(activeCourtId, selectedDate);
        return res;
      },
      enabled: !!activeCourtId && !!selectedDate,
    }
  );

  // Live refresh: invalidate availability when any slot changes on this court/date
  useAvailabilityRealtime(activeCourtId, selectedDate);

  const handleSelectCourt = (court: Court) => {
    setCourtId(court.id);
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

  // Determine whether each hourly slot is in the past, pending, paid, or available
  const getSlotStatus = useMemo(() => {
    const { dateStr: todayStr, hour: currentHour } = getJakartaNow();

    return (time: string) => {
      const tHour = parseInt(time.split(":")[0], 10);

      if (selectedDate === todayStr && tHour <= currentHour) {
        return "PAST";
      }

      const slot = availability.find(
        (res: { startTime: string; endTime: string; status: string }) => {
          const sHour = parseInt(res.startTime.split(":")[0], 10);
          const eHour = parseInt(res.endTime.split(":")[0], 10);
          return tHour >= sHour && tHour < eHour;
        }
      );

      if (!slot) return "AVAILABLE";
      return slot.status as "AVAILABLE" | "PENDING" | "DP_PAID" | "PAST" | "UNAVAILABLE";
    };
  }, [availability, selectedDate]);

  // Submit reservation and proceed to Stripe checkout
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!isOnline) {
        throw new Error(tFlow("offlineToast"));
      }
      if (selectedTimeSlots.length === 0 || !activeCourt)
        throw new Error(tVal("emptyTimeSlots"));

      const sortedSlots = [...selectedTimeSlots].sort();
      const startHour = parseInt(sortedSlots[0].split(":")[0], 10);
      const endHour =
        parseInt(sortedSlots[sortedSlots.length - 1].split(":")[0], 10) + 1;
      const duration = endHour - startHour;

      if (duration !== sortedSlots.length) {
        throw new Error(tVal("contiguousTimeSlots"));
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
        throw new Error(result.error || tFlow("failFallback"));
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.url) {
        toast.success(tFlow("redirectToast"));
        router.replace(result.url);
      }
    },
    onError: (err) => {
      toast.error(tFlow("failTitle"), {
        description: err instanceof Error ? err.message : tFlow("failFallback"),
      });
    },
  });

  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success(tFlow("successToast"));
      setPaymentStatus(null);
      router.replace("/dashboard/reservations");
    } else if (paymentStatus === "cancel") {
      toast.error(tFlow("cancelToast"));
      setPaymentStatus(null);
      router.replace("/dashboard/book");
    }
  }, [paymentStatus, router, setPaymentStatus, tFlow]);

  if (isLoadingCourts) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-950" />
        <p className="text-sm text-zinc-500 font-mono">
          {tFlow("loadingCourts")}
        </p>
      </div>
    );
  }

  const { dateStr: todayStr } = getJakartaNow();
  const todayDate = new Date(`${todayStr}T00:00:00+07:00`);
  const tomorrowStr = format(addDays(todayDate, 1), "yyyy-MM-dd");
  const dayAfterTomorrowStr = format(addDays(todayDate, 2), "yyyy-MM-dd");

  const totalPrice = activeCourt
    ? selectedTimeSlots.length * activeCourt.pricePerHour
    : 0;
  const dpAmount = Math.ceil(totalPrice / 2);
  const remainingCash = totalPrice - dpAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 max-w-7xl mx-auto text-zinc-950 pb-24 lg:pb-0"
    >
      {!isOnline && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 shadow-xs">
          <WifiOff className="size-4 shrink-0 text-amber-600" />
          <span>{tFlow("offlineWarning")}</span>
        </div>
      )}

      <BookingDateSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        todayStr={todayStr}
        tomorrowStr={tomorrowStr}
        dayAfterTomorrowStr={dayAfterTomorrowStr}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <CourtSelector
            courts={courts}
            activeCourt={activeCourt}
            onSelectCourt={handleSelectCourt}
          />

          <TimeSlotPicker
            courtName={activeCourt?.name || "Lapangan"}
            timeSlots={TIME_SLOTS}
            selectedTimeSlots={selectedTimeSlots}
            isLoadingAvailability={isLoadingAvailability}
            getSlotStatus={getSlotStatus}
            onToggleSlot={toggleTimeSlot}
          />
        </div>

        {/* Desktop Sticky Summary Panel */}
        <div className="hidden lg:block">
          <BookingSummaryPanel
            activeCourt={activeCourt}
            selectedDate={selectedDate}
            selectedTimeSlots={selectedTimeSlots}
            totalPrice={totalPrice}
            dpAmount={dpAmount}
            remainingCash={remainingCash}
            voucherCode={voucherCode}
            onVoucherChange={setVoucherCode}
            onOpenPreview={() => setShowPreviewModal(true)}
            isLoading={bookingMutation.isPending || !isOnline}
          />
        </div>
      </div>

      {/* Mobile Inline Summary (visible when scrolling down on phone/tablet) */}
      <div className="block lg:hidden">
        <BookingSummaryPanel
          activeCourt={activeCourt}
          selectedDate={selectedDate}
          selectedTimeSlots={selectedTimeSlots}
          totalPrice={totalPrice}
          dpAmount={dpAmount}
          remainingCash={remainingCash}
          voucherCode={voucherCode}
          onVoucherChange={setVoucherCode}
          onOpenPreview={() => setShowPreviewModal(true)}
          isLoading={bookingMutation.isPending || !isOnline}
          hideActionOnMobile
        />
      </div>

      {/* Mobile Sticky Bottom Action Bar when slots are chosen */}
      <AnimatePresence>
        {selectedTimeSlots.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg lg:hidden"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-500 truncate font-sans">
                  {selectedTimeSlots.length} Jam • {activeCourt?.name}
                </p>
                <div className="flex items-baseline gap-1.5 font-sans">
                  <span className="text-base sm:text-lg font-extrabold text-zinc-950 tabular-nums">
                    {formatRupiah(dpAmount)}
                  </span>
                  <span className="text-[0.6875rem] font-bold text-emerald-600 uppercase">
                    DP 50%
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                disabled={bookingMutation.isPending || !isOnline}
                className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 min-h-11 disabled:opacity-50 font-sans"
              >
                <span>{tFlowSummary("payButton")}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingPreviewModal
        isOpen={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        activeCourt={activeCourt}
        selectedDate={selectedDate}
        selectedTimeSlots={selectedTimeSlots}
        totalPrice={totalPrice}
        dpAmount={dpAmount}
        remainingCash={remainingCash}
        voucherCode={voucherCode}
        onConfirm={async () => {
          if (!isOnline) {
            toast.error(tFlow("offlineToast"));
            return;
          }
          setShowPreviewModal(false);
          bookingMutation.mutate();
        }}
        isLoading={bookingMutation.isPending}
      />
    </motion.div>
  );
}
