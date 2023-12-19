import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLError } from 'graphql';
import { signToken } from '../../../auth/jwtMiddleware';
import authenticatedUser from '../../../auth/isAuthenticated';
import { User, List, ListItem, DeviceKey } from '../../../db/Models';
import { AuthenticatedContext, IUser, UserModel } from '../../../types';

const INCORRECT_CREDENTIALS = 'Incorrect credentials';


export const userQueries = {
    queryMe:
        async function queryMe(_: any, __: any, context: AuthenticatedContext): Promise<Partial<UserModel> | GraphQLError> {
            await authenticatedUser(context.user as UserModel);
            const user = (await User.findById(context?.user?._id).select('-password').populate('lists'))?.toObject() as UserModel;
            if (user) {
                return user;
            }
            throw new GraphQLError('User not found');
        }
};

export const userMutations = {
    addUser: // NOSONAR
        // eslint-disable-next-line
        async function addUser(_: any, { username, email, password }: IUser, __: AuthenticatedContext) {
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
        },
    loginUserDevice:
        async function loginUserDevice(_: any, { username, password, deviceKey }: { username: string, password: string, deviceKey: string }) {
            try {
                const user = (await User.findOne({ username }));//NOSONAR
                if (!user) {
                    throw new GraphQLError(INCORRECT_CREDENTIALS);
                }

                // look up a device key for the user - only one key is registered at a time
                const userDeviceKey = await DeviceKey.findOne({ userId: user?._id });//NOSONAR
                const validDeviceKey = await userDeviceKey?.isCorrectKey(deviceKey);
                const validPassword = await user.isCorrectPassword(password);

                if (!validPassword || !validDeviceKey) {
                    throw new GraphQLError(INCORRECT_CREDENTIALS);
                }

                const token = signToken(user.toObject() as UserModel);
                return { user, token };

            } catch (error) {
                if (error?.toString().includes(INCORRECT_CREDENTIALS)) {
                    // eslint-disable-next-line
                    // @ts-ignore
                    throw new GraphQLError(INCORRECT_CREDENTIALS);

                } else {
                    throw new GraphQLError('Error logging in user');
                }
            }
        },
    updateUser:
        async function updateUser(_: any, args: { username?: string, email?: string }, { user }: AuthenticatedContext) {
            //see if the user is authenticated
            await authenticatedUser(user as UserModel);

            try {
                // update the user with the args
                const updated = await User.findByIdAndUpdate(user as UserModel,//NOSONAR
                    args, { new: true, runValidators: true });
                return updated?.toObject() as UserModel;
            } catch (error) {
                if (error?.toString().includes('E11000 duplicate key error')) {
                    throw new GraphQLError('Already exists');
                } else {
                    throw new GraphQLError('Error updating user');
                }
            }
        },
    deleteUser:
        async function deleteUser(_: any, __: any, { user }: AuthenticatedContext) {
            //see if the user is authenticated - throws an error if not
            await authenticatedUser(user as UserModel);

            try {
                // delete the user
                const deleted: UserModel = await User.findByIdAndDelete(user as UserModel).populate('lists') as UserModel;

                // delete the user's lists
                await List.deleteMany({ _id: { $in: deleted?.lists?.map(el => el?._id) } }); //NOSONAR

                // delete list items associated with deleted lists
                await ListItem.deleteMany({ listId: { $in: deleted?.lists?.map(el => el?._id) } }); //NOSONAR

                return deleted?.toObject() as UserModel;
            } catch (error) {
                throw new GraphQLError('Error deleting user');
            }
        },
    generateDeviceKey:
        async function generateDeviceKey(_: any, __: any, { user }: AuthenticatedContext) {
            //see if the user is authenticated - throws an error if not
            await authenticatedUser(user as UserModel);

            try {
                // generate a UUID v4 for the device key
                const deviceKey: string = uuidv4();
                // create a device key for the user
                const newDevice = await DeviceKey.create({ userId: user?._id, key: deviceKey });

                // delete any other device keys for the this user
                await DeviceKey.deleteMany({ userId: user?._id, _id: { $ne: newDevice?._id } }); //NOSONAR

                return deviceKey;
            } catch (error) {
                throw new GraphQLError('Error generating device key');
            }
        }
};

const userController = {
    userQueries,
    userMutations
};

export default userController;
