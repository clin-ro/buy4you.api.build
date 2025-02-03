import { UserDocument } from '@/schemas/mongo/user.schema';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserDocument => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
); 