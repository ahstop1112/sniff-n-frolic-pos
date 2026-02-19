
import type { Permission } from "./permissions";
import { ROLE_PERMISSIONS } from "./permissions";

export type UserRole = "staff" | "manager" | "admin";

export type AuthSession = {
    staffId: string;
    staffName: string;
    role: UserRole;
    shiftId: string;
};

export type User = {
    id: string;
    name: string;
    role: UserRole;
    permissions?: Permission[];
};

export type AuthStatus = "checking" | "anonymous" | "authenticated";

export type AuthContextValue = {
    status: AuthStatus;
    user: User | null;
    token: string | null;
    login: (args: { email: string; password: string }) => Promise<void>;
    logout: () => void;
};
