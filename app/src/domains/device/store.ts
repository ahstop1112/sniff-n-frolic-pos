import { create } from "zustand";
import type { DeviceContext } from "./types";

type DeviceStore = DeviceContext & {
  setDevice: (next: Partial<DeviceContext>) => void;
};

export const useDeviceStore = create<DeviceStore>((set) => ({
  orgId: "org_demo",
  locationId: "loc_demo",
  deviceId: "dev_ipad_01",
  deviceName: "iPad POS 01",

  setDevice: (next) => set((s) => ({ ...s, ...next })),
}));