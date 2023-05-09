import { Types } from 'mongoose';

export type addUserProductMutationArgs = {
    userId: Types.ObjectId;
    barcode: string;
};
