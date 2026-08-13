import type { StateCreator } from "zustand";
import { getAllReservations, adminDeleteReservation, adminScanTicket, adminCheckInReservation } from "@/features/admin/actions";
import { toast } from "sonner";

export type ReservationDetail = {
  id: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string; type?: string } | null;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  payment: { dpAmount?: number; status?: string } | null;
};

export interface AdminReservationsState {
  filter: "daily" | "monthly" | "all";
  page: number;
  totalPages: number;
  totalCount: number;
  reservations: ReservationDetail[];
  isLoading: boolean;
  scanner: {
    isOpen: boolean;
    ticketInputId: string;
    scannedReservation: ReservationDetail | null;
    isSearching: boolean;
    isCheckingIn: boolean;
  };
}

export interface AdminReservationsActions {
  actions: {
    setFilter: (filter: "daily" | "monthly" | "all") => void;
    setPage: (page: number) => void;
    loadReservations: () => Promise<void>;
    deleteReservation: (id: string) => Promise<void>;
    openScanner: () => void;
    closeScanner: () => void;
    setTicketInputId: (id: string) => void;
    setScannedReservation: (reservation: ReservationDetail | null) => void;
    scanById: (id: string) => void;
    searchTicket: () => Promise<void>;
    checkIn: (id: string) => Promise<void>;
  };
}

export type AdminReservationsSlice = AdminReservationsState & AdminReservationsActions;

const initialScanner = {
  isOpen: false,
  ticketInputId: "",
  scannedReservation: null as ReservationDetail | null,
  isSearching: false,
  isCheckingIn: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAdminReservationsSlice = (set: any, get: any, api: any): AdminReservationsSlice => ({
  filter: "all",
  page: 1,
  totalPages: 1,
  totalCount: 0,
  reservations: [],
  isLoading: true,
  scanner: { ...initialScanner },

  actions: {
    setFilter: (filter) =>
      set((draft: AdminReservationsState) => {
        draft.filter = filter;
        draft.page = 1;
      }),

    setPage: (page) =>
      set((draft: AdminReservationsState) => {
        draft.page = page;
      }),

    loadReservations: async () => {
      set((draft: AdminReservationsState) => {
        draft.isLoading = true;
      });
      const data = await getAllReservations(get().filter, get().page, 10);
      const mapped: ReservationDetail[] = data.reservations.map((r) => ({
        ...r,
        startTime: typeof r.startTime === "string" ? r.startTime : new Date(r.startTime).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        endTime: typeof r.endTime === "string" ? r.endTime : new Date(r.endTime).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        date: typeof r.date === "string" ? r.date : new Date(r.date).toISOString(),
      }));
      set((draft: AdminReservationsState) => {
        draft.reservations = mapped;
        draft.totalPages = data.totalPages;
        draft.totalCount = data.totalCount;
        draft.isLoading = false;
      });
    },

    deleteReservation: async (id) => {
      await adminDeleteReservation(id);
      set((draft: AdminReservationsState) => {
        draft.reservations = draft.reservations.filter((r) => r.id !== id);
        draft.totalCount = Math.max(0, draft.totalCount - 1);
      });
      toast.success("Reservasi berhasil dihapus.");
    },

    openScanner: () =>
      set((draft: AdminReservationsState) => {
        draft.scanner = { ...initialScanner, isOpen: true };
      }),

    closeScanner: () =>
      set((draft: AdminReservationsState) => {
        draft.scanner = { ...initialScanner };
      }),

    setTicketInputId: (ticketInputId) =>
      set((draft: AdminReservationsState) => {
        draft.scanner.ticketInputId = ticketInputId;
      }),

    setScannedReservation: (scannedReservation) =>
      set((draft: AdminReservationsState) => {
        draft.scanner.scannedReservation = scannedReservation;
      }),

    scanById: (id) =>
      set((draft: AdminReservationsState) => {
        draft.scanner.ticketInputId = id;
        draft.scanner.scannedReservation = null;
        draft.scanner.isOpen = true;
      }),

    searchTicket: async () => {
      const { ticketInputId } = get().scanner;
      if (!ticketInputId.trim()) return;
      set((draft: AdminReservationsState) => {
        draft.scanner.isSearching = true;
        draft.scanner.scannedReservation = null;
      });
      const res = await adminScanTicket(ticketInputId.trim());
      set((draft: AdminReservationsState) => {
        draft.scanner.isSearching = false;
        if (res.success && res.reservation) {
          draft.scanner.scannedReservation = {
            ...res.reservation,
            startTime: typeof res.reservation.startTime === "string" ? res.reservation.startTime : new Date(res.reservation.startTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            endTime: typeof res.reservation.endTime === "string" ? res.reservation.endTime : new Date(res.reservation.endTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            date: typeof res.reservation.date === "string" ? res.reservation.date : new Date(res.reservation.date).toISOString(),
          };
          toast.success("E-Ticket Ditemukan!");
        } else {
          toast.error(res.error || "Tiket tidak ditemukan.");
        }
      });
    },

    checkIn: async (id) => {
      set((draft: AdminReservationsState) => {
        draft.scanner.isCheckingIn = true;
      });
      const res = await adminCheckInReservation(id);
      set((draft: AdminReservationsState) => {
        draft.scanner.isCheckingIn = false;
        if (res.success) {
          toast.success(res.message);
          draft.scanner.scannedReservation = draft.scanner.scannedReservation
            ? { ...draft.scanner.scannedReservation, status: "DONE" }
            : null;
          draft.reservations = draft.reservations.map((r) =>
            r.id === id ? { ...r, status: "DONE" } : r
          );
        } else {
          toast.error(res.error);
        }
      });
    },
  },
});
