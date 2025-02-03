import { Role } from '@/auth/enums/role.enum';
import { Types } from 'mongoose';
export interface JwtPayload {
    _id: string | Types.ObjectId | unknown;
    email: string;
    roles: Role[];
} 