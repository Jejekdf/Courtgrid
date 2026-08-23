"use client";

import { useState, useRef } from "react";
import { useDebounce } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { courtKeys } from "@/lib/query-keys";
import { getCourts } from "@/features/courts/actions";
import { Popover, PopoverContent } from "@/components/ui/popover";

export function UserQuickSearch() {
  const t = useTranslations("dashboard.search");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useDebounce(
    () => {
      setDebouncedQuery(searchTerm);
    },
    300,
    [searchTerm]
  );

  const { data: courts = [] } = useQuery({
    queryKey: courtKeys.list({}),
    queryFn: () => getCourts(),
  });

  const searchResults = debouncedQuery.trim()
    ? courts.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          c.type.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  return (
    <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
      <Search className="size-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsSearchOpen(true);
        }}
        onFocus={() => setIsSearchOpen(true)}
        placeholder={t("placeholder")}
        className="w-full pl-8 pr-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
      />

      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverContent
          anchor={searchRef}
          side="bottom"
          align="start"
          sideOffset={6}
          className="w-(--anchor-width) p-3 space-y-2 max-h-80 overflow-y-auto"
        >
          {debouncedQuery.trim().length > 0 && searchResults.length > 0 ? (
            searchResults.map((c) => (
              <Link
                key={c.id}
                href="/dashboard/book"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
              >
                <div>
                  <div className="font-bold text-zinc-950">{c.name}</div>
                  <div className="text-xs text-zinc-400 font-mono">{c.type}</div>
                </div>
                <span className="font-bold text-zinc-900">
                  Rp {c.pricePerHour.toLocaleString("id-ID")}/jam
                </span>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-zinc-400">
              {t("noResults")}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
