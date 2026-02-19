import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthStatus, User } from "./types";
import type { Permission } from "./permissions";
import { ROLE_PERMISSIONS } from "./permissions";

// --- replace this with real API later ---
const fakeAuthApi = async (args: { email: string; password: string }) => {
  // simulate latency
  await new Promise((r) => setTimeout(r, 350));

  if (!args.email.trim() || !args.password.trim()) {
    throw new Error("Please enter email and password.");
  }

  // demo token + user
  return {
    token: `demo_${Date.now()}`,
    user: {
      id: "u_demo",
      name: args.email.split("@")[0] || "Demo User",
      role: "manager",
    } satisfies User,
  };
};

type AuthStore = {
    status: AuthStatus;
    token: string | null;
    user: User | null;
    setUser: (user: User | null) => void;
    getPermissions: () => Permission[];
    login: (args: { email: string; password: string }) => Promise<void>;
    logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
    persist(
    (set) => ({
        status: "anonymous",
        token: null,
        user: null,
        setUser: (user) => set({ user }),
        getPermissions: () => {
            const user = get().user;
            if (!user) return [];
            // API 有 permissions 就用 API（override）
            if (user.permissions && user.permissions.length > 0) return user.permissions;
            // 否則用本地 role map
            return [...(ROLE_PERMISSIONS[user.role] ?? [])];
        },
        login: async (args) => {
            const res = await fakeAuthApi(args);
            set({ token: res.token, user: res.user, status: "authenticated" });
        },
        logout: () => set({ token: null, user: null, status: "anonymous" }),
    }),
    {
      name: "pos.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        const hasSession = !!state?.token && !!state?.user;
        state?.status && (state.status = hasSession ? "authenticated" : "anonymous");
      },
    },
  ));