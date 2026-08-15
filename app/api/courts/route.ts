import { NextResponse } from "next/server";
import { getCourtAvailabilityDAL, getActiveCourtsDAL } from "@/features/courts/dal";
import { getOrSetCache } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courtId = searchParams.get("courtId");
  const date = searchParams.get("date");

  if (courtId && date) {
    try {
      const slots = await getCourtAvailabilityDAL(courtId, date);
      return NextResponse.json({ data: slots });
    } catch (error) {
      console.error("Error fetching availability:", error);
      return NextResponse.json(
        { error: "Gagal memuat ketersediaan lapangan." },
        { status: 500 }
      );
    }
  }

  const search = searchParams.get("search")?.trim() ?? "";
  const type = searchParams.get("type");

  try {
    const cacheKey = `public:courts:${type || "ALL"}:${search || "none"}`;
    const courts = await getOrSetCache(cacheKey, async () => {
      return getActiveCourtsDAL(search, type);
    }, 300); // 5 min Redis Cache

    return NextResponse.json({ data: courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar lapangan." },
      { status: 500 }
    );
  }
}