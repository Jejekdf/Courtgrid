import type { CourtFilters } from "@/lib/api/courts";

export const courtKeys = {
  all: ["courts"] as const,
  list: (filters: CourtFilters) => [...courtKeys.all, "list", filters] as const,
  availability: (courtId: string, date: string) =>
    [...courtKeys.all, "availability", courtId, date] as const,
};