import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

type CreateEmailLoginCodeParams = {
  email: string;
  codeHash: string;
  expiresAt: Date;
  resendAfter: Date;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  public createEmailLoginCode = async ({
    email,
    codeHash,
    expiresAt,
    resendAfter,
  }: CreateEmailLoginCodeParams) => {
    const query = `
      INSERT INTO email_login_codes (
        email,
        code_hash,
        expires_at,
        resend_after
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, expires_at, resend_after, created_at
    `;

    const values = [email, codeHash, expiresAt, resendAfter];

    const result = await this.databaseService.query<{
      id: string;
      email: string;
      expires_at: Date;
      resend_after: Date;
      created_at: Date;
    }>(query, values);

    return result.rows[0];
  };

  public findLatestActiveCodeByEmail = async (email: string) => {
    const query = `
      SELECT
        id,
        email,
        resend_after,
        expires_at,
        consumed_at,
        created_at
      FROM email_login_codes
      WHERE email = $1
        AND consumed_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.databaseService.query<{
      id: string;
      email: string;
      resend_after: Date;
      expires_at: Date;
      consumed_at: Date | null;
      created_at: Date;
    }>(query, [email]);

    return result.rows[0] ?? null;
  };
}