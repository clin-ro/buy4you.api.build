import { UserDocument } from '@/schemas/mongo/user.schema';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as UserDocument;

        if (!user?.isAdmin) {
            throw new UnauthorizedException('Admin access required');
        }

        return true;
    }
} 