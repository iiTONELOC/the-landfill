// imports and types for simplewebauthn
import { Types } from 'mongoose';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse
} from '@simplewebauthn/server';
import type {
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
    AuthenticationResponseJSON
} from '@simplewebauthn/typescript-types';
import { signToken } from './jwtMiddleware';
import { isoUint8Array } from '@simplewebauthn/server/helpers';
import { User, WebAuthnSession, WebAuthnAuthenticator } from '../db/Models';
import type { UserModel, WebAuthnUserSessionModel, WebAuthnAuthenticatorModel } from '../db/types';

const REACT_PORT = process.env.REACT_PORT ?? 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// set values for RP for webauthn
const rpId = process.env.RP_ID ?? 'localhost';
const rpName = process.env.RP_NAME ?? 'TrashScanner WebAuth Development Server';
const rpIdOrigin = IS_PRODUCTION ? `https://${rpId}` : `http://${rpId}:${REACT_PORT}`;

export interface WebAuthnAuthenticationOpts {
    options: PublicKeyCredentialRequestOptionsJSON;
    forUserId: Types.ObjectId;
}

export interface WebAuthnAuthenticationVerificationResponse {
    user: UserModel;
    token: string;
}

export interface IWebAuthnAPI {
    generateRegistrationOptions: (forUser: UserModel) => Promise<PublicKeyCredentialRequestOptionsJSON>;
    verifyRegistrationResponse: (forUserId: string, withRegistration: RegistrationResponseJSON) => Promise<boolean>;
    generateAuthenticationOptions: (forUser: UserModel) => Promise<WebAuthnAuthenticationOpts>;
    verifyAuthenticationResponse: (forUserId: string, withAuthenticationOptions: AuthenticationResponseJSON) => Promise<WebAuthnAuthenticationVerificationResponse>;
}

