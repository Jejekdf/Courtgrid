import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { createBookingSlice, type BookingSlice } from "./slices/bookingSlice";
import { createAdminReservationsSlice, type AdminReservationsSlice } from "./slices/adminReservationsSlice";

export type BoundStore = {
  booking: BookingSlice;
  adminReservations: AdminReservationsSlice;
};

export const useBoundStore = create<BoundStore>()(
  immer(
    devtools(
      (...a) => ({
        booking: createBookingSlice(...a),
        adminReservations: createAdminReservationsSlice(...a),
      }),
      { name: "courtgrid" }
    )
  )
);

export const useBookingActions = () => useBoundStore((state) => state.booking.actions);
export const useAdminReservationsActions = () => useBoundStore((state) => state.adminReservations.actions);
