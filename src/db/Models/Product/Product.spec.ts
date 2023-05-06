import { IProduct, ProductModel, ISource, SourceModel, DBConnection, AvailableSources } from '../../types';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import connect, { disconnectFromDB } from '../../connection';
import mongoose from 'mongoose';
import Source from '../Source';
import Product from './'

let dbConnection: DBConnection = null;
let testSource: SourceModel | null = null;

const testSourceData: ISource = {
    name: AvailableSources.BARCODE_INDEX,
    urlToSearchResult: 'https://www.barcodeindex.com/search?q=0049000012507'
};

beforeAll(async () => {
    dbConnection = await connect();
    testSource = await Source.create(testSourceData);
});

afterAll(async () => {
    await Source.deleteMany({});
    await Product.deleteMany({});
    dbConnection && await disconnectFromDB(dbConnection as typeof mongoose);
});


describe('Product Model', () => {
    it('should be able to create a new product', () => {
        testSource?._id && (async () => {
            const testProduct: IProduct = {
                name: 'test product',
                barcode: ['0049000012507'],
                // eslint-disable-next-line
                // @ts-ignore
                source: testSource?._id
            };

            const product: ProductModel | null = await Product.create(testProduct);
            expect(product).toBeDefined();
            expect(product?._id).toBeDefined();
            expect(product?.name).toBe(testProduct.name);
            expect(product?.barcode).toStrictEqual(testProduct.barcode);
            expect(product?.source).toStrictEqual(testProduct.source);

            expect.assertions(5);
        })();
    });

    it('should throw an error if the product name is not provided', async () => {
        testSource?._id && (async () => {
            const testProduct: IProduct = {
                // eslint-disable-next-line
                // @ts-ignore
                name: null,
                barcode: ['0049000012517'],
                // eslint-disable-next-line
                // @ts-ignore
                source: testSource?._id
            };

            try {
                await Product.create(testProduct);
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error).toHaveProperty('name', 'ValidationError');
            }

            expect.assertions(3);
        })();
    });

    it('should throw an error if the product barcode is not provided', async () => {
        testSource?._id && (async () => {
            const testProduct: IProduct = {
                name: 'test product',
                // eslint-disable-next-line
                // @ts-ignore
                barcode: null,
                // eslint-disable-next-line
                // @ts-ignore
                source: testSource?._id
            };

            try {
                await Product.create(testProduct);
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error).toHaveProperty('name', 'ValidationError');
            }

            expect.assertions(3);
        })();
    });

    it('should throw an error if the product source is not provided', async () => {
        testSource?._id && (async () => {
            const testProduct: IProduct = {
                name: 'test product',
                barcode: ['0049000012517'],
                // eslint-disable-next-line
                // @ts-ignore
                source: null
            };

            try {
                await Product.create(testProduct);
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
                expect(error).toHaveProperty('name', 'ValidationError');
            }

            expect.assertions(3);
        })();
    });
});