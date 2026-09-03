"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminCheckInReservation } from "@/features/admin/actions";

interface AdminCheckInButtonProps {
  reservationId: string;
  status: string;
}

export function AdminCheckInButton({ reservationId, status }: AdminCheckInButtonProps) {
  const t = useTranslations("admin.eticket");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  if (currentStatus === "DONE") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-sm font-semibold">
        <CheckCircle2 className="size-4 text-emerald-600" />
        <span>{t("alreadyCheckedIn")}</span>
      </div>
    );
  }

  if (currentStatus === "CANCELED") {
    return null;
  }

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      const res = await adminCheckInReservation(reservationId);
      if (res.success) {
        toast.success(res.message || t("checkInSuccess"));
        setCurrentStatus("DONE");
        router.refresh();
      } else {
        toast.error(res.error || t("checkInFailed"));
      }
    } catch {
      toast.error(t("checkInFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckIn}
      isLoading={isLoading}
      disabled={isLoading || currentStatus !== "DP_PAID"}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
      leftIcon={<ShieldCheck className="size-4" />}
    >
      {t("checkInBtn")}
    </Button>
  );
}
