import 'dotenv/config';
import { GraphQLError } from 'graphql';
import User from '../../../db/Models/User';
import { signToken } from '../../../auth/jwtMiddleware';
import authenticatedUser from '../../../auth/isAuthenticated';
import { AuthenticatedContext, IUser, UserModel, IUserModel } from '../../../types';


export async function queryMe(_: any, __: any, context: AuthenticatedContext): Promise<Partial<UserModel> | GraphQLError> {
    if (!context.user) {
        throw new GraphQLError('Not authenticated');
    }

    // verify that the user exists in the database
    await authenticatedUser(context.user._id);
    const user = (await User.findById(context.user._id))?.toObject() as UserModel;
    if (user) {
        return user;
    }
    throw new GraphQLError('User not found');
}

export async function addUser(_: any, { username, email, password }: IUser, __: AuthenticatedContext) {
    try {
        const user: UserModel | null = ((await User.create({ username, email, password }))).toObject() as UserModel;
        if (user) {
            const token = signToken(user);
            if (token) {
                return { user, token };
            } else {
                throw new GraphQLError('Error creating authentication token!');
            }
        }
    } catch (error) {
        // check for a duplicate key error so we can forward the correct message
        if (error?.toString().includes('E11000 duplicate key error')) {
            throw new GraphQLError('User already exists');
        } else {
            throw new GraphQLError('Error creating user');
        }
    }
}

export async function loginUser(_: any, { email, password }: IUser, __: AuthenticatedContext) {
    try {
        const user = (await User.findOne({ email }));
        if (!user) {
            throw new GraphQLError('Incorrect credentials');
        }

        const validPassword = await user.isCorrectPassword(password);

        if (!validPassword) {
            throw new GraphQLError('Incorrect credentials');
        }

        const token = signToken(user.toObject() as UserModel);
        return { user, token };

    } catch (error) {
        console.error(error);
        throw new GraphQLError('Error logging in user');
    }
}


export const userQueries = {
    queryMe
};

export const userMutations = {
    addUser,
    loginUser
};

const userController = {
    userQueries,
    userMutations
};

export default userController;
