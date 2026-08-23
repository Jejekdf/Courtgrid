import { useTranslations } from "next-intl";

export type ReservationFilterType = "ALL" | "DP_PAID" | "PENDING" | "CANCELED";

interface ReservationFiltersProps {
  filter: ReservationFilterType;
  onFilterChange: (filter: ReservationFilterType) => void;
  totalCount: number;
}

export function ReservationFilters({
  filter,
  onFilterChange,
  totalCount,
}: ReservationFiltersProps) {
  const t = useTranslations("dashboard.reservations");
  const filterButtons: { type: ReservationFilterType; label: string; activeClass: string; inactiveClass: string }[] = [
    {
      type: "ALL",
      label: t("filterAll", { count: totalCount }),
      activeClass: "bg-zinc-950 text-white shadow-xs",
      inactiveClass: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950",
    },
    {
      type: "DP_PAID",
      label: t("filterDpPaid"),
      activeClass: "bg-zinc-950 text-white shadow-xs",
      inactiveClass: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    },
    {
      type: "PENDING",
      label: t("filterPending"),
      activeClass: "bg-zinc-950 text-white shadow-xs",
      inactiveClass: "bg-amber-50 text-amber-800 hover:bg-amber-100",
    },
    {
      type: "CANCELED",
      label: t("filterCanceled"),
      activeClass: "bg-zinc-950 text-white shadow-xs",
      inactiveClass: "bg-red-50 text-red-800 hover:bg-red-100",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterButtons.map((btn) => (
        <button
          key={btn.type}
          onClick={() => onFilterChange(btn.type)}
          className={`px-3.5 py-1.5 rounded-xl text-sm font-bold font-mono transition-colors cursor-pointer ${
            filter === btn.type ? btn.activeClass : btn.inactiveClass
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
