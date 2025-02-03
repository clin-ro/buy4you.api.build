import { Types } from 'mongoose';

export type MongooseID = string | Types.ObjectId;

export interface WithId {
    _id: Types.ObjectId;
} 