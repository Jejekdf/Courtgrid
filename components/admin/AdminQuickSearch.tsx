"use client";

import { useState, useRef } from "react";
import { useDebounce, useClickAway } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar } from "lucide-react";
import Link from "next/link";
import { adminGlobalSearch } from "@/features/admin/actions";
import { adminKeys } from "@/lib/query-keys";

type SearchResultReservation = {
  id: string;
  date: string;
  totalPrice: number;
  status: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string } | null;
};

type SearchResultCourt = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
};

export function AdminQuickSearch() {
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

  const searchQuery = useQuery({
    queryKey: adminKeys.search(debouncedQuery),
    queryFn: () => adminGlobalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    select: (res) => (res.success ? res : null),
  });
  const searchResults = searchQuery.data;
  const isSearching = searchQuery.isFetching;

  useClickAway(searchRef, () => setIsSearchOpen(false), ["mousedown"]);

  return (
    <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsSearchOpen(true);
        }}
        onFocus={() => setIsSearchOpen(true)}
        placeholder="Cari ID reservasi, pelanggan, arena..."
        className="w-full pl-8 pr-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
      />

      {/* Search Dropdown Results */}
      {isSearchOpen && searchTerm.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 space-y-3 z-50 text-sm max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="text-center py-4 text-zinc-400 font-mono">
              Mencari di database...
            </div>
          ) : searchResults &&
            (searchResults.reservations.length > 0 ||
              searchResults.courts.length > 0) ? (
            <>
              {searchResults.reservations.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-bold uppercase text-zinc-400 px-1">
                    Reservasi
                  </div>
                  {searchResults.reservations.map(
                    (r: SearchResultReservation) => (
                      <Link
                        key={r.id}
                        href="/admin/reservations"
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                      >
                        <div>
                          <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span>{r.user?.name || "Pelanggan"}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {r.court?.name} • ID: {r.id.slice(0, 8)}
                          </div>
                        </div>
                        <span className="font-semibold text-zinc-900">
                          Rp {r.totalPrice.toLocaleString("id-ID")}
                        </span>
                      </Link>
                    )
                  )}
                </div>
              )}

              {searchResults.courts.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                  <div className="text-[11px] font-mono font-bold uppercase text-zinc-400 px-1">
                    Lapangan
                  </div>
                  {searchResults.courts.map((c: SearchResultCourt) => (
                    <Link
                      key={c.id}
                      href="/admin/courts"
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                    >
                      <div>
                        <div className="font-bold text-zinc-950">{c.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {c.type}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {c.isActive ? "AKTIF" : "NONAKTIF"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-zinc-400">
              Tidak ada data yang cocok.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
