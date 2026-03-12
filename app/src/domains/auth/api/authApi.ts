import type {
  MeResponse,
  RequestCodeResponse,
  VerifyCodeResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:4000'; // local

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

type LogoutResponse = {
  success: boolean;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.message || data.error || 'Request failed.';
  } catch {
    return `Request failed with status ${response.status}.`;
  }
};

const request = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as T;
};

export const requestCode = async (
  email: string,
): Promise<RequestCodeResponse> => {
  return request<RequestCodeResponse>('/auth/request-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const verifyCode = async (
  email: string,
  code: string,
): Promise<VerifyCodeResponse> => {
  return request<VerifyCodeResponse>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
};

export const getMe = async (accessToken: string): Promise<MeResponse> => {
  return request<MeResponse>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const logout = async (accessToken: string): Promise<LogoutResponse> => {
  return request<LogoutResponse>('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};