import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import connect, { disconnectFromDB } from '../../connection';
import mongoose from 'mongoose';
import Product from '../Product';
import Source from '../Source';
import UserProduct from './';
import User from '../User';
import {
    UserProductModel,
    AvailableSources,
    DBConnection,
    IUserProduct,
    ProductModel,
    SourceModel,
    UserModel,
    UserRoles,
    IProduct,
    ISource,
    IUser,
} from '../../types';


let dbConnection: DBConnection = null;

const testSourceData: ISource = {
    name: AvailableSources.BARCODE_INDEX,
    urlToSearchResult: 'https://www.barcodeindex.com/search?q=0049000012507'
};

const testProductData: IProduct = {
    name: 'test product - Coca Cola Classic 12oz Cans (Pack of 24)',
    barcode: ['0049000012507'],
    // eslint-disable-next-line
    // @ts-ignore
    source: null
};

const testUserData: IUser = {
    username: 'testUser',
    email: 'test@test.com',
    password: 'testPassword1!',
    role: UserRoles.BASIC,
    webAuthnRegistered: false,
    useWebAuthn: false,
};

beforeAll(async () => {
    dbConnection = await connect();
});

afterAll(async () => {
    await User.deleteMany({});
    await Source.deleteMany({});
    await Product.deleteMany({});
    await UserProduct.deleteMany({});
    dbConnection && await disconnectFromDB(dbConnection as typeof mongoose);
});

describe('UserProduct Model', () => {
    it('should be able to create a new user product', async () => {
        try {
            // create user
            const newUser: UserModel = await User.create(testUserData);
            // create the source for the product
            const newSource: SourceModel = await Source.create(testSourceData);
            // create a new product with the source information
            const newProduct: ProductModel = await Product.create({ ...testProductData, source: newSource._id });

            // create a new user product with the product information
            const testUserProduct: IUserProduct = {
                productData: newProduct._id,
                userId: newUser._id,
                productAlias: 'test product alias',
            };
            const userProduct: UserProductModel = await UserProduct.create(testUserProduct);

            expect(userProduct).toBeDefined();
            expect(userProduct._id).toBeDefined();
            expect(userProduct.productData).toStrictEqual(testUserProduct.productData);
            expect(userProduct.userId).toStrictEqual(testUserProduct.userId);
            expect(userProduct.productAlias).toBe(testUserProduct.productAlias);
        } catch (error) {
            console.error(error);//NOSONAR
        }

        expect.assertions(5);
    });
});
