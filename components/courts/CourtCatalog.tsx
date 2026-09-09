"use client";

import { useState } from "react";
import { useDebouncedCallback } from "@react-hookz/web";
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

  const [prevSearch, setPrevSearch] = useState(search);
  const [searchDraft, setSearchDraft] = useState(search);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchDraft(search);
  }

  const debouncedSetSearch = useDebouncedCallback(
    (value: string) => {
      setQueryParams({ search: value || null });
    },
    [setQueryParams],
    300
  );

  const filters: CourtFilters = {
    search,
    ...(tab === "ALL" ? {} : { type: tab as CourtType }),
  };

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: courtKeys.list(filters),
    queryFn: () => fetchCourts(filters),
  });

  const [expandedCourtId, setExpandedCourtId] = useState<string | null>(null);

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-zinc-200/80">
        <div
          role="tablist"
          aria-label={t("filterLabel")}
          className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 shadow-xs max-w-full overflow-x-auto scrollbar-none"
        >
          {tabs.map((tabItem) => (
            <button
              key={tabItem.value}
              role="tab"
              aria-selected={tab === tabItem.value}
              onClick={() => setQueryParams({ type: tabItem.value })}
              className={`px-4 min-h-10 py-2 rounded-lg text-sm font-semibold font-sans transition-colors cursor-pointer shrink-0 ${
                tab === tabItem.value
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover-fine:text-zinc-950 hover-fine:bg-zinc-200/60"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            value={searchDraft}
            onChange={(e) => {
              const val = e.target.value;
              setSearchDraft(val);
              debouncedSetSearch(val);
            }}
            placeholder={t("searchPlaceholder")}
            containerClassName="w-full md:w-72"
            leftIcon={<Search className="size-4 text-zinc-400" />}
            className="h-11 text-sm bg-zinc-50 border-zinc-200 rounded-xl"
          />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title={t("reloadTitle")}
            aria-label={t("reloadTitle")}
            className={`flex items-center justify-center size-11 shrink-0 rounded-xl border border-zinc-200 bg-background text-zinc-600 transition-colors hover-fine:bg-zinc-50 hover-fine:text-zinc-950 cursor-pointer disabled:opacity-50 ${
              isFetching ? "animate-spin" : ""
            }`}
          >
            <RotateCcw className="size-4" />
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {data?.map((court, index) => (
            <CourtCard
              key={court.id}
              court={court}
              priority={index === 0}
              isExpanded={expandedCourtId === court.id}
              onToggleExpand={() =>
                setExpandedCourtId((prev) => (prev === court.id ? null : court.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}