export type CourtType = "FUTSAL" | "BADMINTON";

export type Court = {
  id: string;
  name: string;
  type: CourtType;
  pricePerHour: number;
  imageUrl: string | null;
  venue: { name: string };
};

export type CourtFilters = {
  search?: string;
  type?: CourtType;
};

export type SlotStatus = "PAST" | "BOOKED" | "FREE";

export type AvailabilitySlot = {
  hour: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
};

export function isCourtType(value: unknown): value is CourtType {
  return value === "FUTSAL" || value === "BADMINTON";
}

export async function fetchCourts(filters: CourtFilters = {}): Promise<Court[]> {
  const params = new URLSearchParams();
  const search = filters.search?.trim();
  if (search) params.set("search", search);
  if (filters.type) params.set("type", filters.type);

  const query = params.toString();
  const res = await fetch(`/api/courts${query ? `?${query}` : ""}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat daftar lapangan (status ${res.status}).`);
  }

  const json = (await res.json()) as { data?: Court[] };
  return json.data ?? [];
}

export async function fetchAvailability(
  courtId: string,
  date: string
): Promise<AvailabilitySlot[]> {
  const res = await fetch(
    `/api/courts?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(date)}`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    throw new Error(`Gagal memuat ketersediaan (status ${res.status}).`);
  }

  const json = (await res.json()) as { data?: AvailabilitySlot[] };
  return json.data ?? [];
}