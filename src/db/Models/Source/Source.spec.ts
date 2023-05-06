import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { AvailableSources, ISource, SourceModel, DBConnection } from '../../types';
import connect, { disconnectFromDB } from '../../connection';
import mongoose from 'mongoose';
import Source from './';

const testSource: ISource = {
    name: AvailableSources.BARCODE_INDEX,
    urlToSearchResult: 'https://www.barcodeindex.com/search?q=0049000012507'
};

let dbConnection: DBConnection = null;

beforeAll(async () => {
    dbConnection = await connect('test-land');
});

afterAll(async () => {
    await Source.deleteMany({});
    dbConnection && await disconnectFromDB(dbConnection as typeof mongoose);
});


describe('Source Model', () => {
    it('should be able to create a new source', async () => {
        const source: SourceModel | null = await Source.create(testSource);
        expect(source).toBeDefined();
        expect(source._id).toBeDefined();
        expect(source.name).toBe(testSource.name);
        expect(source.urlToSearchResult).toBe(testSource.urlToSearchResult);

        expect.assertions(4);
    });

    it('should throw an error if the source name is not one of the available sources', async () => {
        const invalidSource: ISource = {
            // eslint-disable-next-line
            // @ts-ignore
            name: 'invalidSourceName',
            urlToSearchResult: 'https://www.barcodeindex.com/search?q=0049000012501'
        };

        try {
            await Source.create(invalidSource);
        }
        catch (error) {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
            expect(error).toHaveProperty('name', 'ValidationError');
        }

        expect.assertions(3);
    });

    it('should throw an error if the source name is not provided', async () => {
        const invalidSource: ISource = {
            // eslint-disable-next-line
            // @ts-ignore
            name: null,
            urlToSearchResult: 'https://www.barcodeindex.com/search?q=0049000012504'
        };

        try {
            await Source.create(invalidSource);
        }
        catch (error) {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
            expect(error).toHaveProperty('name', 'ValidationError');
        }

        expect.assertions(3);
    });

    it('should throw an error if the url is not a string', async () => {
        const invalidSource: ISource = {
            name: AvailableSources.BARCODE_INDEX,
            // eslint-disable-next-line
            // @ts-ignore
            urlToSearchResult: 123
        };

        try {
            await Source.create(invalidSource);
        }
        catch (error) {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
            expect(error).toHaveProperty('name', 'ValidationError');
        }

        expect.assertions(3);
    });

    it('should throw an error if the url is not provided', async () => {
        const invalidSource: ISource = {
            name: AvailableSources.BARCODE_INDEX,
            // eslint-disable-next-line
            // @ts-ignore
            urlToSearchResult: null
        };

        try {
            await Source.create(invalidSource);
        }
        catch (error) {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
            expect(error).toHaveProperty('name', 'ValidationError');
        }

        expect.assertions(3);
    });

    it('should throw an error if the url is not a valid url', async () => {
        const invalidSource: ISource = {
            name: AvailableSources.BARCODE_INDEX,
            urlToSearchResult: 'invalid url'
        };

        try {
            await Source.create(invalidSource);
        }
        catch (error) {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
            expect(error).toHaveProperty('name', 'ValidationError');
        }

        expect.assertions(3);
    });

    it('should upgrade http to https if the url is not https', async () => {
        const invalidSource: ISource = {
            name: AvailableSources.BARCODE_INDEX,
            urlToSearchResult: 'http://www.barcodeindex.com/search?q=0049000012517'
        };

        const source: SourceModel | null = await Source.create(invalidSource);
        expect(source).toBeDefined();
        expect(source.urlToSearchResult).toBe('https://www.barcodeindex.com/search?q=0049000012517');

        expect.assertions(2);
    });

});
