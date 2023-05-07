import { Types } from 'mongoose';
export interface IJwtPayload {
    _id: Types.ObjectId;
    username: string;
    email: string;
}
