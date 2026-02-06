export type AuthUser = {
  id: string;
  name: string;
  role?: string;
};

export type AuthStatus = "checking" | "anonymous" | "authenticated";

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  login: (args: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};
