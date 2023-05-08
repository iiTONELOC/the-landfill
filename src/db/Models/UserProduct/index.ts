import { Schema, model } from 'mongoose';
import { IUserProduct } from '../../types';

const ProductSchema = new Schema<IUserProduct>({
    productData: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productAlias: {
        type: String,
        required: false,
        unique: false,
        trim: true,
        minLength: 3,
        maxLength: 250
    },
}, {
    id: false,
    timestamps: true
});


export default model<IUserProduct>('UserProduct', ProductSchema);
