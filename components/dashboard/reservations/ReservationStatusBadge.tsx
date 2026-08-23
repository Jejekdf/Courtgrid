import { CheckCircle2 } from "lucide-react";

interface ReservationStatusBadgeProps {
  status: string;
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const getBadgeClass = () => {
    switch (status) {
      case "DP_PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "DONE":
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
      default:
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider border ${getBadgeClass()}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

interface PaymentStatusBadgeProps {
  isVerified: boolean;
  reservationStatus: string;
}

export function PaymentStatusBadge({
  isVerified,
  reservationStatus,
}: PaymentStatusBadgeProps) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.6875rem] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="size-3 text-emerald-600" />
        VERIFIED (50% DP)
      </span>
    );
  }

  if (reservationStatus === "CANCELED") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[0.6875rem] font-mono font-bold bg-red-50 text-red-700 border border-red-200">
        HANGUS / BATAL
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[0.6875rem] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
      UNPAID
    </span>
  );
}
