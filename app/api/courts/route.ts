import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getCourtAvailabilityDAL,
  getActiveCourtsDAL,
  checkActiveCourtExistsDAL,
} from "@/features/courts/dal";
import { courtsQuerySchema } from "@/features/courts/schemas";
import { getOrSetCache } from "@/lib/redis";
import { checkRateLimit, checkRateLimitRelaxed } from "@/lib/ratelimit";

export async function GET(request: Request) {
  let headerList: Headers;
  try {
    headerList = await headers();
  } catch {
    headerList = request.headers;
  }
  // x-real-ip is set by trusted proxy/edge, not user-controlled
  const ip = headerList.get("x-real-ip") ?? headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";

  const { searchParams } = new URL(request.url);
  const rawParams = {
    courtId: searchParams.get("courtId") || undefined,
    date: searchParams.get("date") || undefined,
    search: searchParams.get("search") || undefined,
    type: searchParams.get("type") || undefined,
  };

  const parsed = courtsQuerySchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parameter tidak valid." },
      { status: 400 }
    );
  }

  const { courtId, date, search, type } = parsed.data;

  if (courtId || date) {
    const { success } = await checkRateLimit(`public:courts:avail:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    if (courtId) {
      const exists = await checkActiveCourtExistsDAL(courtId);
      if (!exists) {
        return NextResponse.json(
          { error: "Lapangan tidak ditemukan." },
          { status: 404 }
        );
      }
    }

    if (!courtId || !date) {
      return NextResponse.json(
        { error: "Parameter tidak valid." },
        { status: 400 }
      );
    }

    try {
      const slots = await getCourtAvailabilityDAL(courtId, date);
      return NextResponse.json(
        { data: slots },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    } catch (error) {
      console.error("Error fetching availability:", error);
      return NextResponse.json(
        { error: "Gagal memuat ketersediaan lapangan." },
        { status: 500 }
      );
    }
  }

  const { success } = await checkRateLimitRelaxed(`public:courts:list:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
      { status: 429 }
    );
  }

  try {
    const cacheKey = `public:courts:${type || "ALL"}:${search || "none"}`;
    const courts = await getOrSetCache(
      cacheKey,
      async () => {
        return getActiveCourtsDAL(search || "", type || null);
      },
      300
    );

    return NextResponse.json({ data: courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar lapangan." },
      { status: 500 }
    );
  }
}