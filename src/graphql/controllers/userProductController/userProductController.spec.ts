import { DBConnection, AuthenticatedContext, UserModel, UserProductModel } from '../../../types';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import connect, { disconnectFromDB } from '../../../db/connection';
import { Product, Source, User, UserProduct } from '../../../db/Models';
import userProductController from '.';
import { Types } from 'mongoose';


let db: DBConnection;

beforeAll(async () => {
    db = await connect('test-land-userProductController');
});

afterAll(async () => {
    await User.deleteMany({})
    await Source.deleteMany({});
    await Product.deleteMany({});
    await UserProduct.deleteMany({});
    db && await disconnectFromDB(db);
});

describe('userProductController', () => {

    it('should be defined', () => {
        expect(userProductController).toBeDefined();
    });

    it('should have a userProductQueries property', () => {
        expect(userProductController.userProductQueries).toBeDefined();
    });

    it('should have a userProductMutations property', () => {
        expect(userProductController.userProductMutations).toBeDefined();
    });
});

describe('userProductQueries', () => {
    it('should be defined', () => {
        expect(userProductController.userProductQueries).toBeDefined();
    });
});

describe('userProductMutations', () => {
    it('should be defined', () => {
        expect(userProductController.userProductMutations).toBeDefined();
    });

    it('should have an addUserProduct method', () => {
        expect(userProductController.userProductMutations.addUserProduct).toBeDefined();
    });

    describe('addUserProduct', () => {

        it('should be defined', () => {
            expect(userProductController.userProductMutations.addUserProduct).toBeDefined();
        });

        //     //It works just commented out for dev purposes so this test doesn't run every time
        //     it('should add a userProduct to the database, given a barcode and a userId', async () => {
        //         const newUser: UserModel | null = (await User.create({
        //             username: 'testUser',
        //             email: 'testUser@test.com',
        //             password: 'testPassword1!',
        //         })).toObject() as UserModel;


        //         const result = await userProductController.userProductMutations.addUserProduct(null,
        //             {
        //                 barcode: '037000962571',
        //                 userId: newUser?._id as Types.ObjectId,
        //             }, {
        //                 user: {
        //                     _id: newUser?._id,
        //                     username: newUser?.username,
        //                     email: newUser?.email,
        //                 }
        //             } as AuthenticatedContext);
        //         expect(result).toBeDefined();
        //     });
        // });

        // describe('updateUserProduct', () => {
        //     it('should be defined', () => {
        //         expect(userProductController.userProductMutations.updateUserProduct).toBeDefined();
        //     });

        //     it('should update a userProduct in the database, given a userProductId and a userId', async () => {
        //         const testUser: UserModel | null = (await User.findOne({ username: 'testUser' }).select(' -__v  -password')) as UserModel;
        //         const testUserProduct = await UserProduct.findOne({ userId: testUser?._id }).select('-__v -userId ').populate({
        //             path: 'productData',
        //             select: '-__v -source',
        //         }) as UserProductModel;

        //         const editedResult = await userProductController
        //             .userProductMutations
        //             .updateUserProduct(null,
        //                 {
        //                     userProductId: testUserProduct?._id,
        //                     userId: testUser?._id,
        //                     productAlias: 'testAlias',
        //                 }, {
        //                     user: {
        //                         _id: testUser?._id,
        //                         username: testUser?.username,
        //                         email: testUser?.email,
        //                     }
        //                 } as AuthenticatedContext) as UserProductModel;

        //         expect(editedResult).toBeDefined();
        //         expect(editedResult?.productAlias).toBe('testAlias');
        //         expect(editedResult?.userId).toEqual(testUser?._id);
        //         expect(editedResult?.productData.toJSON()).toEqual(testUserProduct?.productData.toJSON());

        //         expect.assertions(4);
        //     });
    });
})