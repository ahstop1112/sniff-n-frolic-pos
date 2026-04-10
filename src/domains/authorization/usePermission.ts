import { useAuthStore } from "@/domains/auth/store";
import { useSessionStore } from "@/domains/session/store";
import { Permission, PERMISSIONS } from "./permissions"; 

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