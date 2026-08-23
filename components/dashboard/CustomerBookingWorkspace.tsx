"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { format, addDays } from "date-fns";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createReservationAction } from "@/features/reservations/actions";
import { getCourts, getCourtAvailability } from "@/features/courts/actions";
import { courtKeys } from "@/lib/query-keys";
import { useAvailabilityRealtime } from "@/components/dashboard/useAvailabilityRealtime";
import { toast } from "sonner";
import { BookingDateSelector } from "./booking/BookingDateSelector";
import { CourtSelector } from "./booking/CourtSelector";
import { TimeSlotPicker } from "./booking/TimeSlotPicker";
import { BookingSummaryPanel } from "./booking/BookingSummaryPanel";
import { BookingPreviewModal } from "./booking/BookingPreviewModal";

import { useTranslations } from "next-intl";

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
  const [paymentStatus, setPaymentStatus] = useQueryState("payment", parseAsString);
  const [urlCourtId] = useQueryState("courtId", parseAsString);

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(urlCourtId);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
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
    if (selectedCourtId) {
      return courts.find((c) => c.id === selectedCourtId) || courts[0] || null;
    }
    return courts[0] || null;
  }, [courts, selectedCourtId]);

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

  // Determine whether each hourly slot is in the past, pending, paid, or available
  const getSlotStatus = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const currentHour = new Date().getHours();

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

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const dayAfterTomorrowStr = format(addDays(new Date(), 2), "yyyy-MM-dd");

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
      className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950"
    >
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
          isLoading={bookingMutation.isPending}
        />
      </div>

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
          setShowPreviewModal(false);
          bookingMutation.mutate();
        }}
        isLoading={bookingMutation.isPending}
      />
    </motion.div>
  );
}
