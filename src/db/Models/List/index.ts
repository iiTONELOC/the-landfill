import { Schema, model } from 'mongoose';
import { IList } from '../../types';

const ListSchema = new Schema<IList>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minLength: 3,
        maxLength: 75,
        default: 'New List'
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'ListItem',
        required: false
    }],
    isDefault: {
        type: Boolean,
        required: true,
        unique: false,
        default: false
    }
}, {
    id: false,
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

ListSchema.virtual('productCount').get(function (this: IList) {
    const products = this?.products || [];
    return products.length;
});

export default model<IList>('List', ListSchema);
