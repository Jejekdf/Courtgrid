"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ShieldCheck,
  Search,
  Receipt,
  Calendar,
  Clock,
  User,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Camera,
  Keyboard,
  CameraOff,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminScanTicket, adminCheckInReservation } from "@/features/admin/actions";
import { formatRupiah, safeFormatDate } from "@/lib/utils";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { Html5Qrcode } from "html5-qrcode";

type ScannedTicket = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string; type?: string } | null;
  payment: { dpAmount?: number; status?: string } | null;
};

interface TicketVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckInSuccess: () => void;
}

function extractReservationId(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last.split("?")[0].split("#")[0];
  }
  return trimmed;
}

export function TicketVerificationDialog({
  isOpen,
  onOpenChange,
  onCheckInSuccess,
}: TicketVerificationDialogProps) {
  const t = useTranslations("admin.reservations");
  const [ticketId, setTicketId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<ScannedTicket | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const executeSearch = useCallback(
    async (targetId: string) => {
      const cleanId = extractReservationId(targetId);
      if (!cleanId) return;

      setIsSearching(true);
      setSearchError(null);
      setScannedTicket(null);

      try {
        const res = await adminScanTicket(cleanId);
        if (res.success && res.reservation) {
          setScannedTicket(res.reservation as ScannedTicket);
        } else {
          setSearchError(res.error || t("ticketNotFound"));
        }
      } catch {
        setSearchError(t("ticketNotFound"));
      } finally {
        setIsSearching(false);
      }
    },
    [t]
  );

  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!ticketId.trim()) return;
    await executeSearch(ticketId);
  };

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Scanner stop cleanup error:", err);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraStarting(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCameraStarting(true);

    const container = document.getElementById("ticket-qr-reader");
    if (!container) {
      setIsCameraStarting(false);
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setCameraError(t("cameraInsecureContext"));
      setIsCameraStarting(false);
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia) {
      setCameraError(t("cameraInsecureContext"));
      setIsCameraStarting(false);
      return;
    }

    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      container.innerHTML = "";
      const scanner = new Html5Qrcode("ticket-qr-reader");
      scannerRef.current = scanner;

      const qrConfig = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(50, Math.min(edge, Math.floor(edge * 0.72)));
          return { width: size, height: size };
        },
      };

      const onScanSuccess = async (decodedText: string) => {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(100);
        }
        toast.success(t("scanSuccessToast"));
        const cleanId = extractReservationId(decodedText);
        setTicketId(cleanId);
        await stopCamera();
        await executeSearch(cleanId);
      };

      let started = false;
      let lastError: unknown = null;

      // 1. Mobile phone / tablet: rear camera
      try {
        await scanner.start(
          { facingMode: "environment" },
          qrConfig,
          onScanSuccess,
          () => {}
        );
        started = true;
      } catch (envErr) {
        lastError = envErr;
        console.warn("Camera attempt 1 (environment) failed:", envErr);
      }

      // 2. Front webcam fallback (laptops / PCs)
      if (!started) {
        try {
          await scanner.start(
            { facingMode: "user" },
            qrConfig,
            onScanSuccess,
            () => {}
          );
          started = true;
        } catch (userErr) {
          lastError = userErr;
          console.warn("Camera attempt 2 (user) failed:", userErr);
        }
      }

      // 3. Explicit deviceId query fallback
      if (!started) {
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            await scanner.start(
              cameras[0].id,
              qrConfig,
              onScanSuccess,
              () => {}
            );
            started = true;
          }
        } catch (camErr) {
          lastError = camErr;
          console.warn("Camera attempt 3 (getCameras) failed:", camErr);
        }
      }

      if (!started) {
        throw lastError || new Error("Failed to start camera scanner");
      }

      setIsCameraActive(true);
    } catch (err) {
      console.warn("Unable to start camera scanner:", err);
      const errName = err instanceof Error ? err.name : "";
      const errMsg = err instanceof Error ? err.message : String(err);

      let permissionState: PermissionState | null = null;
      try {
        if (typeof navigator !== "undefined" && navigator.permissions?.query) {
          const status = await navigator.permissions.query({ name: "camera" as PermissionName });
          permissionState = status.state;
        }
      } catch {
        // Permissions query not supported for camera on this browser
      }

      if (permissionState === "denied") {
        setCameraError(t("cameraPermissionDenied"));
      } else if (
        errName === "NotFoundError" ||
        errName === "DevicesNotFoundError" ||
        errMsg.includes("NotFoundError") ||
        errMsg.includes("Requested device not found")
      ) {
        setCameraError(t("cameraNotFound"));
      } else if (
        errName === "NotReadableError" ||
        errName === "TrackStartError" ||
        errMsg.includes("NotReadableError") ||
        errMsg.includes("Could not start video source")
      ) {
        setCameraError(t("cameraInUse"));
      } else if (
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError" ||
        errMsg.includes("NotAllowedError") ||
        errMsg.includes("Permission denied")
      ) {
        setCameraError(t("cameraPermissionDenied"));
      } else {
        setCameraError(t("cameraError"));
      }
      setIsCameraActive(false);
    } finally {
      setIsCameraStarting(false);
    }
  }, [stopCamera, t, executeSearch]);

  const startCameraRef = useRef(startCamera);
  const stopCameraRef = useRef(stopCamera);
  useEffect(() => {
    startCameraRef.current = startCamera;
    stopCameraRef.current = stopCamera;
  });

  const hasScannedTicket = Boolean(scannedTicket);

  useEffect(() => {
    let unmounted = false;

    if (isOpen && scanMode === "camera" && !hasScannedTicket) {
      const timer = setTimeout(() => {
        if (!unmounted) {
          void startCameraRef.current();
        }
      }, 150);

      return () => {
        unmounted = true;
        clearTimeout(timer);
        void stopCameraRef.current();
      };
    }
  }, [isOpen, scanMode, hasScannedTicket]);

  const handleCheckIn = async () => {
    if (!scannedTicket) return;
    setIsCheckingIn(true);
    try {
      const res = await adminCheckInReservation(scannedTicket.id);
      if (res.success) {
        toast.success(res.message || t("checkInSuccess"));
        setScannedTicket((prev) => (prev ? { ...prev, status: "DONE" } : null));
        onCheckInSuccess();
      } else {
        toast.error(res.error || t("checkInFailed"));
      }
    } catch {
      toast.error(t("checkInFailed"));
    } finally {
      setIsCheckingIn(false);
    }
  };

  const resetDialog = () => {
    stopCamera();
    setTicketId("");
    setScannedTicket(null);
    setSearchError(null);
    setCameraError(null);
  };

  const dpAmount =
    scannedTicket?.payment?.dpAmount ??
    (scannedTicket ? Math.round(scannedTicket.totalPrice * 0.5) : 0);
  const remainingAmount = scannedTicket
    ? Math.max(0, scannedTicket.totalPrice - dpAmount)
    : 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetDialog();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <span>{t("verifyTicketTitle")}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {t("verifyTicketDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Switcher */}
        {!scannedTicket && (
          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl mt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setScanMode("camera");
                setSearchError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
                scanMode === "camera"
                  ? "bg-white text-zinc-950 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Camera className="size-3.5" />
              <span>{t("cameraTab")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setScanMode("manual");
                stopCamera();
                setSearchError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
                scanMode === "manual"
                  ? "bg-white text-zinc-950 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Keyboard className="size-3.5" />
              <span>{t("manualTab")}</span>
            </button>
          </div>
        )}

        {/* Camera Viewport */}
        {scanMode === "camera" && !scannedTicket && (
          <div className="space-y-3 mt-2">
            <div className="relative w-full aspect-4/3 max-h-64 sm:max-h-72 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200/80 shadow-inner">
              <div
                id="ticket-qr-reader"
                className="absolute inset-0 size-full [&_video]:size-full [&_video]:object-cover"
              />

              {isCameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                  <div className="relative size-40 sm:size-48 rounded-2xl border-2 border-emerald-500/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                  </div>
                </div>
              )}

              {!isCameraActive && isCameraStarting && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-4 text-center bg-zinc-950/80 backdrop-blur-xs">
                  <Camera className="size-6 text-zinc-400 animate-pulse" />
                  <span className="text-xs font-medium text-zinc-300">{t("cameraStart")}...</span>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-zinc-950/92">
                  <div className="w-full max-w-xs flex flex-col items-center gap-2.5">
                    <div className="size-9 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                      <CameraOff className="size-4.5 text-rose-400" />
                    </div>
                    <p className="text-xs text-rose-200/90 leading-relaxed text-balance px-2">
                      {cameraError}
                    </p>
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 min-h-10 text-xs font-semibold bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-950 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Camera className="size-3.5" />
                      <span>{t("cameraStart")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-zinc-500 px-1">
              <span className="leading-snug">{t("cameraHint")}</span>
              {isCameraActive && (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-xs text-zinc-600 hover:text-zinc-900 underline cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {t("cameraStop")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Manual Search Bar */}
        {(scanMode === "manual" || scannedTicket) && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 mt-2">
            <Input
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder={t("ticketInputPlaceholder")}
              containerClassName="flex-1"
              leftIcon={<Search className="size-4 text-zinc-400" />}
            />
            <Button
              type="submit"
              size="sm"
              isLoading={isSearching}
              disabled={!ticketId.trim() || isSearching}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold min-h-10"
            >
              {t("searchBtn")}
            </Button>
          </form>
        )}

        {/* Search Error */}
        {searchError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Ticket Details Preview */}
        {scannedTicket && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-4 text-sm mt-2">
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-zinc-950">
                  <Receipt className="size-4 text-zinc-500" />
                  <span>{scannedTicket.court?.name ?? t("unknownCourt")}</span>
                </div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">
                  ID: #{scannedTicket.id.slice(0, 12)}
                </div>
              </div>
              <ReservationStatusBadge
                status={scannedTicket.status}
                paymentStatus={scannedTicket.payment?.status}
              />
            </div>

            {/* Customer & Schedule Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 uppercase font-semibold">{t("customerLabel")}</span>
                <div className="font-semibold text-zinc-950 flex items-center gap-1">
                  <User className="size-3 text-zinc-400" />
                  <span>{scannedTicket.user?.name || "Pelanggan"}</span>
                </div>
                <div className="text-zinc-500">{scannedTicket.user?.email || "-"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 uppercase font-semibold">{t("scheduleLabel")}</span>
                <div className="font-semibold text-zinc-950 flex items-center gap-1">
                  <Calendar className="size-3 text-zinc-400" />
                  <span>{safeFormatDate(scannedTicket.date, "dd MMM yyyy")}</span>
                </div>
                <div className="text-zinc-600 font-mono flex items-center gap-1">
                  <Clock className="size-3 text-zinc-400" />
                  <span>{scannedTicket.startTime} - {scannedTicket.endTime} WIB</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">{t("totalLabel")}</span>
                <span className="font-semibold text-zinc-950">{formatRupiah(scannedTicket.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t("dpPaidLabel")}</span>
                <span className="font-semibold text-emerald-600">{formatRupiah(dpAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-100 font-bold">
                <span className="text-zinc-700">{t("payOnsiteLabel")}</span>
                <span className="text-zinc-950 text-sm">{formatRupiah(remainingAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href={`/admin/eticket/${scannedTicket.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-950 transition-colors font-medium"
              >
                <span>{t("viewFullTicket")}</span>
                <ArrowUpRight className="size-3" />
              </Link>

              {scannedTicket.status === "DONE" ? (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>{t("alreadyCheckedIn")}</span>
                </div>
              ) : scannedTicket.status === "DP_PAID" ? (
                <Button
                  size="sm"
                  onClick={handleCheckIn}
                  isLoading={isCheckingIn}
                  disabled={isCheckingIn}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  leftIcon={<CheckCircle2 className="size-3.5" />}
                >
                  {t("confirmCheckInBtn")}
                </Button>
              ) : (
                <span className="text-xs text-amber-600 font-medium">{t("cannotCheckInPending")}</span>
              )}
            </div>

            {/* Scan Another Button */}
            <div className="pt-2 border-t border-zinc-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setScannedTicket(null);
                  setTicketId("");
                  setSearchError(null);
                  if (scanMode === "camera") {
                    startCamera();
                  }
                }}
                className="w-full text-xs flex items-center justify-center gap-1.5 min-h-9"
              >
                <RotateCcw className="size-3.5 text-zinc-500" />
                <span>{t("scanAnotherBtn")}</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

