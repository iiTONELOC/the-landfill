import { Schema, model } from 'mongoose';
import { IProduct } from '../../types';

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minLength: 3,
        maxLength: 250
    },
    barcode: {
        type: [String],
        required: true,
        unique: true,
        trim: true,
        minLength: 8,
        maxLength: 20
    },
    source: {
        type: Schema.Types.ObjectId,
        ref: 'Source',
        required: true
    }
}, {
    id: false,
    timestamps: true
});


export default model<IProduct>('Product', ProductSchema);
