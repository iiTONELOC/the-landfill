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
    IListItem,
    ListItemModel,
} from '../../types';
import ListItem from '../ListItem';


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
                productAlias: 'test product alias'
            };

            // FIXME: This has been updated to use an additional model. The list now has a list item model
            // which then references the user product model. This is to allow for the list item to have
            // additional information such as quantity, etc, and we only need to have one userProduct entry
            // per product & user.
            const userProduct: UserProductModel = await UserProduct.create(testUserProduct);

            // create a new ListItem with the Lis

            // create a new list
            const testListData: IList = {
                name: 'test list',
                userId: newUser._id,
                isDefault: true,
                products: []
            };

            const newList: ListModel = await List.create(testListData);

            // create a new listItem with the userProduct and list information
            const testListItemData: IListItem = {
                listId: newList._id,
                productId: userProduct._id,
                username: newUser.username,
            };

            const newListItem: ListItemModel = await ListItem.create(testListItemData);

            const updatedList: ListModel | null = await List.findByIdAndUpdate(newList._id, { $push: { products: newListItem._id } }, { new: true }).populate('products') as ListModel;

            expect(updatedList).toBeDefined();
            expect(updatedList.name).toBe(testListData.name);
            expect(updatedList.userId.toString()).toBe(testListData.userId.toString());
            expect(updatedList.products).toHaveLength(1);
            expect(updatedList.products[0]._id.toString()).toBe(newListItem._id.toString());
            expect(updatedList.isDefault).toBe(testListData.isDefault);
        }
        catch (err) {
            console.error(err);
        }

        expect.assertions(6);
    });
});