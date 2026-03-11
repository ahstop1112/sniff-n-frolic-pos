import {
  BadRequestException, Injectable,
  HttpException, HttpStatus
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import {
  generateSixDigitCode,
  hashOtpCode,
  normalizeEmail,
} from '../../common/utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  public requestCode = async (rawEmail: string) => {
    const email = normalizeEmail(rawEmail);

    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    const latestCode = await this.authRepository.findLatestActiveCodeByEmail(
      email,
    );

    const now = new Date();

    if (latestCode?.resend_after && new Date(latestCode.resend_after) > now) {
      throw new HttpException(
        'Please wait before requesting another code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = generateSixDigitCode();
    const codeHash = hashOtpCode(code);

    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    const resendAfter = new Date(now.getTime() + 60 * 1000);

    const loginCode = await this.authRepository.createEmailLoginCode({
      email,
      codeHash,
      expiresAt,
      resendAfter,
    });

    console.log('[EMAIL OTP]', {
      email,
      code,
      expiresAt,
    });

    return {
      ok: true,
      message: 'Verification code sent.',
      expiresAt: loginCode.expires_at,
      resendAfter: loginCode.resend_after,
    };
  };
}