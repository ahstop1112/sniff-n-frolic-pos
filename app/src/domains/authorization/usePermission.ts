import type { Permission } from "./permissions";
import { PERMISSIONS } from "./permissions";
import { useAuthStore } from "../auth/store";
import { useSessionStore } from "@/domains/session/store";

export const usePermission = () => {
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);
  const shiftReady = useSessionStore((state) => state.shiftReady);

  const can = (permission: Permission) => permissions.includes(permission);

  const canUse = (permission: Permission) => {
    if (!can(permission)) {
      return false;
    }

    if (permission === PERMISSIONS.SALES_CHECKOUT_USE) {
      return shiftReady;
    }

    return true;
  };

  return { can, canUse, shiftReady, permissions };
};