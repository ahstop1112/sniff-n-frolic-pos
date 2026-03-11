import { createHash, randomInt } from 'crypto';

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const generateSixDigitCode = (): string => {
  return randomInt(100000, 1000000).toString();
};

export const hashOtpCode = (code: string): string => {
  const pepper = process.env.AUTH_OTP_PEPPER ?? 'dev-pepper';
  return createHash('sha256')
    .update(`${code}:${pepper}`)
    .digest('hex');
};