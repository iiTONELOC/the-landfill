import {GraphQLError} from 'graphql';
import {DeviceKey} from '../db/Models';

export const validateDeviceKey = async (deviceKey: string, userId: string): Promise<boolean> => {
  // lookup the user's device key
  const _deviceKey = await DeviceKey.findOne({userId}); //NOSONAR

  // ensure the device key is valid
  const isValidDeviceKey = (await _deviceKey?.isCorrectKey(deviceKey)) && !_deviceKey?.isExpired();

  if (!_deviceKey || !isValidDeviceKey) {
    throw new GraphQLError('Unauthorized');
  }

  return true;
};
export default validateDeviceKey;
