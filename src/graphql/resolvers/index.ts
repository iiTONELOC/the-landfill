import {
  userController,
  listController,
  listItemController,
  userProductController,
} from '../controllers';

const {userQueries, userMutations} = userController;
const {listQueries, listMutations} = listController;
const {userProductMutations} = userProductController;
const {listItemQueries, listItemMutations} = listItemController;

export const resolvers = {
  Query: {
    me: userQueries.queryMe,
    list: listQueries.list,
    myLists: listQueries.myLists,
    listItem: listItemQueries.listItem,
  },
  Mutation: {
    // Website oriented mutations (App and Devices can use these as well)
    addUser: userMutations.addUser,
    addList: listMutations.createList,
    addToList: listMutations.addToList,
    updateUser: userMutations.updateUser,
    deleteUser: userMutations.deleteUser,
    updateList: listMutations.updateList,
    removeList: listMutations.deleteList,
    removeFromList: listMutations.removeFromList,
    updateListItem: listItemMutations.updateListItem,
    addItemToDefaultList: listMutations.addItemToDefaultList,
    updateUserProduct: userProductMutations.updateUserProduct,
    // App & Device only mutations
    loginUserApp: userMutations.loginUserApp,
    generateAppKey: userMutations.generateAppKey,
    addUserFromApp: userMutations.addUserFromApp,
    loginUserDevice: userMutations.loginUserDevice,
    refreshTokenFromApp: userMutations.appRefreshJWT,
    generateDeviceKey: userMutations.generateDeviceKey,
    regenerateAppKeyFromApp: userMutations.regenerateAppKeyFromApp,
    regenerateDeviceKeyFromApp: userMutations.regenerateDeviceKeyFromApp,
    regenerateDeviceKeyFromDevice: userMutations.regenerateDeviceKeyFromDevice,
  },
};
