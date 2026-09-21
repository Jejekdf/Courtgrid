"use client";

import { useState } from "react";
import { useDebouncedCallback, usePrevious } from "@react-hookz/web";
import { useQueryStates } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
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

  const prevSearch = usePrevious(search);
  const [searchDraft, setSearchDraft] = useState(search);

  if (prevSearch !== undefined && search !== prevSearch && searchDraft !== search) {
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

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: courtKeys.list(filters),
    queryFn: () => fetchCourts(filters),
  });

  const [expandedCourtId, setExpandedCourtId] = useState<string | null>(null);

  const handleClearSearch = () => {
    setSearchDraft("");
    setQueryParams({ search: null });
  };

  return (
    <div className="flex flex-col gap-8 text-zinc-950">
      {/* Header Catalog */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-3">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 text-balance">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed text-pretty">
          {t("description")}
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200/80">
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

        <Input
          value={searchDraft}
          onChange={(e) => {
            const val = e.target.value;
            setSearchDraft(val);
            debouncedSetSearch(val);
          }}
          placeholder={t("searchPlaceholder")}
          containerClassName="w-full sm:w-72 md:w-80 lg:w-96"
          leftIcon={<Search className="size-4 text-zinc-400" />}
          rightElement={
            searchDraft ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label={t("resetSearch")}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            ) : null
          }
          className="h-11 text-sm bg-zinc-50 border-zinc-200 rounded-xl"
        />
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 items-start">
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