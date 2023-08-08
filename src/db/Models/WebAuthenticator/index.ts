import { Schema, model } from 'mongoose';
import { IWebAuthnAuthenticator } from '../../types';

const AuthenticatorSchema = new Schema<IWebAuthnAuthenticator>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    credentialPublicKey: {
        type: String,
        required: true
    },
    credentialID: {
        type: String,
        required: true
    },
    counter: {
        type: BigInt,
        required: true,
        default: BigInt(0)
    },
    credentialDeviceType: {
        type: String,
        required: true
    },
    credentialBackedUp: {
        type: Boolean,
        required: true,
        default: false
    },
    transports: {
        type: Array,
        required: false,
        default: null
    }
}, {
    id: false,
    timestamps: false
});


export default model<IWebAuthnAuthenticator>('Authenticator', AuthenticatorSchema);
