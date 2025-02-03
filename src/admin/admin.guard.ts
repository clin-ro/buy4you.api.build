import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
    user: {
        roles?: string[];
    };
}

@Injectable()
export class AdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;

        if (!user || !user.roles || !user.roles.includes('admin')) {
            throw new UnauthorizedException('Admin access required');
        }

        return true;
    }
} 