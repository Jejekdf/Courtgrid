import type { CourtFilters } from "@/lib/api/courts";

export const courtKeys = {
  all: ["courts"] as const,
  list: (filters: CourtFilters) => [...courtKeys.all, "list", filters] as const,
  availability: (courtId: string, date: string) =>
    [...courtKeys.all, "availability", courtId, date] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  reservations: (filter: string) => [...adminKeys.all, "reservations", filter] as const,
  customersAll: () => [...adminKeys.all, "customers"] as const,
  customers: (search: string, page: number) => [...adminKeys.customersAll(), search, page] as const,
  settings: () => [...adminKeys.all, "settings"] as const,
  notifications: () => [...adminKeys.all, "notifications"] as const,
  search: (query: string) => [...adminKeys.all, "search", query] as const,
};

export const customerKeys = {
  all: ["customer"] as const,
  notifications: () => [...customerKeys.all, "notifications"] as const,
};