export const webAuthnAPI: IWebAuthnAPI = {
    generateRegistrationOptions: async (forUser: UserModel): Promise<PublicKeyCredentialRequestOptionsJSON> => {
        // list of existing authenticators for this user
        const userAuthenticators: WebAuthnAuthenticatorModel[] = await WebAuthnAuthenticator //NOSONAR
            .find({ userId: forUser._id }).select('-__v');

        // registration options
        const options: PublicKeyCredentialRequestOptionsJSON = generateRegistrationOptions({
            rpName,
            rpID: rpId,
            userID: forUser._id.toString(),
            userName: forUser.username,
            attestationType: 'direct',
            excludeCredentials: userAuthenticators.map((authenticator: WebAuthnAuthenticatorModel) => ({
                id: isoUint8Array.fromHex(authenticator.credentialID),
                type: 'public-key',
                transports: ['usb', 'ble', 'nfc', 'internal']
            })),
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred'
            }
        })

        // see if the user already has a session
        const existingSession: WebAuthnUserSessionModel | undefined = (
            await WebAuthnSession.find({ userId: forUser._id }).select('-__v'))[0]; //NOSONAR

        if (existingSession) {
            // if the session is expired, delete it
            if (existingSession.createdAt.getTime() + (24 * 60 * 60 * 1000) < new Date().getTime()) {
                await WebAuthnSession.deleteOne({ userId: forUser._id });//NOSONAR
            } else {
                // if the session is not expired, return the current challenge
                options.challenge = existingSession.challenge;
            }
        }

        // create a new session if there is no existing session
        if (existingSession === undefined) {
            await WebAuthnSession.create({
                challenge: options.challenge,
                userId: forUser._id
            });
        }

        return options;
    },
    verifyRegistrationResponse: async (forUserId: string, withRegistration: RegistrationResponseJSON):
        Promise<boolean> => {
        // look the requested registration up
        const existingSession: WebAuthnUserSessionModel | undefined = (
            await WebAuthnSession.find({ userId: forUserId }).select('-__v'))[0]; //NOSONAR

        // assigned challenge
        const expectedChallenge = existingSession?.challenge;

        let verification: VerifiedRegistrationResponse | undefined;

        try {
            verification = await verifyRegistrationResponse({
                expectedChallenge,
                response: withRegistration,
                expectedOrigin: rpIdOrigin,
                expectedRPID: rpId,
                requireUserVerification: true
            });

            const { verified } = verification ?? { verified: false };
            const { registrationInfo } = verification ?? { registrationInfo: undefined }; //NOSONAR

            // if the response was verified, we need to save the authenticator
            if (verified && registrationInfo) {
                await WebAuthnAuthenticator.create({
                    userId: existingSession.userId,
                    credentialID: Buffer.from(registrationInfo?.credentialID).toString('base64url'),
                    credentialPublicKey: Buffer.from(registrationInfo?.credentialPublicKey).toString('hex'),
                    counter: registrationInfo?.counter,
                    credentialDeviceType: registrationInfo?.credentialDeviceType,
                    credentialBackedUp: registrationInfo?.credentialBackedUp,
                    transports: withRegistration?.response?.transports
                });
                // update the user to set the useWebAuthn and webAuthnRegistered fields to true
                await User.findByIdAndUpdate( // NOSONAR
                    { _id: existingSession.userId },
                    { useWebAuthn: true, webAuthnRegistered: true },
                    { runValidators: true }
                );

                // front end expects a boolean
                return verified;
            } else {
                return false;
            }
        } catch (error) {
            console.log('\n\nError with WebAuthn Registration Process:: in verifyRegistrationResponse: ', error, '\n');
            return false;
        }
    },
    generateAuthenticationOptions: async (forUser: UserModel): Promise<WebAuthnAuthenticationOpts> => {
        // find the user's registered authenticators
        const userAuthenticators: WebAuthnAuthenticatorModel[] = await WebAuthnAuthenticator //NOSONAR
            .find({ userId: forUser._id }).select('-__v');

        // if the user has no registered authenticators, return an error
        if (userAuthenticators.length === 0) {
            throw new Error('No registered authenticators');
        }

        // generate the assertion options
        const options = generateAuthenticationOptions({
            // Require users to use a previously-registered authenticator
            allowCredentials: userAuthenticators.map(authenticator => ({
                id: Uint8Array.from(Buffer.from(authenticator.credentialID, 'base64url')),
                type: 'public-key',
                // Optional
                transports: authenticator.transports as AuthenticatorTransport[]
            })),
            userVerification: 'preferred',
            rpID: rpId
        });

        // need to store the challenge into a session that can be retrieved in a later request
        if (options?.challenge) {
            // look for an existing session
            const existingSession: WebAuthnUserSessionModel | undefined =
                (await WebAuthnSession.find({ userId: forUser._id }).select('-__v'))[0]; //NOSONAR

            // if there is no existing session, create one
            !existingSession && await WebAuthnSession.create({
                challenge: options.challenge,
                userId: forUser._id
            });

            // if there is an existing session, update the challenge, and reset the createdAt date
            existingSession && await WebAuthnSession.updateOne(//NOSONAR
                { userId: forUser._id },
                {
                    challenge: options.challenge,
                    createdAt: new Date()
                }
            );
        } else {
            throw new Error('Unknown error, please try again');
        }
        return { options, forUserId: forUser._id };
    },
    verifyAuthenticationResponse: async (forUserId: string, withAuthenticationOptions: AuthenticationResponseJSON): Promise<WebAuthnAuthenticationVerificationResponse> => {
        // look for an existing session
        const existingSession: WebAuthnUserSessionModel | undefined = (await WebAuthnSession.find({ userId: forUserId }).select('-__v'))[0]; //NOSONAR

        !existingSession && (() => {
            throw new Error('No existing session')
        })();

        const expectedChallenge = existingSession?.challenge;
        const _credentialID = withAuthenticationOptions.id;

        const userAuthenticator = (await WebAuthnAuthenticator.find({ credentialID: _credentialID })); //NOSONAR

        !userAuthenticator || userAuthenticator.length === 0 && (() => {
            throw new Error('No authenticator found')
        })();

        const verification: VerifiedAuthenticationResponse | undefined = await verifyAuthenticationResponse({
            response: withAuthenticationOptions,
            expectedChallenge,
            expectedOrigin: rpIdOrigin,
            expectedRPID: rpId,
            authenticator: {
                counter: Number(userAuthenticator[0].counter),
                credentialID: new Uint8Array(Buffer.from(userAuthenticator[0].credentialID)),
                credentialPublicKey: isoUint8Array.fromHex(userAuthenticator[0].credentialPublicKey),
                transports: userAuthenticator[0].transports as AuthenticatorTransport[] | undefined
            },
            requireUserVerification: true
        });

        if (verification?.verified) {
            // we need to do some housekeeping here before we send the response
            const verifiedUser: UserModel = await User.findById(forUserId).select('-password -__v'); //NOSONAR
            const authToken = signToken(verifiedUser?.toObject() as UserModel);

            // update the authenticator's counter
            await WebAuthnAuthenticator.updateOne( //NOSONAR
                { credentialID: _credentialID },
                { counter: verification.authenticationInfo.newCounter }
            );

            return { user: verifiedUser, token: authToken };
        } else {
            throw new Error('Authentication response could not be verified');
        }
    }
};
