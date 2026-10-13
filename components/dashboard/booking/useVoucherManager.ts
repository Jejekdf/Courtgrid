"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { validateVoucherAction } from "@/features/vouchers/actions";

export interface AppliedVoucher {
  code: string;
  discountPct: number;
  discountAmount: number;
  finalTotalPrice: number;
}

interface UseVoucherManagerProps {
  subtotal: number;
  slotCount: number;
}

export function useVoucherManager({ subtotal, slotCount }: UseVoucherManagerProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const applyVoucher = useCallback(async () => {
    const code = voucherCode.trim();
    if (!code) {
      setVoucherError("Masukkan kode voucher terlebih dahulu");
      return;
    }
    if (subtotal === 0) {
      setVoucherError("Pilih minimal 1 sesi jam sebelum memasang voucher");
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherError(null);
    try {
      const res = await validateVoucherAction(code, subtotal);
      if (res.success) {
        setAppliedVoucher({
          code: res.code,
          discountPct: res.discountPct,
          discountAmount: res.discountAmount,
          finalTotalPrice: res.finalTotalPrice,
        });
        toast.success(`Voucher ${res.code} berhasil digunakan! Diskon ${res.discountPct}%`);
      } else {
        setAppliedVoucher(null);
        setVoucherError(res.error);
        toast.error(res.error);
      }
    } catch {
      setVoucherError("Gagal memvalidasi kode voucher");
    } finally {
      setIsValidatingVoucher(false);
    }
  }, [voucherCode, subtotal]);

  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  }, []);

  const resetVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherError(null);
  }, []);

  const appliedCode = appliedVoucher?.code;

  useEffect(() => {
    if (!appliedCode || slotCount === 0 || subtotal === 0) return;

    let isMounted = true;
    validateVoucherAction(appliedCode, subtotal).then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setAppliedVoucher({
          code: res.code,
          discountPct: res.discountPct,
          discountAmount: res.discountAmount,
          finalTotalPrice: res.finalTotalPrice,
        });
      } else {
        setAppliedVoucher(null);
        setVoucherError(res.error);
        toast.error(`Voucher ${appliedCode} dilepas: ${res.error}`);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [subtotal, slotCount, appliedCode]);

  return {
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    setAppliedVoucher,
    isValidatingVoucher,
    voucherError,
    applyVoucher,
    removeVoucher,
    resetVoucher,
  };
}
