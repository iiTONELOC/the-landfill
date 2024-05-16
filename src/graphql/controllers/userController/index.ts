import 'dotenv/config';
import {v4 as uuidv4} from 'uuid';
import {GraphQLError} from 'graphql';
import {signToken} from '../../../auth/jwtMiddleware';
import validateAppKey from '../../../auth/validateAppKey';
import authenticatedUser from '../../../auth/isAuthenticated';
import validateDeviceKey from '../../../auth/validateDeviceKey';
import {User, List, ListItem, DeviceKey, AppKey} from '../../../db/Models';
import {AuthenticatedContext, IJwtPayload, IUser, UserModel} from '../../../types';

const INCORRECT_CREDENTIALS = 'Incorrect credentials';

export const userQueries = {
  queryMe: async function queryMe(
    _: any,
    __: any,
    context: AuthenticatedContext,
  ): Promise<Partial<UserModel> | GraphQLError> {
    await authenticatedUser(context.user as UserModel);
    const user = (
      await User.findById(context?.user?._id).select('-password').populate('lists')
    )?.toObject() as UserModel;
    if (user) {
      return user;
    }
    throw new GraphQLError('User not found');
  },
};

export const userMutations = {
  // NOSONAR
  addUser:
    // eslint-disable-next-line
    async function addUser(_: any, {username, email, password}: IUser, __: AuthenticatedContext) {
      try {
        const user: UserModel | null = (
          await User.create({username, email, password})
        ).toObject() as UserModel;
        if (user) {
          const token = signToken(user);
          if (token) {
            return {user, token};
          } else {
            throw new GraphQLError('Error creating authentication token!');
          }
        } else {
          throw new GraphQLError('Error creating user');
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
  addUserFromApp: async function addUserFromApp(
    _: any,
    {username, email, password}: IUser,
    __: AuthenticatedContext,
  ) {
    // try to create the user first using the
    try {
      const {user, token} = await userMutations.addUser(
        _,
        {username, email, password} as IUser,
        __,
      );

      if (!user) {
        throw new GraphQLError('Error creating user');
      }

      if (!token) {
        // delete the user if the token is not created
        await User.findByIdAndDelete(user?._id); //NOSONAR
        throw new GraphQLError('Error creating authentication token!');
      }

      // generate a unique app key for the user's account,this is akin to an API key and
      // is valid for only 30 days. This Key must accompany all requests to log a user in from the app
      const appKey = await userMutations.generateAppKey(_, __, {
        user: {_id: user?._id, username: user?.username, email: user?.email},
      });

      if (!appKey) {
        throw new GraphQLError('Error generating app key');
      }
      return {user, token, appKey};
    } catch (error) {
      throw new GraphQLError(
        // eslint-disable-next-line
        // @ts-ignore
        error?.message?.toString() ?? 'Error creating user from app',
      );
    }
  },
  loginUserDevice: async function loginUserDevice(
    _: any,
    {username, password, deviceKey}: {username: string; password: string; deviceKey: string},
  ) {
    try {
      const user = await User.findOne({username}); //NOSONAR
      const validPassword = await user?.isCorrectPassword(password);
      if (!user || !validPassword) {
        throw new GraphQLError(INCORRECT_CREDENTIALS);
      }

      await validateDeviceKey(deviceKey, user?._id?.toString() ?? '');

      const token = signToken(user.toObject() as UserModel);
      return {user, token};
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
  loginUserApp: async function loginUserApp(
    _: any,
    {username, password, appKey}: {username: string; password: string; appKey: string},
  ) {
    try {
      const user = await User.findOne({username}); //NOSONAR
      // check if the password is valid
      const validPassword = await user?.isCorrectPassword(password);
      if (!user || !validPassword) {
        throw new GraphQLError(INCORRECT_CREDENTIALS);
      }

      await validateAppKey(appKey, user?._id?.toString() ?? '');

      const token = signToken(user.toObject() as UserModel);
      return {user, token};
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
  updateUser: async function updateUser(
    _: any,
    args: {username?: string; email?: string},
    {user}: AuthenticatedContext,
  ) {
    //see if the user is authenticated
    await authenticatedUser(user as UserModel);

    try {
      // update the user with the args
      const updated = await User.findByIdAndUpdate(
        user as UserModel, //NOSONAR
        args,
        {new: true, runValidators: true},
      );
      return updated?.toObject() as UserModel;
    } catch (error) {
      if (error?.toString().includes('E11000 duplicate key error')) {
        throw new GraphQLError('Already exists');
      } else {
        throw new GraphQLError('Error updating user');
      }
    }
  },
  deleteUser: async function deleteUser(_: any, __: any, {user}: AuthenticatedContext) {
    //see if the user is authenticated - throws an error if not
    await authenticatedUser(user as UserModel);

    try {
      // delete the user
      const deleted: UserModel = (await User.findByIdAndDelete(user as UserModel).populate(
        'lists',
      )) as UserModel;

      // delete the user's lists
      await List.deleteMany({
        _id: {$in: deleted?.lists?.map(el => el?._id)},
      }); //NOSONAR

      // delete list items associated with deleted lists
      await ListItem.deleteMany({
        listId: {$in: deleted?.lists?.map(el => el?._id)},
      }); //NOSONAR

      return deleted?.toObject() as UserModel;
    } catch (error) {
      throw new GraphQLError('Error deleting user');
    }
  },
  generateDeviceKey: async function generateDeviceKey(
    _: any,
    __: any,
    {user}: AuthenticatedContext,
  ) {
    //see if the user is authenticated - throws an error if not
    await authenticatedUser(user as UserModel);

    try {
      // generate a UUID v4 for the device key
      const deviceKey: string = uuidv4();
      // create a device key for the user
      const newDevice = await DeviceKey.create({
        userId: user?._id,
        key: deviceKey,
      });

      // delete any other device keys for the this user
      await DeviceKey.deleteMany({
        userId: user?._id,
        _id: {$ne: newDevice?._id},
      }); //NOSONAR

      return deviceKey;
    } catch (error) {
      throw new GraphQLError('Error generating device key');
    }
  },
  generateAppKey: async function generateAppKey(_: any, __: any, {user}: AuthenticatedContext) {
    //see if the user is authenticated - throws an error if not
    await authenticatedUser(user as UserModel);

    try {
      // generate a UUID v4 for the app key
      const appKey: string = uuidv4();
      // create a app key for the user
      const newAppKey = await AppKey.create({
        userId: user?._id,
        key: appKey,
      });

      // delete any other app keys for the this user
      await AppKey.deleteMany({
        userId: user?._id,
        _id: {$ne: newAppKey?._id},
      }); //NOSONAR

      return appKey;
    } catch (error) {
      // eslint-disable-next-line
      // @ts-ignore
      throw new GraphQLError('Error generating app key');
    }
  },
  appRefreshJWT: async function appRefreshJWT(
    _: any,
    {appKey}: {appKey: string},
    {user}: AuthenticatedContext,
  ) {
    if (!appKey) {
      throw new GraphQLError('Unauthorized');
    }
    //see if the user is authenticated - throws an error if not
    await Promise.all([
      authenticatedUser(user as UserModel),
      validateAppKey(appKey, user?._id?.toString() ?? ''),
    ]);

    try {
      // sign a new token for the user
      const token = signToken(user as IJwtPayload);
      return {token};
    } catch (error) {
      throw new GraphQLError('Error refreshing token');
    }
  },
  regenerateDeviceKeyFromDevice: async function regenerateDeviceKeyFromDevice(
    _: any,
    {deviceKey, username, password}: {deviceKey: string; username: string; password: string},
  ) {
    if (!deviceKey) {
      throw new GraphQLError('Unauthorized');
    }
    try {
      // verify the user
      const user = await User.findOne({username}); //NOSONAR
      // check if the password is valid
      const validPassword = await user?.isCorrectPassword(password);

      if (!user || !validPassword) {
        throw new GraphQLError(INCORRECT_CREDENTIALS);
      }
      // eslint-disable-next-line
      //@ts-ignore
      const newDeviceKey = await userMutations.generateDeviceKey(_, {}, {user});

      return newDeviceKey;
    } catch (error) {
      if (error?.toString().includes(INCORRECT_CREDENTIALS)) {
        // eslint-disable-next-line
        // @ts-ignore
        throw new GraphQLError(INCORRECT_CREDENTIALS);
      } else {
        console.log('ERROR', error);
        throw new GraphQLError('Error regenerating device key');
      }
    }
  },
  regenerateAppKeyFromApp: async function regenerateAppKeyFromApp(
    _: any,
    {appKey}: {appKey: string},
    {user}: AuthenticatedContext,
  ) {
    if (!appKey) {
      throw new GraphQLError('Unauthorized');
    }
    //see if the user is authenticated - throws an error if not
    await Promise.all([
      authenticatedUser(user as UserModel),
      validateAppKey(appKey, user?._id?.toString() ?? ''),
    ]);

    try {
      // generate a new app key
      // eslint-disable-next-line
      // @ts-ignore
      const newAppKey = await userMutations.generateAppKey(_, __, {user});
      return newAppKey;
    } catch (error) {
      throw new GraphQLError('Error regenerating app key');
    }
  },
  regenerateDeviceKeyFromApp: async function regenerateDeviceKeyFromApp(
    _: any,
    {appKey}: {appKey: string},
    {user}: AuthenticatedContext,
  ) {
    if (!appKey) {
      throw new GraphQLError('Unauthorized');
    }
    //see if the user is authenticated - throws an error if not
    await Promise.all([
      authenticatedUser(user as UserModel),
      validateAppKey(appKey, user?._id?.toString() ?? ''),
    ]);

    try {
      // generate a new device key
      // eslint-disable-next-line
      // @ts-ignore
      const newDeviceKey = await userMutations.generateDeviceKey(_, __, {user});
      return newDeviceKey;
    } catch (error) {
      throw new GraphQLError('Error regenerating device key');
    }
  },
};

const userController = {
  userQueries,
  userMutations,
};

export default userController;
