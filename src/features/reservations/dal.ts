import 'server-only';

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { verifyUserSession } from "@/features/auth/dal";
import { getPaymentProofSignedUrl } from "@/lib/supabase/storage";
import { formatSlotHour } from "@/lib/timezone";

export type ReservationDTO = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  courtName: string;
  courtType?: string;
  userName?: string;
  userEmail?: string;
  dpAmount?: number;
  paymentStatus?: string;
  paymentProofUrl?: string | null;
};

export type ReservationDetailDTO = {
  id: string;
  userId?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  court: { name: string; type?: string } | null;
  user: { name: string | null; email: string | null } | null;
  payment: { dpAmount?: number; status?: string } | null;
  paymentProofUrl?: string | null;
};


const PAYMENT_PROOF_LEGACY_MARKER = "/public/payment-proofs/";

async function resolvePaymentProofUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;

  let path = value;
  const legacyIdx = value.indexOf(PAYMENT_PROOF_LEGACY_MARKER);
  if (legacyIdx !== -1) {
    path = value.slice(legacyIdx + PAYMENT_PROOF_LEGACY_MARKER.length);
  } else if (path.startsWith("http")) {
    return value;
  }

  const signedUrl = await getPaymentProofSignedUrl(path);
  return signedUrl ?? path;
}

import { getOrSetCache } from "@/lib/redis";

/**
 * Data Access Layer: Get customer reservations with strict IDOR protection and Redis caching
 */
export const getCustomerReservationsDAL = cache(async (): Promise<ReservationDTO[]> => {
  const user = await verifyUserSession();

  return getOrSetCache(`customer:${user.id}:reservations`, async () => {
    const reservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        totalPrice: true,
        status: true,
        court: { select: { name: true, type: true } },
        payment: { select: { dpAmount: true, status: true } },
        paymentProofUrl: true,
      },
    });

    // DTO Sanitization (STYLE-4: serialize DateTime to ISO string at DAL boundary)
    return Promise.all(
      reservations.map(async (res) => ({
        id: res.id,
        date: res.date instanceof Date ? res.date.toISOString() : String(res.date),
        startTime: formatSlotHour(res.startTime),
        endTime: formatSlotHour(res.endTime),
        totalPrice: res.totalPrice,
        status: res.status,
        courtName: res.court?.name || "",
        courtType: res.court?.type,
        dpAmount: res.payment?.dpAmount,
        paymentStatus: res.payment?.status,
        paymentProofUrl: await resolvePaymentProofUrl(res.paymentProofUrl),
      }))
    );
  }, 15); // TTL 15 seconds
});

/**
 * Data Access Layer: Get single reservation details for E-Ticket with ownership verification
 */
export const getReservationDetailsDAL = cache(async (reservationId: string): Promise<ReservationDetailDTO | null> => {
  const user = await verifyUserSession();

  const res = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      userId: true,
      date: true,
      startTime: true,
      endTime: true,
      totalPrice: true,
      status: true,
      court: { select: { name: true, type: true } },
      user: { select: { name: true, email: true } },
      payment: { select: { dpAmount: true, status: true } },
      paymentProofUrl: true,
    },
  });

  if (!res) return null;

  // Strict IDOR & RBAC Protection: Ensure only owner or Admin can access
  if (res.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden: Anda tidak memiliki hak akses untuk tiket ini.");
  }

  return {
    id: res.id,
    userId: res.userId ?? undefined,
    date: res.date instanceof Date ? res.date.toISOString() : String(res.date),
    startTime: formatSlotHour(res.startTime),
    endTime: formatSlotHour(res.endTime),
    totalPrice: res.totalPrice,
    status: res.status,
    court: res.court ? { name: res.court.name, type: res.court.type } : null,
    user: res.user ? { name: res.user.name, email: res.user.email } : null,
    payment: res.payment ? { dpAmount: res.payment.dpAmount, status: res.payment.status } : null,
    paymentProofUrl: await resolvePaymentProofUrl(res.paymentProofUrl),
  };
});
