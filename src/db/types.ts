import mongoose, { HydratedDocument, Types } from 'mongoose';

/** Mongoose Schemas */

// USER
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

// SOURCE
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

// PRODUCT
export interface IProduct {
    name: string;
    barcode: string[];
    source: Types.ObjectId;
}

// USER PRODUCT
// This is a wrapper for the product model that allows the user to make their
// own changes without affecting the database's integrity.
export interface IUserProduct {
    productData: Types.ObjectId;
    userId: Types.ObjectId;
    productAlias?: string;
    quantity: number;
    notes?: string;
}

// LIST
export interface IList {
    userId: Types.ObjectId;
    name: string;
    products: Types.ObjectId[];
    isDefault: boolean;
}

/** Mongoose Models */
export type UserModel = HydratedDocument<IUser> & IUser;
export type ListModel = HydratedDocument<IList> & IList;
export type SourceModel = HydratedDocument<ISource> & ISource;
export type ProductModel = HydratedDocument<IProduct> & IProduct;
export type UserProductModel = HydratedDocument<IUserProduct> & IUserProduct;


/** Database Connection */
export type DBConnection = (typeof mongoose | null);
export type DBDisconnectPromise = Promise<boolean>;
export type DBConnectionPromise = Promise<DBConnection>;
