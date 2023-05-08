import { userQueries, userMutations } from '../controllers.ts/userController';


export const resolvers = {
    Query: {
        me: userQueries.queryMe
    },
    Mutation: {
        addUser: userMutations.addUser,
        loginUser: userMutations.loginUser,
        updateUser: userMutations.updateUser,
        deleteUser: userMutations.deleteUser,
    }
};
