"use client";

import { useCallback, useState } from "react";
import { useDebounce } from "react-use";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, Search } from "lucide-react";
import { fetchCourts, isCourtType, type CourtFilters, type CourtType } from "@/lib/api/courts";
import { courtKeys } from "@/lib/query-keys";
import { Input } from "@/components/ui/input";
import CourtCard from "./CourtCard";
import CourtState from "./CourtState";

type TabFilter = "ALL" | CourtType;

const TABS: { value: TabFilter; label: string }[] = [
  { value: "ALL", label: "Semua Arena" },
  { value: "FUTSAL", label: "Futsal" },
  { value: "BADMINTON", label: "Badminton" },
];

export default function CourtCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const tabParam = searchParams.get("type");
  const tab: TabFilter = isCourtType(tabParam) ? tabParam : "ALL";

  const [searchDraft, setSearchDraft] = useState(search);
  const [lastUrlSearch, setLastUrlSearch] = useState(search);
  if (lastUrlSearch !== search) {
    setLastUrlSearch(search);
    setSearchDraft(search);
  }

  const updateParams = useCallback(
    (patch: { search?: string; type?: TabFilter }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextSearch = patch.search ?? search;
      const nextType = patch.type ?? tab;
      if (nextSearch) params.set("search", nextSearch);
      else params.delete("search");
      if (nextType !== "ALL") params.set("type", nextType);
      else params.delete("type");
      router.replace(`/courts${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [router, searchParams, search, tab]
  );

  useDebounce(
    () => {
      if (searchDraft !== search) updateParams({ search: searchDraft });
    },
    300,
    [searchDraft, search, updateParams]
  );

  const filters: CourtFilters = {
    search,
    ...(tab === "ALL" ? {} : { type: tab }),
  };

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: courtKeys.list(filters),
    queryFn: () => fetchCourts(filters),
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-10 text-zinc-950">
      {/* Header Catalog */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Katalog Arena Terverifikasi
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950">
          Pilih Lapangan Favorit Anda
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-mono">
          Jelajahi ketersediaan arena futsal dan badminton berstandar nasional di CourtGrid.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200/80">
        <div
          role="tablist"
          aria-label="Filter tipe lapangan"
          className="flex items-center gap-1.5 bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/80 shadow-xs"
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => updateParams({ type: t.value })}
              className={`px-4 min-h-11 py-2.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                tab === t.value
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Cari nama arena lapangan..."
            containerClassName="w-full sm:w-72"
            leftIcon={<Search className="w-4 h-4 text-zinc-400" />}
            className="h-11 text-xs bg-zinc-50 border-zinc-200 rounded-xl"
          />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Muat ulang data"
            aria-label="Muat ulang data"
            className={`flex items-center justify-center h-11 w-11 shrink-0 rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 cursor-pointer disabled:opacity-50 ${
              isFetching ? "animate-spin" : ""
            }`}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Catalog State Grid */}
      {isError ? (
        <CourtState type="error" onRetry={() => refetch()} />
      ) : isPending ? (
        <CourtState type="loading" />
      ) : data && data.length === 0 ? (
        <CourtState
          type="empty"
          onReset={() => {
            setSearchDraft("");
            updateParams({ search: "", type: "ALL" });
          }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((court, index) => (
            <CourtCard key={court.id} court={court} priority={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
}