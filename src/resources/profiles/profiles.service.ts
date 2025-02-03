import { Profile } from '@/schemas/mongo/profile.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

interface SubscriptionUsage {
    ordersUsed: number;
    quotationsUsed: number;
    storageUsed: number;
}

@Injectable()
export class ProfilesService {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<Profile>
    ) { }

    async findById(id: string) {
        const profile = await this.profileModel.findById(new Types.ObjectId(id));
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        return profile;
    }

    async findByUserId(userId: string) {
        const profile = await this.profileModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        return profile;
    }

    async updateSubscriptionUsage(profileId: string, type: 'orders' | 'quotations' | 'storage', increment: number = 1) {
        const updateField = `subscriptionUsage.${type}Used`;
        const profile = await this.profileModel.findByIdAndUpdate(
            new Types.ObjectId(profileId),
            { $inc: { [updateField]: increment } },
            { new: true }
        );

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        return profile;
    }

    async checkQuota(profileId: string, type: string): Promise<boolean> {
        return this.checkUsageLimit(profileId, type);
    }

    async checkUsageLimit(profileId: string, type: string): Promise<boolean> {
        const profile = await this.findById(profileId);
        if (!profile.subscription) {
            return false;
        }

        const usageKey = `${type}Used` as keyof typeof profile.subscriptionUsage;
        const limitKey = `included${type?.charAt(0).toUpperCase()}${type?.slice(1).replace('Used', '')}` as keyof typeof profile.subscription;

        const usage = profile.subscriptionUsage[usageKey] as number;
        const limit = profile.subscription[limitKey] as number;

        return usage < limit;
    }

    async update(id: string, updateProfileDto: any) {
        const profile = await this.findById(id);
        Object.assign(profile, updateProfileDto);
        return profile.save();
    }
}