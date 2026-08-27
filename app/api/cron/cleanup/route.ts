import { NextResponse } from "next/server";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await autoCancelGhostBookings();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Stale reservations cleaned up successfully.",
    });
  } catch (error) {
    console.error("[Cron:Cleanup] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
