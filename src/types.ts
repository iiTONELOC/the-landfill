import {
    UserProductModel,
    AvailableSources,
    DBConnection,
    IUserProduct,
    ProductModel,
    SourceModel,
    IUserModel,
    ListModel,
    UserModel,
    UserRoles,
    IProduct,
    ISource,
    IList,
    IUser
} from './db/types';

import { IJwtPayload } from './auth/types';

export type {
    UserProductModel,
    AvailableSources,
    DBConnection,
    IUserProduct,
    ProductModel,
    SourceModel,
    IJwtPayload,
    ListModel,
    IUserModel,
    UserModel,
    UserRoles,
    IProduct,
    ISource,
    IList,
    IUser
};

export interface AuthenticatedContext {
    user: IJwtPayload | undefined;
}
