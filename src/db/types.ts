import mongoose, { HydratedDocument, Schema } from 'mongoose';

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

export interface ISource {
    name: AvailableSources;
    urlToSearchResult?: string;
}

export enum AvailableSources {
    BARCODE_INDEX = 'barcodeIndex',
    UPC_ITEM_DB = 'upcItemDB',
    BARCODE_SPIDER = 'barcodeSpider',
    USER_PROVIDED = 'userProvided'
}

export interface IProduct {
    name: string;
    barcode: string[];
    source: Schema.Types.ObjectId;
}



/** Mongoose Models */
export type UserModel = HydratedDocument<IUser> & IUser;
export type SourceModel = HydratedDocument<ISource> & ISource;
export type ProductModel = HydratedDocument<IProduct> & IProduct;


/** Database Connection */
export type DBConnection = (typeof mongoose | null);
export type DBDisconnectPromise = Promise<boolean>;
export type DBConnectionPromise = Promise<DBConnection>;
