import { Types } from 'mongoose';
import User from '../db/Models/User';
import { UserModel } from '../types';
import { GraphQLError } from 'graphql';


/**
 * Validates that a user exists in the database
 * @param userId The object id of the user to check
 * @returns True if the user exists, throws a GraphQLError if not
 */
export default async function authenticatedUser(userId: Types.ObjectId): Promise<boolean | GraphQLError> {
    const user: UserModel | null = await User.findById(userId);
    if (user) {
        return true;
    } else {
        throw new GraphQLError('User not authenticated',
            { extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } } });
    }
}
