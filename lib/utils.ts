import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function safeFormatDate(
  dateVal: string | Date | null | undefined,
  pattern: string = "dd MMMM yyyy",
  fallback: string = "-"
): string {
  if (!dateVal) return fallback;
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return fallback;
    return format(d, pattern, { locale: id });
  } catch {
    return fallback;
  }
}
