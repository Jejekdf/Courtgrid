"use client";

import { useState } from "react";
import { Copy, Check, MessageSquareShare, CalendarPlus, ExternalLink, Download, Printer } from "lucide-react";
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

  const statusText = isVerified ? t("dpPaidBadge") : t("awaitingBadge");
  const shareText = t("shareTextTemplate", {
    courtName,
    dateStr,
    startTime,
    endTime,
    totalPrice: totalPriceFormatted,
    dpAmount: dpAmountFormatted,
    ticketId,
    status: statusText,
  });

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
    title: t("calendarEventTitle", { courtName }),
    description: t("calendarEventDesc", {
      ticketId,
      courtName,
      startTime,
      endTime,
      status: statusText,
    }),
    location: "CourtGrid Sport Center Jakarta",
    dateStr: calendarDate,
    startTime,
    endTime,
  };

  const handleGoogleCalendar = () => {
    try {
      const url = generateGoogleCalendarUrl(calendarEvent);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error(t("googleCalendarFailed"));
    }
  };

  const handleDownloadIcs = () => {
    try {
      downloadIcsFile(calendarEvent, `courtgrid-${ticketId}.ics`);
      toast.success(t("icsDownloaded"));
    } catch {
      toast.error(t("icsDownloadFailed"));
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 sm:w-auto print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareWhatsApp}
        className="w-full sm:w-auto min-h-10 rounded-xl px-3 text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200/80 transition-colors shadow-2xs cursor-pointer justify-center"
        aria-label={t("shareWhatsApp")}
      >
        <MessageSquareShare className="size-4 mr-1.5 shrink-0" />
        <span className="truncate">{t("shareWhatsApp")}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopySummary}
        className="w-full sm:w-auto min-h-10 rounded-xl px-3 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border-zinc-200/80 transition-colors shadow-2xs cursor-pointer justify-center"
        aria-label={t("copySummary")}
      >
        {hasCopied ? (
          <>
            <Check className="size-4 mr-1.5 text-emerald-600 shrink-0" />
            <span className="truncate">{t("copiedBtn")}</span>
          </>
        ) : (
          <>
            <Copy className="size-4 mr-1.5 text-zinc-500 shrink-0" />
            <span className="truncate">{t("copySummary")}</span>
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center justify-center w-full sm:w-auto min-h-10 rounded-xl px-3 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200/80 transition-colors shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-950 outline-hidden"
          aria-label={t("saveToCalendarAria")}
        >
          <CalendarPlus className="size-4 mr-1.5 text-zinc-500 shrink-0" />
          <span className="truncate">{t("calendarBtn")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl bg-white border border-zinc-200 shadow-md p-1">
          <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer text-xs font-medium py-2 px-2.5 rounded-lg hover:bg-zinc-100 flex items-center transition-colors">
            <ExternalLink className="size-4 mr-2 text-zinc-500" />
            <span>{t("googleCalendar")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadIcs} className="cursor-pointer text-xs font-medium py-2 px-2.5 rounded-lg hover:bg-zinc-100 flex items-center transition-colors">
            <Download className="size-4 mr-2 text-zinc-500" />
            <span>{t("appleOutlookCalendar")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="w-full sm:w-auto min-h-10 rounded-xl px-3 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white border-zinc-200/80 transition-colors shadow-2xs cursor-pointer justify-center"
        aria-label={t("printPdfAria")}
      >
        <Printer className="size-4 mr-1.5 text-zinc-500 shrink-0" />
        <span className="truncate">{t("printPdfBtn")}</span>
      </Button>
    </div>
  );
}
