export interface AdminReservationsState {
  scanner: {
    isOpen: boolean;
  };
}

export interface AdminReservationsActions {
  actions: {
    openScanner: () => void;
    closeScanner: () => void;
  };
}

export type AdminReservationsSlice = AdminReservationsState & AdminReservationsActions;

type StoreState = { adminReservations: AdminReservationsSlice };

export const createAdminReservationsSlice = (
  set: (fn: (state: StoreState) => Partial<StoreState>) => void
): AdminReservationsSlice => ({
  scanner: { isOpen: false },
  actions: {
    openScanner: () =>
      set((state) => ({
        adminReservations: {
          ...state.adminReservations,
          scanner: { isOpen: true },
        },
      })),
    closeScanner: () =>
      set((state) => ({
        adminReservations: {
          ...state.adminReservations,
          scanner: { isOpen: false },
        },
      })),
  },
});
