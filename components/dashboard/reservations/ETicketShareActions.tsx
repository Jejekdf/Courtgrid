"use client";

import { useState } from "react";
import { Copy, Check, MessageSquareShare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ETicketShareActionsProps {
  ticketId: string;
  courtName: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  totalPriceFormatted: string;
  dpAmountFormatted: string;
  isVerified: boolean;
}

export default function ETicketShareActions({
  ticketId,
  courtName,
  dateStr,
  startTime,
  endTime,
  totalPriceFormatted,
  dpAmountFormatted,
  isVerified,
}: ETicketShareActionsProps) {
  const t = useTranslations("dashboard.eticket");
  const [hasCopied, setHasCopied] = useState(false);

  const shareText = `*CourtGrid E-Ticket Reservasi*\nArena: ${courtName}\nTanggal: ${dateStr}\nJam: ${startTime} - ${endTime} WIB\nTotal: ${totalPriceFormatted} (DP: ${dpAmountFormatted})\nKode Tiket: #${ticketId}\nStatus: ${isVerified ? "DP Lunas" : "Menunggu DP"}\n\nTunjukkan tiket ini ke petugas saat tiba di GOR.`;

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setHasCopied(true);
      toast.success(t("summaryCopied"));
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin rincian tiket.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareWhatsApp}
        className="min-h-10 rounded-xl px-3.5 text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200/80 transition-colors shadow-2xs"
        aria-label={t("shareWhatsApp")}
      >
        <MessageSquareShare className="size-4 mr-1.5 shrink-0" />
        <span>{t("shareWhatsApp")}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopySummary}
        className="min-h-10 rounded-xl px-3.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border-zinc-200/80 transition-colors shadow-2xs"
        aria-label={t("copySummary")}
      >
        {hasCopied ? (
          <>
            <Check className="size-4 mr-1.5 text-emerald-600 shrink-0" />
            <span>Tersalin</span>
          </>
        ) : (
          <>
            <Copy className="size-4 mr-1.5 text-zinc-500 shrink-0" />
            <span>{t("copySummary")}</span>
          </>
        )}
      </Button>
    </div>
  );
}
