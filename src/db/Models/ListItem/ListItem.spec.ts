import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import connect, { disconnectFromDB } from '../../connection';
import { IListItem, ListItemModel } from '../../types';
import mongoose, { Types } from 'mongoose';
import ListItem from './';

const testListId: Types.ObjectId = new Types.ObjectId();
const testUserProductId: Types.ObjectId = new Types.ObjectId();

const testListItem: IListItem = {
    listId: testListId,
    productId: testUserProductId,
    username: 'testUser99',
};

let connection: typeof mongoose | null = null;

beforeAll(async () => {
    connection = await connect();
});

afterAll(async () => {
    connection && await disconnectFromDB(connection);
});



describe('ListItem Model', () => {
    it('should be defined', () => {
        expect(ListItem).toBeDefined();
    });

    it('should create & save listItem successfully', async () => {
        const newListItem: ListItemModel | undefined = await ListItem.create(testListItem);

        const didCreate = await ListItem.exists({ _id: newListItem?._id });

        expect(didCreate).toBeTruthy();
    });
});

