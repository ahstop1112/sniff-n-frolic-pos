import { create } from "zustand";
import { persist } from "zustand/middleware"

export type ShiftStatus = "idle" | "active";
type Branch = { id: string; label: string };

type SessionStore = {
    shiftStatus: ShiftStatus;
    shiftReady: boolean;
    branchId: string | null;
    deviceName: string;
    drawerId: string;

    branches: Branch[];

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
      branches: [
        { id: "vancouver", label: "Vancouver" },
        { id: "burnaby", label: "Burnaby" },
        { id: "richmond", label: "Richmond" },
      ],
      setBranchId: (branchId) => set({ branchId }),
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
        deviceName: "",
        drawerId: "",
      }),
    }),
    {
      name: "pos-session",
      partialize: (state) => ({
        // 只 persist 呢幾樣，branches 唔需要 persist
        shiftStatus: state.shiftStatus,
        shiftReady: state.shiftReady,
        branchId: state.branchId,
        deviceName: state.deviceName,
        drawerId: state.drawerId,
      }),
    }
  )
);