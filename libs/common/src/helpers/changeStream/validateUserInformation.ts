import { ObjectId } from 'mongodb';
import { UserInformation } from '../../types/userInformation';

export function validateUserInformation(userInformation: unknown): asserts userInformation is UserInformation {
  if (!(userInformation instanceof Object && 'userType' in userInformation)) {
    throw new Error('Missing property `userType`');
  }
  switch (userInformation?.userType) {
    case 'tfm':
      if (!('id' in userInformation)) {
        throw new Error('Missing property id for tfm user');
      }
      if (userInformation.id instanceof ObjectId || (typeof userInformation.id === 'string' && ObjectId.isValid(userInformation.id))) {
        return;
      }
      throw new Error(`Invalid tfm user id ${userInformation.id?.toString()}`);
    case 'portal':
      if (!('id' in userInformation)) {
        throw new Error('Missing property id for portal user');
      }

      if (userInformation.id instanceof ObjectId || (typeof userInformation.id === 'string' && ObjectId.isValid(userInformation.id))) {
        return;
      }
      throw new Error(`Invalid portal user id ${userInformation.id?.toString()}`);
    case 'system':
      return;
    default:
      throw new Error(`Invalid userType ${userInformation.userType?.toString()}`);
  }
}
