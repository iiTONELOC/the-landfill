import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import connect, { disconnectFromDB } from './'
import { DBConnection } from '../types';
import mongoose from 'mongoose';

describe('Connection Module', () => {
    let dbConnection: DBConnection = null;

    beforeAll(async () => {
        dbConnection = await connect('test-land');
    });

    afterAll(async () => {
        dbConnection && await disconnectFromDB(dbConnection);
    });

    it('should return a connection object', () => {
        expect(dbConnection).toBeDefined();
        expect(typeof dbConnection).toEqual(typeof mongoose);

        const nativeConnection: (mongoose.Connection | undefined) = dbConnection?.connections[0];
        const db: (mongoose.mongo.Db | undefined) = nativeConnection?.db;
        const namespace: (string | undefined) = db?.namespace;

        expect(nativeConnection).toBeDefined();
        expect(nativeConnection).toBeInstanceOf(mongoose.Connection);

        expect(db).toBeDefined();
        expect(db).toBeInstanceOf(mongoose.mongo.Db);

        expect(namespace).toBeDefined();
        expect(typeof namespace).toEqual('string');
        expect(namespace).toEqual('test-land');

        expect.assertions(9);
    });

    it('should be able to disconnect from the database', async () => {
        const result = await disconnectFromDB(dbConnection as typeof mongoose);
        expect(result).toEqual(true);
    });

    it('should be able to reconnect to the database', async () => {
        dbConnection = await connect('test-land');

        expect(dbConnection).toBeDefined();
        expect(typeof dbConnection).toEqual(typeof mongoose);
        expect(dbConnection?.connections[0]?.db?.namespace).toEqual('test-land');

        expect.assertions(3);
    });
});
