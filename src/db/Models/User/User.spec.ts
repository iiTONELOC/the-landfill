import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { IUser, UserRoles, UserModel, DBConnection } from '../../types';
import connect, { disconnectFromDB } from '../../connection';
import mongoose from 'mongoose';
import User from './';


// repetitive test data
const testUser99 = 'testuser99';
const validTestPassword = 'testPassword1!';

const testUserData: IUser[] = [
    {
        username: 'testuser',
        email: 'testEmail@test.com',
        password: validTestPassword,
        role: UserRoles.BASIC,
    },
    {
        username: 'testuser2',
        email: 'testEmail2@test.com',
        password: validTestPassword,
        role: UserRoles.ADMIN
    },
    {
        username: 'testuser3',
        email: 'testEmail3@test.com',
        password: validTestPassword,
        role: UserRoles.API_USER
    },
    {
        username: 'testuser4',
        email: 'testEmail4@test.com',
        password: validTestPassword,
        role: UserRoles.API_ADMIN
    },
    {
        username: 'testuser5',
        email: 'testEmail5@test.com',
        password: validTestPassword,
        role: UserRoles.SITE_ADMIN
    },
    {
        username: 'testuser6',
        email: 'testEmail6@test.com',
        password: validTestPassword,
        role: UserRoles.SITE_OWNER
    }
];

// tracks created users so we can run tests on them
let testUsers: UserModel[] = [];
let dbConnection: DBConnection = null;

// connect to the local test database
beforeAll(async () => {
    dbConnection = await connect('test-land-user');

    // create a pool of test users
    for (const user of testUserData) {
        const newUser: UserModel = await User.create(user);
        testUsers.push(newUser);
    }
});

// clean up the database after each run so we don't have any duplicate users
afterAll(async () => {
    await User.deleteMany({});

    // clear the test users
    testUsers = [];

    // disconnect from the database and clear the connection
    await disconnectFromDB(dbConnection as typeof mongoose);
    dbConnection = null;
});

