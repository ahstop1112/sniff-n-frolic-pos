import { create } from "zustand";
import { persist } from "zustand/middleware"

export type ShiftStatus = "idle" | "active";
type Branch = { id: string; label: string };

type SessionStore = {
    shiftStatus: ShiftStatus;
    shiftReady: boolean;
    branchId: string | null;
    branchUUID: string | null;
    deviceName: string;
    drawerId: string;

    branches: Branch[];
    setBranchId: (branchId: string) => void;
    setBranchUUID: (id: string) => void;
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
      branchUUID: null, 
      deviceName: "",
      drawerId: "",
      branches: [
        { id: "vancouver", label: "Vancouver" },
        { id: "burnaby", label: "Burnaby" },
        { id: "richmond", label: "Richmond" },
      ],
      setBranchId: (branchId) => set({ branchId }),
      setBranchUUID: (branchUUID) => set({ branchUUID }),
      setDeviceName: (deviceName) => set({ deviceName }),
      setDrawerId: (drawerId) => set({ drawerId }),
      startShift: () => {
        const { branchId } = get()
        if (!branchId) return
        set({ shiftStatus: "active", shiftReady: true })
      },
      endShift: () => set({
        shiftStatus: "idle",
        branchId: null,
        branchUUID: null,
        deviceName: "",
        drawerId: "",
      }),
    }),
    {
      name: "pos-session",
      partialize: (state) => ({
        shiftStatus: state.shiftStatus,
        shiftReady: state.shiftReady,
        branchId: state.branchId,
        branchUUID:  state.branchUUID,
        deviceName: state.deviceName,
        drawerId: state.drawerId,
      }),
    }
  )
);