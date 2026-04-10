import { create } from 'zustand';
import {
    getMe,
    logout as logoutApi,
    requestCode as requestCodeApi,
    verifyCode as verifyCodeApi,
} from "./api/authApi";
import type { AuthStatus, AuthUser } from "./types";
import type { AppUser } from "@/domains/users/types";
import {
  ROLE_PERMISSIONS,
  type Permission,
  type UserRole,
} from "@/domains/authorization/permissions";

const ACCESS_TOKEN_STORAGE_KEY = 'snf_pos_access_token';

const getStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

const setStoredAccessToken = (token: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

const removeStoredAccessToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

const mapAuthUserToAppUser = (authUser: AuthUser): AppUser => {
  const role: UserRole = 'admin';

  return {
    id: authUser.id,
    email: authUser.email,
    status: authUser.status,
    name: authUser.email.split('@')[0],
    role,
    permissions: [...ROLE_PERMISSIONS[role]],
  };
};

type AuthStoreState = {
  status: AuthStatus;
  token: string | null;
  authUser: AuthUser | null;
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;

  requestCode: (email: string) => Promise<void>;
  verifyCode: (args: { email: string; code: string }) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  getPermissions: () => Permission[];
};

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: 'checking',
  token: getStoredAccessToken(),
  authUser: null,
  user: null,
  isLoading: false,
  error: null,

  requestCode: async (email: string) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      await requestCodeApi(email);

      set({
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to request code.',
      });
      throw error;
    }
  },

  verifyCode: async ({ email, code }) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const verifyResponse = await verifyCodeApi(email, code);

      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, verifyResponse.accessToken);

      set({
        status: 'authenticated',
        token: verifyResponse.accessToken,
        authUser: verifyResponse.user,
        user: mapAuthUserToAppUser(verifyResponse.user),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

      set({
        status: 'anonymous',
        token: null,
        authUser: null,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed.',
      });

      throw error;
    }
  },

  restoreSession: async () => {
    const token = get().token;

    if (!token) {
      set({
        status: 'anonymous',
        token: null,
        authUser: null,
        user: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    set({
      status: 'checking',
      isLoading: true,
      error: null,
    });

    try {
      const meResponse = await getMe(token);

      set({
        status: 'authenticated',
        token,
        authUser: meResponse.user,
        user: mapAuthUserToAppUser(meResponse.user),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

      set({
        status: 'anonymous',
        token: null,
        authUser: null,
        user: null,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to restore session.',
      });
    }
  },

  logout: async () => {
    const token = get().token;

    set({
      isLoading: true,
      error: null,
    });

    try {
      if (token) {
        await logoutApi(token);
      }
    } catch {
      // ignore API failure and clear local state anyway
    } finally {
      removeStoredAccessToken();

      set({
        status: 'anonymous',
        token: null,
        authUser: null,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  },

  clearAuth: () => {
    removeStoredAccessToken();

    set({
      status: 'anonymous',
      token: null,
      authUser: null,
      user: null,
      isLoading: false,
      error: null,
    });
  },

  getPermissions: () => {
    return get().user?.permissions ?? [];
  },
}));