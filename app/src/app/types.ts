export type AppMode = "sales" | "manage";
export type Currency = "CAD" | "HKD" | "USD";
export type Country = "CA" | "HK" | "US";

export type AppShellState = {
  mode: AppMode;
};

export type AppShellActions = {
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
};

export type AppShellStore = AppShellState & AppShellActions;