import {
    Body, Controller,
    Get, Headers,
    Ip, Post,
    Req, UnauthorizedException, UseGuards
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { AuthGuard } from './auth.guard';

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

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('request-code')
    public async requestCode (@Body() dto: RequestCodeDto){
        return this.authService.requestCode(dto.email);
    };
    
    @Post('verify-code')
    public async verifyCode(
        @Body() dto: VerifyCodeDto,
        @Headers('user-agent') userAgent?: string,
        @Ip() ipAddress?: string,
    ) {
        return this.authService.verifyCode({
            email: dto.email,
            code: dto.code,
            userAgent: userAgent ?? null,
            ipAddress: ipAddress ?? null,
        });
    }

    @Get('me')
    @UseGuards(AuthGuard)
    public async me(@Req() req: AuthenticatedRequest) {
        if (!req.authUser || !req.authSession) {
            throw new UnauthorizedException('Unauthorized.');
        }

        return {
            ok: true,
            user: req.authUser,
            session: req.authSession,
        };
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    public async logout(@Req() req: Request) {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new UnauthorizedException('Missing authorization header.');
        }

        const [, token] = authorizationHeader.split(' ');

        if (!token) {
            throw new UnauthorizedException('Invalid authorization header.');
        }

        return this.authService.logout(token);
    }
}