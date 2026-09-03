import Image from "next/image";
import { Image as ImageIcon, Pencil, Power, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
      <div className="relative h-36 bg-zinc-100 border-b border-zinc-200 flex items-center justify-center overflow-hidden">
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
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">{court.name}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
              {court.type}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider ${
              court.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {court.isActive ? t("tabActive") : t("inactiveBadge")}
          </span>
        </div>
        <div className="text-sm text-zinc-600">
          <div className="flex justify-between">
            <span className="text-zinc-400">{t("perHour")}</span>
            <span className="font-bold text-zinc-950">Rp {court.pricePerHour.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-zinc-100">
          <button
            onClick={() => onToggleActive(court)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-sm font-semibold transition-colors border-zinc-200 text-zinc-700 hover:bg-zinc-100"
          >
            <Power className={`size-3.5 ${court.isActive ? "text-red-600" : "text-emerald-600"}`} />
            <span>{court.isActive ? t("deactivateBtn") : t("activateBtn")}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(court)}
              className="p-1.5 text-zinc-600 hover:text-zinc-950 transition-colors border border-zinc-200 rounded-md"
              aria-label={t("editAria")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(court.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 transition-colors border border-red-200 rounded-md"
              aria-label={t("deleteAria")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
