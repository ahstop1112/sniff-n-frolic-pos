// domains/session/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShiftStatus = "idle" | "active";
type Branch = { id: string; label: string };

type SessionStore = {
    shiftStatus: ShiftStatus;
    shiftReady: boolean;
    branchId: string | null;
    deviceName: string;
    drawerId: string;
    branches: Branch[];
    hasHydrated: boolean;

    setHasHydrated: (value: boolean) => void;
    setBranchId: (branchId: string) => void;
    setDeviceName: (name: string) => void;
    setDrawerId: (drawerId: string) => void;

    startShift: () => void;
    endShift: () => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      shiftStatus: "idle",
      shiftReady: false,
      branchId: null,
      deviceName: "",
      drawerId: "",
      hasHydrated: false,

      branches: [
        { id: "vancouver", label: "Vancouver" },
        { id: "burnaby", label: "Burnaby" },
      ],
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setBranchId: (branchId) => set({ branchId }),
      setDeviceName: (deviceName) => set({ deviceName }),
      setDrawerId: (drawerId) => set({ drawerId }),
      startShift: () => {
        const { branchId } = get();

        if (!branchId) {
          return;
        }
        set({
          shiftStatus: "active",
          shiftReady: true,
        });
      },
      endShift: () =>
        set({
          shiftStatus: "idle",
          shiftReady: false,
          branchId: null,
          deviceName: "",
          drawerId: "",
        }),
    }),
    {
      name: "pos-session",
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to hydrate session store", error);
        }

        state?.setHasHydrated(true);
      },
    }
  )
);