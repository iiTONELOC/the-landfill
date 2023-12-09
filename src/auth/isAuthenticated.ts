import User from '../db/Models/User';
import { UserModel } from '../types';
import { GraphQLError } from 'graphql';


/**
 * Validates that a user exists in the database
 * @param user The AuthenticatedContext as a UserModel
 * @returns True if the user exists, throws a GraphQLError if not
 */
export default async function authenticatedUser(user: UserModel | null): Promise<boolean | GraphQLError> {
    if (!user) {
        throw new GraphQLError('You must be logged in!');
    }
    const _user: UserModel | null = await User.findById(user._id).catch(() => null);

    if (_user) {
        return true;
    } else {
        throw new GraphQLError('User not authenticated',
            { extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } } });
    }
}
