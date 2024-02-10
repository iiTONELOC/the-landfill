import {GraphQLError} from 'graphql';
import {AppKey} from '../db/Models';

export const validateAppKey = async (appKey: string, userId: string): Promise<boolean> => {
  // lookup the user's app key
  const _appKey = await AppKey.findOne({userId}); //NOSONAR

  // ensure the app key is valid
  const isValidAppKey = (await _appKey?.isCorrectKey(appKey)) && !_appKey?.isExpired();

  if (!_appKey || !isValidAppKey) {
    throw new GraphQLError('Unauthorized');
  }

  return true;
};

export default validateAppKey;
