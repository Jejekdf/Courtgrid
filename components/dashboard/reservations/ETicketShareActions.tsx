"use client";

import { useState } from "react";
import { Copy, Check, MessageSquareShare, CalendarPlus, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { generateGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ETicketShareActionsProps {
  ticketId: string;
  courtName: string;
  dateStr: string;
  rawDateStr?: string;
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
  rawDateStr,
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
      toast.error(t("summaryCopyFailed"));
    }
  };

  const calendarDate = rawDateStr || dateStr;
  const calendarEvent = {
    title: `Booking Arena: ${courtName}`,
    description: `CourtGrid E-Ticket #${ticketId}\nArena: ${courtName}\nJam: ${startTime} - ${endTime} WIB\nStatus: ${isVerified ? "DP Lunas" : "Menunggu DP"}\nTunjukkan e-ticket ini saat tiba di lokasi.`,
    location: "CourtGrid Sport Center, Jakarta",
    dateStr: calendarDate,
    startTime,
    endTime,
  };

  const handleGoogleCalendar = () => {
    try {
      const url = generateGoogleCalendarUrl(calendarEvent);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Gagal membuka Google Calendar");
    }
  };

  const handleDownloadIcs = () => {
    try {
      downloadIcsFile(calendarEvent, `courtgrid-${ticketId}.ics`);
      toast.success("File kalender (.ics) berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh file kalender");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareWhatsApp}
        className="min-h-10 rounded-xl px-3.5 text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200/80 transition-colors shadow-2xs cursor-pointer"
        aria-label={t("shareWhatsApp")}
      >
        <MessageSquareShare className="size-4 mr-1.5 shrink-0" />
        <span>{t("shareWhatsApp")}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopySummary}
        className="min-h-10 rounded-xl px-3.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border-zinc-200/80 transition-colors shadow-2xs cursor-pointer"
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

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center justify-center min-h-10 rounded-xl px-3.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200/80 transition-colors shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-950 outline-none"
          aria-label="Simpan ke Kalender"
        >
          <CalendarPlus className="size-4 mr-1.5 text-zinc-500 shrink-0" />
          <span>Simpan Kalender</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl bg-white border border-zinc-200 shadow-md p-1">
          <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer text-xs font-medium py-2 px-2.5 rounded-lg hover:bg-zinc-100 flex items-center transition-colors">
            <ExternalLink className="size-4 mr-2 text-zinc-500" />
            <span>Google Calendar</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadIcs} className="cursor-pointer text-xs font-medium py-2 px-2.5 rounded-lg hover:bg-zinc-100 flex items-center transition-colors">
            <Download className="size-4 mr-2 text-zinc-500" />
            <span>Apple / Outlook (.ics)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
