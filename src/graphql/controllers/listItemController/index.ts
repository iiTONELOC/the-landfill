import 'dotenv/config';
import { Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { ListItem } from '../../../db/Models';
import authenticatedUser from '../../../auth/isAuthenticated';
import { addListItemArgs, updateListItemArgs } from '../types';
import { AuthenticatedContext, ListItemModel, UserModel } from '../../../types';


export const listItemQueries = {
    // searches for the context user's list item
    listItem: async (_: any, { listItemId }: { listItemId: Types.ObjectId }, { user }: AuthenticatedContext) => {
        await authenticatedUser(user as UserModel);

        const listItem: ListItemModel | null = await ListItem.findById(listItemId)
            .populate({ path: 'product', populate: { path: 'productData' } })
            .catch((_: Error) => {
                throw new GraphQLError('Error searching for item.');
            });

        if (!listItem || listItem.username !== user?.username) {
            throw new GraphQLError('Item not found.');
        }

        return listItem;
    }
};

export const listItemMutations = {
    // used internally
    createListItem:
        async (_: any, { listId, productId, username, quantity, notes, isCompleted }: addListItemArgs, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const createdListItem = await ListItem.create({
                listId,
                productId,
                username,
                quantity,
                notes,
                isCompleted
            }).catch((err: Error) => {
                throw new GraphQLError('Error creating item.');
            });

            return createdListItem;
        },
    // allows for quantity, notes, and isCompleted to be updated
    updateListItem:
        async (_: any, { listItemId, quantity, notes, isCompleted }: updateListItemArgs, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const listItem: ListItemModel | null = await ListItem.findById(listItemId).catch((_: Error) => {
                throw new GraphQLError('Item not found.');
            });

            if (!listItem || listItem.username !== user?.username) {
                throw new GraphQLError('Item not found.');
            }

            const updatedListItem = await ListItem.findByIdAndUpdate(listItem._id, {
                quantity,
                notes,
                isCompleted
            },
                { new: true })
                .populate({ path: 'product', populate: { path: 'productData' } })
                .catch((err: Error) => {
                    throw new GraphQLError('Error updating item.');
                });

            return updatedListItem;
        },

    removeListItem:
        async (_: any, { listItemId }: { listItemId: Types.ObjectId }, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const listItem: ListItemModel | null = await ListItem.findById(listItemId).catch((_: Error) => {
                throw new GraphQLError('Item not found.');
            });

            if (!listItem || listItem.username !== user?.username) {
                throw new GraphQLError('Item not found.');
            }

            const removedItem = await ListItem.findByIdAndDelete(listItem._id)
                .populate({ path: 'product', populate: { path: 'productData' } })
                .catch((err: Error) => {
                    throw new GraphQLError('Error deleting item.');
                });

            return removedItem;
        },
};

export const listItemController = {
    listItemQueries,
    listItemMutations
};

export default listItemController;
