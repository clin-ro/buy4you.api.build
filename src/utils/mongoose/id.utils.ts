import { Types } from 'mongoose';
import { MongooseID } from './types';

export class MongooseUtils {
    static toObjectId(id: MongooseID): Types.ObjectId {
        return typeof id === 'string' ? new Types.ObjectId(id) : id;
    }

    static toObjectIds(ids: MongooseID[]): Types.ObjectId[] {
        return ids.map(id => MongooseUtils.toObjectId(id));
    }

    static equals(id1: MongooseID, id2: MongooseID): boolean {
        return MongooseUtils.toObjectId(id1).equals(MongooseUtils.toObjectId(id2));
    }

    static isValidObjectId(id: string): boolean {
        return Types.ObjectId.isValid(id);
    }
} 