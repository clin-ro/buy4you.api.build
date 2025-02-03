import { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';
import { UserService } from '@/resources/user/user.service';
import { User, UserDocument } from '@/schemas/mongo/user.schema';
import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model, Types } from 'mongoose';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private userService: UserService,
    ) { }


    async onModuleInit() {
        await this.createDefaultUser();
    }

    private async createDefaultUser() {
        const exists = await this.userModel.findOne({ isAdmin: true });
        if (exists) {
            return;
        }
        const defaultAdmin = {
            email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
            password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            isAdmin: true,
            isActive: true,
            role: Role.ADMIN,
            canManageOwnOrders: true,
            isVerified: true,
            isBlocked: false,
        };
        const adminUser = new this.userModel({
            email: defaultAdmin.email,
            password: defaultAdmin.password,
            firstName: defaultAdmin.firstName,
            lastName: defaultAdmin.lastName,
            isAdmin: defaultAdmin.isAdmin,
            isActive: defaultAdmin.isActive,
            role: defaultAdmin.role,
            canManageOwnOrders: defaultAdmin.canManageOwnOrders,
            isVerified: defaultAdmin.isVerified,
            isBlocked: defaultAdmin.isBlocked,
            roles: [Role.ADMIN]
        });
        await adminUser.save();
    }

    async validateUserById(userId: string): Promise<UserDocument | null> {
        return this.userModel.findById(userId).exec();
    }

    async register(userData: Partial<User>): Promise<{ user: UserDocument; token: string }> {
        const user = new this.userModel({
            ...userData,
            roles: [Role.BUYER],
        });
        await user.save();
        const token = this.generateToken(user);
        return { user, token };
    }

    async login(email: string, password: string): Promise<{ user: UserDocument; token: string }> {
        const user = await this.userModel.findOne({ email, isActive: true }).exec();
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        user.lastLogin = new Date();
        await user.save();

        const token = this.generateToken(user);
        return { user, token };

    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            return;
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // TODO: Implement email sending
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        }).exec();

        if (!user) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
    }

    private generateToken(user: UserDocument): string {
        const payload: JwtPayload = {
            _id: user._id instanceof Types.ObjectId ? user._id.toString() : user._id,
            email: user.email,
            roles: user.roles,
        };
        const token = this.jwtService.sign(payload, {
            expiresIn: '365d',
        })
        return token;
    }

    async validateApiKey(apiKey: string): Promise<User> {
        const user = await this.userService.findByApiKey(apiKey);
        if (!user) {
            throw new UnauthorizedException('Invalid API key');
        }
        return user;
    }
} 