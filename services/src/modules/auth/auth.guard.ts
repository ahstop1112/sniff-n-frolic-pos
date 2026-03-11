import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

type AuthenticatedRequest = Request & {
  authUser?: {
    id: string;
    email: string;
    status: string;
  };
  authSession?: {
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Missing authorization header.');
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header.');
    }

    const session = await this.authService.validateAccessToken(token);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session.');
    }

    request.authUser = session.user;
    request.authSession = session.session;

    return true;
  }
}