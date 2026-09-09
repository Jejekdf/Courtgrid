import Image from "next/image";
import { Image as ImageIcon, Pencil, Power, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRupiah } from "@/lib/utils";

export type AdminCourt = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  isActive: boolean;
  imageUrl?: string | null;
};

interface CourtCardProps {
  court: AdminCourt;
  onToggleActive: (court: AdminCourt) => void;
  onEdit: (court: AdminCourt) => void;
  onDelete: (id: string) => void;
}

export function CourtCard({ court, onToggleActive, onEdit, onDelete }: CourtCardProps) {
  const t = useTranslations("admin.courts");

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col hover:border-zinc-950 transition-colors">
      <div className="relative h-44 sm:h-48 bg-zinc-100 border-b border-zinc-200 flex items-center justify-center overflow-hidden">
        {court.imageUrl ? (
          <Image
            src={court.imageUrl}
            alt={court.name}
            fill
            unoptimized={court.imageUrl.startsWith("http")}
            className="object-cover"
            sizes="(min-width: 1024px) 33vw,(min-width: 640px) 50vw,100vw"
          />
        ) : (
          <div className="text-sm text-zinc-400 font-mono flex items-center gap-1">
            <ImageIcon className="size-3.5" />
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-950">{court.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
              {court.type}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${
              court.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {court.isActive ? t("tabActive") : t("inactiveBadge")}
          </span>
        </div>
        <div className="text-sm text-zinc-600">
          <div className="flex justify-between items-baseline">
            <span className="text-zinc-500">{t("perHour")}</span>
            <span className="text-base font-bold font-mono text-zinc-950">{formatRupiah(court.pricePerHour)}</span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-zinc-100">
          <button
            onClick={() => onToggleActive(court)}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-10 rounded-lg border text-xs sm:text-sm font-semibold transition-colors border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <Power className={`size-3.5 ${court.isActive ? "text-red-600" : "text-emerald-600"}`} />
            <span>{court.isActive ? t("deactivateBtn") : t("activateBtn")}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(court)}
              className="min-h-10 min-w-10 p-2 flex items-center justify-center text-zinc-600 hover:text-zinc-950 transition-colors border border-zinc-200 rounded-lg cursor-pointer"
              aria-label={t("editAria")}
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => onDelete(court.id)}
              className="min-h-10 min-w-10 p-2 flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors border border-red-200 rounded-lg cursor-pointer"
              aria-label={t("deleteAria")}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
