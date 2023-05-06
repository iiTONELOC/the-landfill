import mongoose, { HydratedDocument } from 'mongoose';

/** Mongoose Schemas */
export interface IUser {
    username: string;
    email: string;
    password: string;
    role: UserRoles;
}

export enum UserRoles {
    BASIC = 'app.user',
    ADMIN = 'app.admin',
    API_USER = 'api.user',
    API_ADMIN = 'api.admin',
    SITE_ADMIN = 'site.admin',
    SITE_OWNER = 'site.owner'
}


/** Mongoose Models */
export type UserModel = HydratedDocument<IUser> & IUser;


/** Database Connection */
export type DBConnection = (typeof mongoose | null);
export type DBDisconnectPromise = Promise<boolean>;
export type DBConnectionPromise = Promise<DBConnection>;
