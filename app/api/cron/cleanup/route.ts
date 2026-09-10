import { NextResponse } from "next/server";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expectedHeader = `Bearer ${cronSecret}`;
  const authBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expectedHeader);

  // Constant-time check to prevent timing analysis on authorization header
  const isAuthorized =
    authBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(authBuffer, expectedBuffer);

  if (!isAuthorized) {
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
