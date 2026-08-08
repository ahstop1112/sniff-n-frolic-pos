import { create } from "zustand";
import { persist } from "zustand/middleware"

export type ShiftStatus = "idle" | "active";
export type DrawerStatus = "open" | "unclosed";
export type Branch = {
    id: string;
    label: string;
    address?: string;
    drawerStatus?: DrawerStatus;
    activeStaff?: number;
};

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
      // TODO: source these from the API. Address/drawerStatus/activeStaff are
      // hard-coded to match the design wireframe and let the UI render fully.
      branches: [
        {
          id: "van-yaletown",
          label: "Vancouver · Yaletown",
          address: "1188 Mainland St · Lane A, Lane B",
          drawerStatus: "open",
          activeStaff: 3,
        },
        {
          id: "van-kitsilano",
          label: "Vancouver · Kitsilano",
          address: "2240 W 4th Ave · Lane A",
          drawerStatus: "open",
          activeStaff: 2,
        },
        {
          id: "rich-aberdeen",
          label: "Richmond · Aberdeen",
          address: "4151 Hazelbridge Way · Lane A",
          drawerStatus: "unclosed",
        },
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