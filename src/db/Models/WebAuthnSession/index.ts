import { Schema, model } from 'mongoose';
import { IWebAuthnSession } from '../../types';

const WebAuthnSessionSchema = new Schema<IWebAuthnSession>({
    challenge: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    authenticatorId: {
        type: Schema.Types.ObjectId,
        required: false,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: true,
        // desired expiration time in seconds - 24 hours
        expires: 24 * 60 * 60
    }
}, {
    id: false,
    timestamps: false
});

export default model<IWebAuthnSession>('WebAuthnSession', WebAuthnSessionSchema);
