import { User, UserDocument } from '@/schemas/mongo/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async findByApiKey(apiKey: string): Promise<User | null> {
        return this.userModel.findOne({ apiKey }).exec();
    }
} 