import ListItem from '../ListItem';
import { Schema, model } from 'mongoose';
import { IList, ListItemModel } from '../../types';


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

ListSchema.virtual('productCount').get(async function (this: IList) {
    return this?.products?.length || 0;
});
ListSchema.virtual('itemCount').get(async function (this: IList) {
    const products = this?.products !== null ? this?.products : [];
    let quantity = 0;
    for (const element of products) {
        const resolvedProduct: ListItemModel | null = await ListItem.findById(element).exec() as ListItemModel;
        quantity += resolvedProduct?.quantity || 0;
    }
    return quantity;
});

export default model<IList>('List', ListSchema);
