import { Schema, model } from 'mongoose';
import { IListItem } from '../../types';

const ListItem = new Schema<IListItem>({
    listId: {
        type: Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'UserProduct',
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minLength: 3,
        maxLength: 20
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


export default model<IListItem>('ListItem', ListItem);
