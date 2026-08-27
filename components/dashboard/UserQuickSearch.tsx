"use client";

import { useState, useRef } from "react";
import { useDebounce, useClickAway } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { courtKeys } from "@/lib/query-keys";
import { getCourts } from "@/features/courts/actions";

export function UserQuickSearch() {
  const t = useTranslations("dashboard.search");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useClickAway(searchRef, () => {
    setIsOpen(false);
  });

  useDebounce(
    () => {
      setDebouncedQuery(searchTerm);
    },
    250,
    [searchTerm]
  );

  const { data: courts = [], isFetching: isCourtsFetching } = useQuery({
    queryKey: courtKeys.list({}),
    queryFn: () => getCourts(),
    enabled: isOpen,
    staleTime: 60000,
  });

  const searchResults = debouncedQuery.trim()
    ? courts.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          c.type.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
      <Search className="size-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        autoComplete="off"
        className="w-full pl-8 pr-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
      />

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 w-full mt-1.5 p-2 bg-white border border-zinc-200/90 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto space-y-1"
        >
          {!hasQuery ? (
            <div className="text-center py-4 text-xs text-zinc-400 font-mono">{t("idleHint")}</div>
          ) : isCourtsFetching ? (
            <div className="flex items-center justify-center py-4 text-xs text-zinc-400 gap-2 font-mono">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Memuat arena...</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/book?courtId=${c.id}`}
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                role="option"
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200 cursor-pointer"
              >
                <div>
                  <div className="font-bold text-sm text-zinc-950">{c.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">{c.type}</div>
                </div>
                <span className="font-bold text-zinc-950 font-mono text-xs tabular-nums">
                  Rp {c.pricePerHour.toLocaleString("id-ID")}/jam
                </span>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-zinc-400 font-mono">
              {t("noResults")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

