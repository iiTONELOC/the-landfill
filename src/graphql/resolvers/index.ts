import { userController, listController, listItemController, userProductController } from '../controllers';

const { userQueries, userMutations } = userController;
const { listQueries, listMutations } = listController;
const { userProductMutations } = userProductController;
const { listItemQueries, listItemMutations } = listItemController;

export const resolvers = {
    Query: {
        me: userQueries.queryMe,
        list: listQueries.list,
        myLists: listQueries.myLists,
        listItem: listItemQueries.listItem
    },
    Mutation: {
        addUser: userMutations.addUser,
        loginUserDevice: userMutations.loginUserDevice,
        updateUser: userMutations.updateUser,
        deleteUser: userMutations.deleteUser,
        addList: listMutations.createList,
        updateList: listMutations.updateList,
        removeList: listMutations.deleteList,
        addToList: listMutations.addToList,
        removeFromList: listMutations.removeFromList,
        updateListItem: listItemMutations.updateListItem,
        generateDeviceKey: userMutations.generateDeviceKey,
        addItemToDefaultList: listMutations.addItemToDefaultList,
        updateUserProduct: userProductMutations.updateUserProduct,
    }
};
