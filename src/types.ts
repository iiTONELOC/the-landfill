import { Request } from 'express';

import {
    UserProductModel,
    AvailableSources,
    DBConnection,
    IUserProduct,
    ProductModel,
    SourceModel,
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
    UserModel,
    UserRoles,
    IProduct,
    ISource,
    IList,
    IUser
};


export interface IRequest extends Request {
    user: IJwtPayload;
}
