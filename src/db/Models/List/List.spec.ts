import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import connect, { disconnectFromDB } from '../../connection';
import UserProduct from '../UserProduct';
import mongoose from 'mongoose';
import Product from '../Product';
import Source from '../Source';
import User from '../User';
import List from './';
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
    username: 'testUser99',
    email: 'test@test.com',
    password: 'testPassword1!',
    role: UserRoles.BASIC
};

beforeAll(async () => {
    dbConnection = await connect('test-land-list');
});

afterAll(async () => {
    await List.deleteMany({});
    await User.deleteMany({});
    await Source.deleteMany({});
    await Product.deleteMany({});
    await UserProduct.deleteMany({});
    dbConnection && await disconnectFromDB(dbConnection as typeof mongoose);
});

describe('List Model', () => {
    it('should be able to create a new list', async () => {
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
                quantity: 1,
                productAlias: 'test product alias'
            };
            const userProduct: UserProductModel = await UserProduct.create(testUserProduct);

            // create a new list with the user product
            const testListData: IList = {
                name: 'test list',
                userId: newUser._id,
                products: [userProduct._id],
                isDefault: true
            };

            const newList: ListModel = await List.create(testListData);

            expect(newList).toBeDefined();
            expect(newList.name).toBe(testListData.name);
            expect(newList.userId).toBe(testListData.userId);
            expect(newList.products).toHaveLength(1);
            expect(newList.products[0]).toBe(userProduct._id);
            expect(newList.isDefault).toBe(testListData.isDefault);
        }
        catch (err) {
            console.error(err);
        }

        expect.assertions(6);
    });
});