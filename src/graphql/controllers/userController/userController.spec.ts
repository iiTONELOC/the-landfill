import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { IUser, UserModel, DBConnection, IJwtPayload, AuthenticatedContext } from '../../../types';
import connect, { disconnectFromDB } from '../../../db/connection';
import mongoose, { Types } from 'mongoose';
import User from '../../../db/Models/User';
import userController from './index';
import jwt from 'jsonwebtoken';


const testUserData: IUser = {
    username: 'testUser245',
    email: 'test245@test.com',
    password: 'testPassword1!',
    webAuthnRegistered: false,
    useWebAuthn: false
} as IUser;

let testUser: UserModel;
let connection: DBConnection;

beforeAll(async () => {
    connection = await connect('test-land-userQueries');
    testUser = (await User.create(testUserData)).toObject() as UserModel;
});

afterAll(async () => {
    await User.deleteMany({});
    connection && await disconnectFromDB(connection as typeof mongoose);
});


describe('User Controller', () => {
    it('should be defined', () => {
        expect(userController).toBeDefined();
    });

    it('should have a userQueries property', () => {
        expect(userController.userQueries).toBeDefined();
    });

    it('should have a userMutations property', () => {
        expect(userController.userMutations).toBeDefined();
    });
});

describe('userQueries', () => {
    it('should be defined', () => {
        expect(userController.userQueries).toBeDefined();
    });

    it('should have a queryMe property', () => {
        expect(userController.userQueries.queryMe).toBeDefined();
    });

    describe('queryMe', () => {
        it('should be defined', () => {
            expect(userController.userQueries.queryMe).toBeDefined();
        });

        it('should be able to find the current user from the context', async () => {
            const result = await userController.userQueries.queryMe(null, null,
                {
                    user: {
                        _id: testUser._id,
                        username: testUser.username,
                        email: testUser.email
                    }
                });
            expect(result).toBeDefined();
            const expectedResult = { ...testUser };
            // eslint-disable-next-line
            // @ts-ignore
            expectedResult.password = undefined;
            expect(result).toEqual(expectedResult);

            expect.assertions(2);
        });

        it('should throw an error if the user is not authenticated', async () => {
            await expect(userController.userQueries.queryMe(null, null, {
                user: {
                    _id: new Types.ObjectId(),
                    username: 'testUser245',
                    email: 'test245@test.com'
                }
            }))
                .rejects.toThrowError();

            expect.assertions(1);
        });
    });

    it('should have a userMutations property', () => {
        expect(userController.userMutations).toBeDefined();
    });

    describe('userMutations', () => {
        it('should be defined', () => {
            expect(userController.userMutations).toBeDefined();
        });

        it('should have an addUser property', () => {
            expect(userController.userMutations.addUser).toBeDefined();
        });

        it('should be able to add a user', async () => {
            const result = await userController.userMutations.addUser(null, {
                username: 'testUser246',
                email: 'testUser246@test.com',
                password: 'testPassword1!',
                webAuthnRegistered: false,
                useWebAuthn: false
            }, {} as AuthenticatedContext);

            expect(result).toBeDefined();

            expect(result?.user.username).toBe('testUser246');
            expect(result?.user.email).toBe('testUser246@test.com');
            expect(result?.user.password).not.toEqual('testPassword1!');

            expect(result?.token).toBeDefined();
            expect(result?.token).toEqual(expect.any(String));

            expect.assertions(6);
        });

        it('should throw an error if the user already exists', async () => {
            await expect(userController.userMutations.addUser(null, testUserData, {} as AuthenticatedContext))
                .rejects.toThrowError();

            expect.assertions(1);
        });
    });

    describe('loginUser', () => {
        it('should be defined', () => {
            expect(userController.userMutations.loginUser).toBeDefined();
        });

        it('should be able to login a user', async () => {
            const result = await userController.userMutations.loginUser(null, testUserData);
            const payload = result?.token ? (await jwt.verify(result.token, process.env.JWT_SECRET as string)) as IJwtPayload : null;

            expect(result).toBeDefined();

            expect(result?.user.username).toBe(testUserData.username);
            expect(result?.user.email).toBe(testUserData.email);
            expect(result?.user.password).not.toEqual(testUserData.password);

            expect(result?.token).toBeDefined();
            expect(result?.token).toEqual(expect.any(String));

            expect(payload).toBeDefined();

            expect(payload?._id).toEqual(testUser._id.toString());
            expect(payload?.username).toEqual(testUser.username);
            expect(payload?.email).toEqual(testUser.email);

            expect.assertions(10);
        });

        it('should throw an error if the user does not exist', async () => {
            try {
                await userController.userMutations.loginUser(null, {
                    username: 'testUser451',
                    email: 'testBananas@test.com',
                    password: 'testPassword1!',
                    webAuthnRegistered: false,
                    useWebAuthn: false
                })
            } catch (error) {
                expect(error).toBeDefined();
                // eslint-disable-next-line
                // @ts-ignore
                expect(error?.message).toBe('Incorrect credentials');

                expect.assertions(2);
            }
        });

        it('should throw an error if the password is incorrect', async () => {
            try {
                await userController.userMutations.loginUser(null, {
                    username: testUserData.username,
                    email: testUserData.email,
                    password: 'testPassword2!',
                    webAuthnRegistered: false,
                    useWebAuthn: false
                })
            } catch (error) {
                expect(error).toBeDefined();
                // eslint-disable-next-line
                // @ts-ignore
                expect(error?.message).toBe('Incorrect credentials');

                expect.assertions(2);
            }
        });
    });

    describe('updateUser', () => {
        it('should be defined', () => {
            expect(userController.userMutations.updateUser).toBeDefined();
        });

        it('should be able to update a user\'s username from context', async () => {
            const result = await userController.userMutations.updateUser(null, {
                username: 'testUser275'
            }, { user: { _id: testUser._id, username: testUser.username, email: testUser.email } });

            expect(result).toBeDefined();
            expect(result?.username).toBe('testUser275');

            expect.assertions(2);
        });

        it('should be able to update a user\'s email from context', async () => {
            const result = await userController.userMutations.updateUser(null, {
                email: 'testUser275@test.com'
            }, { user: { _id: testUser._id, username: testUser.username, email: testUser.email } });

            expect(result).toBeDefined();
            expect(result?.email).toBe('testUser275@test.com');

            expect.assertions(2);
        });
    });

    describe('deleteUser', () => {
        it('should be defined', () => {
            expect(userController.userMutations.deleteUser).toBeDefined();
        });

        it('should be able to delete a user', async () => {
            const result = await userController.userMutations.deleteUser(null, null, { user: { _id: testUser._id, username: testUser.username, email: testUser.email } });

            expect(result).toBeDefined();
            expect(result._id.toString()).toEqual(testUser._id.toString());

            expect.assertions(2);
        });
    });

});