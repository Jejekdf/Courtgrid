import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createAdminReservationsSlice, type AdminReservationsSlice } from "./slices/adminReservationsSlice";

export type BoundStore = {
  adminReservations: AdminReservationsSlice;
};

export const useBoundStore = create<BoundStore>()(
  devtools(
    (set) => ({
      adminReservations: createAdminReservationsSlice(set),
    }),
    { name: "courtgrid" }
  )
);

export const useAdminReservationsActions = () => useBoundStore((state) => state.adminReservations.actions);
