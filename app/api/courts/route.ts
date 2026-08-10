import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCourtType } from "@/lib/api/courts";
import { getCourtAvailabilityDAL } from "@/features/courts/dal";

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
    const courts = await prisma.court.findMany({
      where: {
        isActive: true,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        ...(isCourtType(type) ? { type } : {}),
      },
      orderBy: { name: "asc" },
      include: { venue: { select: { name: true } } },
    });

    return NextResponse.json({ data: courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar lapangan." },
      { status: 500 }
    );
  }
}