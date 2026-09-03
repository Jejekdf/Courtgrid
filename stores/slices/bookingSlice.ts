import { format } from "date-fns";
import { getCourts, getCourtAvailability } from "@/features/courts/actions";

export type Court = { id: string; name: string; type: string; pricePerHour: number };
export type ReservationSlot = { startTime: string; endTime: string; status: string };

export interface BookingState {
  courts: Court[];
  selectedCourt: Court | null;
  selectedDate: string;
  availabilitySlots: ReservationSlot[];
  selectedTimes: string[];
  isLoadingCourts: boolean;
  isLoadingAvailability: boolean;
  isBooking: boolean;
  availabilityError: string | null;
}

export interface BookingActions {
  actions: {
    loadCourts: () => Promise<void>;
    loadAvailability: (courtId: string, date: string) => Promise<void>;
    selectCourt: (court: Court) => void;
    selectDate: (date: string) => void;
    toggleTimeSlot: (time: string) => void;
    setBooking: (value: boolean) => void;
    resetSelection: () => void;
  };
}

export type BookingSlice = BookingState & BookingActions;

const initialBookingState: BookingState = {
  courts: [],
  selectedCourt: null,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  availabilitySlots: [],
  selectedTimes: [],
  isLoadingCourts: true,
  isLoadingAvailability: false,
  isBooking: false,
  availabilityError: null,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createBookingSlice = (set: any): BookingSlice => ({
  ...initialBookingState,
  actions: {
    loadCourts: async () => {
      const data = await getCourts();
      set((draft: BookingState) => {
        draft.courts = data;
        draft.isLoadingCourts = false;
        draft.selectedCourt = draft.selectedCourt ?? data[0] ?? null;
      });
    },
    loadAvailability: async (courtId, date) => {
      set((draft: BookingState) => {
        draft.isLoadingAvailability = true;
        draft.selectedTimes = [];
        draft.availabilityError = null;
      });
      try {
        const data = await getCourtAvailability(courtId, date);
        set((draft: BookingState) => {
          draft.availabilitySlots = data;
        });
      } catch {
        set((draft: BookingState) => {
          draft.availabilityError = "Gagal memuat ketersediaan slot. Silakan coba lagi.";
        });
      } finally {
        set((draft: BookingState) => {
          draft.isLoadingAvailability = false;
        });
      }
    },
    selectCourt: (court) =>
      set((draft: BookingState) => {
        draft.selectedCourt = court;
        draft.selectedTimes = [];
      }),
    selectDate: (date) =>
      set((draft: BookingState) => {
        draft.selectedDate = date;
        draft.selectedTimes = [];
      }),
    toggleTimeSlot: (time) =>
      set((draft: BookingState) => {
        const index = draft.selectedTimes.indexOf(time);
        if (index >= 0) {
          draft.selectedTimes.splice(index, 1);
        } else {
          draft.selectedTimes.push(time);
        }
      }),
    setBooking: (value) =>
      set((draft: BookingState) => {
        draft.isBooking = value;
      }),
    resetSelection: () =>
      set((draft: BookingState) => {
        draft.selectedTimes = [];
        draft.availabilitySlots = [];
        draft.availabilityError = null;
      }),
  },
});
