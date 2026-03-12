export type AuthStatus = 'checking' | 'anonymous' | 'authenticated';

export type AuthUser = {
  id: string;
  email: string;
  status: string;
};

export type AuthSession = {
  id: string;
  userId: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type RequestCodeResponse = {
  ok: true;
  message: string;
  expiresAt: string;
  resendAfter: string;
};

export type VerifyCodeResponse = {
  ok: true;
  accessToken: string;
  user: AuthUser;
  sessionExpiresAt: string;
};

export type MeResponse = {
  ok: true;
  user: AuthUser;
  session: AuthSession;
};

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  requestCode: (email: string) => Promise<void>;
  verifyCode: (args: { email: string; code: string }) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
};
