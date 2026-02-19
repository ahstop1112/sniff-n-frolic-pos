import { create } from "zustand";
import type { AppMode, AppShellStore } from "./types";

export const useAppStore = create<AppShellStore>((set, get) => ({
  mode: "sales",

  setMode: (mode: AppMode) => set({ mode }),

  toggleMode: () => {
    const next = get().mode === "sales" ? "manage" : "sales";
    set({ mode: next });
  },
}));
