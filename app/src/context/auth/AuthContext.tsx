import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
} from "react";
import { AuthContextValue, AuthStatus, AuthUser } from "./types";

const AUTH_TOKEN_KEY = "pos.auth.token";
const AUTH_USER_KEY = "pos.auth.user";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

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
      role: "cashier",
    } satisfies AuthUser,
  };
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // hydrate on boot
  useEffect(() => {
    try {
      const t = localStorage.getItem(AUTH_TOKEN_KEY);
      const uRaw = localStorage.getItem(AUTH_USER_KEY);
      const u = uRaw ? (JSON.parse(uRaw) as AuthUser) : null;

      if (t && u) {
        setToken(t);
        setUser(u);
        setStatus("authenticated");
      } else {
        setStatus("anonymous");
      }
    } catch {
      setStatus("anonymous");
    }
  }, []);

  const login = async (args: { email: string; password: string }) => {
    const res = await fakeAuthApi(args);

    setToken(res.token);
    setUser(res.user);
    setStatus("authenticated");

    localStorage.setItem(AUTH_TOKEN_KEY, res.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStatus("anonymous");
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, token, login, logout }),
    [status, user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
