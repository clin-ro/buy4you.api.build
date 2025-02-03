import { AuthService } from '@/auth/auth.service';
import { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';
import { UserDocument } from '@/schemas/mongo/user.schema';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: JwtPayload): Promise<UserDocument> {
        const user = await this.authService.validateUserById(payload._id as string);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
} 