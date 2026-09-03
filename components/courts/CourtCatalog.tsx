"use client";

import { useState } from "react";
import { useDebounce } from "react-use";
import { useQueryStates } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { fetchCourts, type CourtFilters, type CourtType } from "@/lib/api/courts";
import { courtKeys } from "@/lib/query-keys";
import { courtCatalogParsers } from "@/lib/search-params";
import { Input } from "@/components/ui/input";
import CourtCard from "./CourtCard";
import CourtState from "./CourtState";

type TabFilter = "ALL" | CourtType;

export default function CourtCatalog() {
  const t = useTranslations("courts");

  const [{ search, type: tab }, setQueryParams] = useQueryStates(courtCatalogParsers, {
    shallow: true,
  });

  const tabs: { value: TabFilter; label: string }[] = [
    { value: "ALL", label: t("tabAll") },
    { value: "FUTSAL", label: t("tabFutsal") },
    { value: "BADMINTON", label: t("tabBadminton") },
  ];

  const [searchDraft, setSearchDraft] = useState(search);
  const [lastUrlSearch, setLastUrlSearch] = useState(search);
  if (lastUrlSearch !== search) {
    setLastUrlSearch(search);
    setSearchDraft(search);
  }

  useDebounce(
    () => {
      if (searchDraft !== search) {
        setQueryParams({ search: searchDraft || null });
      }
    },
    300,
    [searchDraft, search, setQueryParams]
  );

  const filters: CourtFilters = {
    search,
    ...(tab === "ALL" ? {} : { type: tab as CourtType }),
  };

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: courtKeys.list(filters),
    queryFn: () => fetchCourts(filters),
  });

  return (
    <div className="space-y-8 text-zinc-950">
      {/* Header Catalog */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 text-balance">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed text-pretty">
          {t("description")}
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200/80">
        <div
          role="tablist"
          aria-label={t("filterLabel")}
          className="flex items-center gap-1.5 bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/80 shadow-xs"
        >
          {tabs.map((tabItem) => (
            <button
              key={tabItem.value}
              role="tab"
              aria-selected={tab === tabItem.value}
              onClick={() => setQueryParams({ type: tabItem.value })}
              className={`px-4 min-h-11 py-2.5 rounded-xl text-sm font-mono font-bold transition-colors cursor-pointer ${
                tab === tabItem.value
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover-fine:text-zinc-950 hover-fine:bg-zinc-200/60"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t("searchPlaceholder")}
            containerClassName="w-full sm:w-72"
            leftIcon={<Search className="size-4 text-zinc-400" />}
            className="h-11 text-sm bg-zinc-50 border-zinc-200 rounded-xl"
          />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title={t("reloadTitle")}
            aria-label={t("reloadTitle")}
            className={`flex items-center justify-center h-11 w-11 shrink-0 rounded-xl border border-zinc-200 bg-[var(--background)] text-zinc-600 transition-colors hover-fine:bg-zinc-50 hover-fine:text-zinc-950 cursor-pointer disabled:opacity-50 ${
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
            setQueryParams({ search: null, type: "ALL" });
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