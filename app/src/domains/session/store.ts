// domains/session/store.ts
import { create } from "zustand";

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

export const useSessionStore = create<SessionStore>((set, get) => ({
  shiftStatus: "idle",
  shiftReady: false,
  branchId: null,
  deviceName: "",
  drawerId: "",
  branches: [
    { id: "vancouver", label: "Vancouver" },
    { id: "burnaby", label: "Burnaby" },
    { id: "vancouver", label: "Vancouver" },
  ],
  setBranchId: (branchId) => set({ branchId }),
  setDeviceName: (deviceName) => set({ deviceName }),
  setDrawerId: (drawerId) => set({ drawerId }),
  startShift: () => {
    const { branchId } = get();
    if (!branchId) return;
    set({ shiftStatus: "active", shiftReady: true });
  },
  endShift: () =>
    set({
      shiftStatus: "idle",
      branchId: null,
      deviceName: "",
      drawerId: "",
    }),
}));