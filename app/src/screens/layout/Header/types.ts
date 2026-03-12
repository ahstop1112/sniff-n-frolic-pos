import type { AppMode } from "@/app/types";
export type NetworkStatus = "online" | "syncing" | "offline";

export interface Staff {
  id?: string;
  name?: string | `Perry`;
}

export interface HeaderProps {
  logoSrc?: string;
  branchName?: string;
  networkStatus?: NetworkStatus;

  onlineOrderCount?: number | 0;

  mode?: AppMode;
  onModeChange?: (mode: AppMode) => void;

  staff?: Staff;
  onCashIn?: () => void;
  onCashOut?: () => void;
  onLogout?: () => void;

  onOpenOnlineOrders?: () => void;
}
