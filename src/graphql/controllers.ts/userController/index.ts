import 'dotenv/config';
import { GraphQLError } from 'graphql';
import User from '../../../db/Models/User';
import { signToken } from '../../../auth/jwtMiddleware';
import authenticatedUser from '../../../auth/isAuthenticated';
import { AuthenticatedContext, IUser, UserModel } from '../../../types';
import { Types } from 'mongoose';

const INCORRECT = 'Incorrect credentials';

export async function queryMe(_: any, __: any, context: AuthenticatedContext): Promise<Partial<UserModel> | GraphQLError> {
    if (!context.user) {
        throw new GraphQLError('Not authenticated');
    }

    // verify that the user exists in the database
    await authenticatedUser(context.user._id);
    const user = (await User.findById(context.user._id).select('-password'))?.toObject() as UserModel;//NOSONAR
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
        // check for certain errors like duplicate user or password requirements
        if (error?.toString().includes('E11000 duplicate key error')) {
            throw new GraphQLError('User already exists');
        } else if (error?.toString().includes('Password must')) {
            // eslint-disable-next-line
            // @ts-ignore
            throw new GraphQLError(error?.message?.toString());
        } else {
            throw new GraphQLError('Error creating user');
        }
    }
}

export async function loginUser(_: any, { email, password }: IUser) {
    try {
        const user = (await User.findOne({ email }));//NOSONAR
        if (!user) {
            throw new GraphQLError(INCORRECT);
        }

        const validPassword = await user.isCorrectPassword(password);

        if (!validPassword) {
            throw new GraphQLError(INCORRECT);
        }

        const token = signToken(user.toObject() as UserModel);
        return { user, token };

    } catch (error) {


        if (error?.toString().includes(INCORRECT)) {
            // eslint-disable-next-line
            // @ts-ignore
            throw new GraphQLError(INCORRECT);

        } else {
            throw new GraphQLError('Error logging in user');
        }

    }
}

export async function updateUser(_: any, args: { username?: string, email?: string }, { user }: AuthenticatedContext) {
    //see if the user is authenticated
    await authenticatedUser(user?._id as Types.ObjectId);

    try {
        // update the user with the args
        const updated = await User.findByIdAndUpdate(user?._id as Types.ObjectId,//NOSONAR
            args, { new: true, runValidators: true });
        return updated?.toObject() as UserModel;
    } catch (error) {
        if (error?.toString().includes('E11000 duplicate key error')) {
            throw new GraphQLError('Already exists');
        } else {
            throw new GraphQLError('Error updating user');
        }
    }
}

export async function deleteUser(_: any, __: any, { user }: AuthenticatedContext) {
    //see if the user is authenticated - throws an error if not
    await authenticatedUser(user?._id as Types.ObjectId);

    try {
        // delete the user
        const deleted = await User.findByIdAndDelete(user?._id as Types.ObjectId);//NOSONAR
        return deleted?.toObject() as UserModel;
    } catch (error) {
        throw new GraphQLError('Error deleting user');
    }
}

export const userQueries = {
    queryMe
};

export const userMutations = {
    addUser,
    loginUser,
    updateUser,
    deleteUser
};

const userController = {
    userQueries,
    userMutations
};

export default userController;