describe('User Model', () => {
    it('should create a new user', async () => {
        let index = 0;

        for (const user of testUsers) {
            const currentUserTestData: IUser = testUserData[index];

            expect(user).toBeDefined();
            expect(user._id).toBeDefined();
            expect(typeof user.password).toBe('string');
            expect(user.password).not.toEqual(currentUserTestData.password);
            expect(user).toHaveProperty('username', currentUserTestData.username);
            expect(user).toHaveProperty('email', currentUserTestData.email);
            expect(user).toHaveProperty('role', currentUserTestData.role);

            index++;
        }

        expect.assertions(7 * testUsers.length);
    });

    /**
     * Tests for the username field
     */
    it('should throw an error if the username is too short', async () => {
        const testUser: IUser = {
            username: 'a',
            email: 'shortUser@test.com',
            password: validTestPassword,
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }

        expect.assertions(2);
    });

    it('should throw an error if the username is too long', async () => {
        const testUser: IUser = {
            username: `@${'a'.repeat(31)}`,
            email: 'LongUsername@test.com',
            password: validTestPassword,
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }
        expect.assertions(2);
    });

    it('should throw an error if the username contains invalid characters', async () => {
        const invalidTests: IUser[] = [
            {
                username: 'test user',
                email: 'spaceInName@test.com',
                password: validTestPassword,
                role: UserRoles.BASIC
            },
            {
                username: 'test@user!',
                email: 'specalCharInName@test.com',
                password: validTestPassword,
                role: UserRoles.BASIC
            },
        ];

        for (const testUser of invalidTests) {
            try {
                await User.create(testUser);
            }

            catch (err) {
                expect(err).toBeDefined();
                expect(err).toHaveProperty('name', 'ValidationError');
            }
        }
        expect.assertions(4);
    });

    it('should throw an error if the username is not unique', async () => {
        const testUser: IUser = {
            username: 'testuser',
            email: 'testEmail99@test.com',
            password: validTestPassword,
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'MongoServerError');
        }
        expect.assertions(2);
    });

    it('should throw an error if the username is not provided', async () => {
        const testUser: IUser = {
            email: 'testEmail99@test.com',
            password: validTestPassword,
        } as IUser;

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }
        expect.assertions(2);
    });


    /**
     * Tests for the email field
     */
    it('should throw an error if the email is not in valid format', async () => {
        const invalidTests: IUser[] = [
            {
                username: testUser99,
                email: 'testEmail',
                password: validTestPassword,
                role: UserRoles.BASIC
            },
            {
                username: testUser99,
                email: 'testEmail@test',
                password: validTestPassword,
                role: UserRoles.BASIC
            },
            {
                username: testUser99,
                email: 'testEmail@test.',
                password: validTestPassword,
                role: UserRoles.BASIC
            },
            {
                username: testUser99,
                email: '',
                password: validTestPassword,
                role: UserRoles.BASIC
            },
        ];

        for (const testUser of invalidTests) {
            try {
                await User.create(testUser);
            }

            catch (err) {
                expect(err).toBeDefined();
                expect(err).toHaveProperty('name', 'ValidationError');
            }
        }

        expect.assertions(2 * invalidTests.length);
    });

    it('should throw an error if the email is not unique', async () => {
        const testUser: IUser = {
            username: testUser99,
            email: 'testEmail@test.com',
            password: validTestPassword,
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'MongoServerError');
        }

        expect.assertions(2);
    });

    it('should throw an error if the email is not provided', async () => {
        const testUser: IUser = {
            username: testUser99,
            password: validTestPassword,
            role: UserRoles.BASIC
        } as IUser;

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }

        expect.assertions(2);
    });


    /**
     * Tests for the password field
     */
    it('should throw an error if the password is too short', async () => {
        const testUser: IUser = {
            username: testUser99,
            email: 'shortPass@test.com',
            password: 'test',
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }
        expect.assertions(2);
    });

    it('should throw an error if the password is too long', async () => {
        const testUser: IUser = {
            username: testUser99,
            email: 'LongPass@test.com',
            password: 'a'.repeat(101),
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }
        expect.assertions(2);
    });

    it('should throw an error if the password does not contain a number', async () => {
        const testUser: IUser = {
            username: testUser99,
            email: 'badPass@test.com',
            password: 'testPassword!',
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'Error');
        }
        expect.assertions(2);
    });

    it('should throw an error if the password does not contain a special character', async () => {
        const testUser: IUser = {
            username: testUser99,
            email: 'badPass@test.com',
            password: 'testPassword1',
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'Error');
        }
        expect.assertions(2);
    });

    it('should throw an error if the password does not have an uppercase letter', async () => {
        const testUser: IUser = {
            username: 'testuser',
            email: 'badPass@test.com',
            password: validTestPassword.toLowerCase(),
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'Error');
        }
        expect.assertions(2);
    });

    it('should throw an error if the password does not have a lowercase letter', async () => {
        const testUser: IUser = {
            username: 'testuser',
            email: 'badPass@test.com',
            password: validTestPassword.toUpperCase(),
            role: UserRoles.BASIC
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'Error');
        }
        expect.assertions(2);
    });

    it('should throw an error if the password is not provided', async () => {
        const testUser: IUser = {
            username: testUser99,
            email: 'testuser99@test.com',
            role: UserRoles.BASIC
        } as IUser;

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }
        expect.assertions(2);
    });

    it('should be able to validate a user\'s password', async () => {
        // lookup a test user
        const testUser: UserModel | null = await User.findOne({ username: 'testuser' });

        // eslint-disable-next-line
        // @ts-ignore
        const isValid = await testUser.isCorrectPassword(validTestPassword);
        // eslint-disable-next-line
        // @ts-ignore
        const isInvalid = await testUser.isCorrectPassword('testPassword2!');

        expect(isValid).toBe(true);
        expect(!isInvalid).toBe(true);
        expect.assertions(2);
    });

    /**
     * Tests for the role field
     */
    it('should throw an error if the role is not valid', async () => {
        const testUser: IUser = {
            username: 'testuser',
            email: 'badRole@test.com',
            password: validTestPassword,
            // eslint-disable-next-line
            // @ts-ignore
            role: 'invalidRole'
        };

        try {
            await User.create(testUser);
        }

        catch (err) {
            expect(err).toBeDefined();
            expect(err).toHaveProperty('name', 'ValidationError');
        }
        expect.assertions(2);
    });
});