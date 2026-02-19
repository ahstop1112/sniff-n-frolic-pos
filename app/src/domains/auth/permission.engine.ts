import type { Permission } from "./permissions";
import { PERMISSIONS } from "./permissions";
import { useAuthStore } from "./store";
import { useSessionStore } from "../shift/store";

export const usePermission = () => {
  const getPermissions = useAuthStore((s) => s.getPermissions);
  const shiftReady = useSessionStore((s) => s.shiftReady);

  const can = (p: Permission) => getPermissions().includes(p);

  const canUse = (p: Permission) => {
    if (!can(p)) return false;

    // checkout must ready
    if (p === PERMISSIONS.SALES_CHECKOUT_USE) return shiftReady;

    return true;
  };

  return { can, canUse, shiftReady };
};
