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
    quantity: {
        type: Number,
        required: true,
        unique: false,
        min: 0,
        max: 1000000,
        default: 1
    },
    notes: {
        type: String,
        required: false,
        unique: false,
        trim: true,
        minLength: 3,
        maxLength: 250
    },
    isCompleted: {
        type: Boolean,
        required: false,
        unique: false,
        default: false
    }
}, {
    id: false,
    timestamps: true
});


export default model<IUserProduct>('UserProduct', ProductSchema);