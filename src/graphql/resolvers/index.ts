import {
  userController,
  listController,
  listItemController,
  userProductController,
} from "../controllers";

const { userQueries, userMutations } = userController;
const { listQueries, listMutations } = listController;
const { userProductMutations } = userProductController;
const { listItemQueries, listItemMutations } = listItemController;

export const resolvers = {
  Query: {
    me: userQueries.queryMe,
    list: listQueries.list,
    myLists: listQueries.myLists,
    listItem: listItemQueries.listItem,
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
    loginUserApp: userMutations.loginUserApp,
    addUserFromApp: userMutations.addUserFromApp,
    removeFromList: listMutations.removeFromList,
    updateListItem: listItemMutations.updateListItem,
    generateAppKey: userMutations.generateAppKey,
    generateDeviceKey: userMutations.generateDeviceKey,
    addItemToDefaultList: listMutations.addItemToDefaultList,
    updateUserProduct: userProductMutations.updateUserProduct,
  },
};
