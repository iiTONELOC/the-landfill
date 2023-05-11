import 'dotenv/config';
import { Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { List, ListItem, User } from '../../../db/Models';
import authenticatedUser from '../../../auth/isAuthenticated';
import { userProductMutations } from '../userProductController';
import { addToDefaultListArgs, removeFromListArgs } from '../types';
import { AuthenticatedContext, ListItemModel, ListModel, UserModel } from '../../../types';


const enforceDefaultList = async (isDefault: boolean, userId?: Types.ObjectId, listId?: Types.ObjectId) => {
    if (isDefault) {
        await List.updateMany({ userId, _id: { $ne: listId } }, { isDefault: false })
            .where('isDefault')
            .equals(true)
            .catch((_: Error) => {
                throw new GraphQLError('Error updating lists.');
            });
    }
};

export const listQueries = {
    // searches for the context user's lists
    myLists: async (_: any, _args: unknown, { user }: AuthenticatedContext) => {
        // check if the user is authenticated
        await authenticatedUser(user as UserModel);

        const myLists = await List.find({ userId: user?._id })
            .populate({ path: 'products', populate: { path: 'product', populate: 'productData' } })
            .catch((_: Error) => {
                throw new GraphQLError('Error searching for lists.');
            }) as ListModel[];

        return myLists;
    },

    // searches for a list by id, it must contain the context user's id
    list: async (_: any, { listId }: { listId: Types.ObjectId }, { user }: AuthenticatedContext) => {
        await authenticatedUser(user as UserModel);

        const list = await List.findById(listId)
            .populate({ path: 'products', populate: { path: 'product', populate: 'productData' } })
            .catch((_: Error) => {
                throw new GraphQLError('Error searching for list.');
            });

        if (!list || list.userId.toString() !== user?._id.toString()) {
            throw new GraphQLError('List not found.');
        }

        return list;
    }
};

export const listMutations = {
    // creates a new list
    createList:
        async (_: any, { name, isDefault }: { name: string, isDefault: boolean }, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const createdList = await List.create({
                name,
                userId: user?._id,
                products: [],
                isDefault
            }).catch((err: Error) => {
                throw new GraphQLError('Error creating list.');
            });

            // ensures there is only one default list at a time
            enforceDefaultList(isDefault, user?._id, createdList._id);


            // add the created list to the user's lists
            await User.findByIdAndUpdate(user?._id, { $push: { lists: createdList._id } }).catch((_: Error) => {
                // delete the list if it fails to add to the user
                List.findByIdAndDelete(createdList._id).catch((_: Error) => {
                    throw new GraphQLError('Error deleting list.');
                });
                throw new GraphQLError('Error adding list to user.');
            });

            const populatedList = await List.findById(createdList._id)
                .select('-__v -userId')
                .populate({ path: 'products', select: '-__v -listId -username' })
                .catch((_: Error) => {
                    throw new GraphQLError('Error populating list.');
                });

            return populatedList;
        },
    // can only update the name and isDefault
    updateList:
        async (_: any, { listId, name, isDefault }: { listId: Types.ObjectId, name: string, isDefault: boolean }, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const list = await List.findById(listId).catch((_: Error) => {
                throw new GraphQLError('Error searching for list.');
            });

            if (!list || list.userId.toString() !== user?._id.toString()) {
                throw new GraphQLError('List not found.');
            }

            const updatedList = await List
                .findByIdAndUpdate(listId, { name, isDefault }, { new: true, runValidators: true })
                .catch((_: Error) => {
                    throw new GraphQLError('Error updating list.');
                });

            // ensures there is only one default list at a time
            enforceDefaultList(isDefault, user?._id, listId);

            return updatedList;
        },

    // deletes a list and all of its list items
    deleteList:
        async (_: any, { listId }: { listId: Types.ObjectId }, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const list = await List.findById(listId).catch((_: Error) => {
                throw new GraphQLError('Error searching for list.');
            });

            if (!list || list.userId.toString() !== user?._id.toString()) {
                throw new GraphQLError('List not found.');
            }

            const deletedList = await List.findByIdAndDelete(listId).catch((_: Error) => {
                throw new GraphQLError('Error deleting list.');
            });

            await ListItem.deleteMany({ listId }).catch((_: Error) => {
                throw new GraphQLError('Error deleting list items.');
            });

            return deletedList;
        },

    // adds an item to a list via a barcode
    addToList:
        async (_: any, { listId, barcode }: { listId: Types.ObjectId, barcode: string }, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const list = await List.findById(listId).catch((_: Error) => {
                throw new GraphQLError('Error searching for list.');
            });

            if (!list || list.userId.toString() !== user?._id.toString()) {
                throw new GraphQLError('List not found.');
            }

            // check if the product is already in the user's products
            const product = await userProductMutations
                .addUserProduct(_, { barcode, userId: user._id }, { user }).catch((_: Error) => {
                    console.log('Error adding product to user.');
                    console.log(_);
                    throw new GraphQLError('Error adding product to user.');
                });

            // check and see if the item is already in the list, if it is we need to update the ListItem's quantity
            const listItem = await ListItem.findOne({ listId })
                .where('product').equals(product?._id)
                .populate({ path: 'product', select: '-__v -listId -username', populate: { path: 'productData' } })
                .catch((_: Error) => {
                    throw new GraphQLError('Error searching for list item.');
                });

            if (listItem) {
                const updatedListItem = await ListItem
                    .findByIdAndUpdate(listItem._id, { quantity: ((listItem?.quantity || 0) + 1) }, { new: true })
                    .populate({ path: 'product', select: '-__v -listId -username', populate: { path: 'productData' } })
                    .catch((_: Error) => {
                        throw new GraphQLError('Error updating list item.');
                    });

                return updatedListItem;
            } else {
                // no item was found we need to create a new one
                const createdListItem = await ListItem.create({
                    listId,
                    username: user.username,
                    product: product?._id,
                    quantity: 1
                }).catch((_: Error) => {
                    throw new GraphQLError('Error creating list item.');
                });

                const created = await ListItem.findById(createdListItem._id)
                    .populate({ path: 'product', select: '-__v -listId -username', populate: { path: 'productData' } })
                    .catch((_: Error) => {
                        throw new GraphQLError('Error populating list item.');
                    }) as ListItemModel;

                // add the list item to the list
                await List.findByIdAndUpdate(listId, { $push: { products: created._id } }).catch((_: Error) => {
                    // delete the list item if it fails to add to the list
                    ListItem.findByIdAndDelete(created._id).catch((_: Error) => {
                        throw new GraphQLError('Error deleting list item.');
                    });
                    throw new GraphQLError('Error adding list item to list.');
                });

                return created;
            }
        },
    removeFromList:
        async (_: any, { listId, listItemId }: removeFromListArgs, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            const list = await List.findById(listId).catch((_: Error) => {
                throw new GraphQLError('Error searching for list.');
            });

            if (!list || list.userId.toString() !== user?._id.toString()) {
                throw new GraphQLError('List not found.');
            }

            const listItem: ListItemModel | null = await ListItem.findById(listItemId)
                .catch((_: Error) => {
                    throw new GraphQLError('Error searching for list item.');
                }) as ListItemModel;

            if (!listItem /*|| listItem.username !== user.username*/) {
                throw new GraphQLError('List item not found.');
            }

            if (listItem?.quantity && listItem?.quantity > 1) {
                // we need to adjust the quantity instead of deleting the list item
                const updatedListItem = await ListItem
                    .findByIdAndUpdate(listItem._id, { quantity: listItem.quantity - 1 }, { new: true })
                    .populate({ path: 'product', select: '-__v -listId -username', populate: { path: 'productData' } })
                    .catch((_: Error) => {
                        throw new GraphQLError('Error updating list item.');
                    })
                    ;
                return updatedListItem;
            } else {
                const deletedListItem = await ListItem.findByIdAndDelete(listItem._id)
                    .populate({ path: 'product', select: '-__v -listId -username', populate: { path: 'productData' } })
                    .catch((_: Error) => {
                        throw new GraphQLError('Error deleting list item.');
                    });

                return deletedListItem;
            }
        },
    // meant to be used by the trashScan device not the user or an app
    addItemToDefaultList:
        async (_: any, { barcode }: addToDefaultListArgs, { user }: AuthenticatedContext) => {
            await authenticatedUser(user as UserModel);

            // look for a user's default list
            let defaultList: ListModel | null = await List.findOne({ userId: user?._id })
                .where('isDefault')
                .equals(true)
                .catch((_: Error) => {
                    throw new GraphQLError('Error searching for default list.');
                }) as ListModel;

            if (!defaultList) {
                // create a default list for the user
                defaultList = await listMutations.createList(_, { name: 'Default', isDefault: true }, { user });
            }

            // add the item to the default list
            const createdListItem = await listMutations.addToList(_, { listId: defaultList?._id as Types.ObjectId, barcode }, { user });
            return createdListItem;
        }
};


export const listController = {
    listQueries,
    listMutations
};

export default listController;
