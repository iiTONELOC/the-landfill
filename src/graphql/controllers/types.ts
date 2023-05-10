import { Types } from 'mongoose';

export type addUserProductMutationArgs = {
    userId: Types.ObjectId;
    barcode: string;
};

export type editUserProductMutationArgs = {
    userProductId: Types.ObjectId;
    userId: Types.ObjectId;
    productAlias?: string;
};

export type addListItemArgs = {
    listId: Types.ObjectId;
    productId: Types.ObjectId;
    username: string;
    quantity?: number;
    notes?: string;
    isCompleted?: boolean;
};

export type updateListItemArgs = {
    listItemId: Types.ObjectId;
    listId: Types.ObjectId;
    quantity?: number;
    notes?: string;
    isCompleted?: boolean;
}
