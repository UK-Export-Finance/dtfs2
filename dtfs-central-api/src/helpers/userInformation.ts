import { generatePortalUserAuditDetails, generateSystemAuditDetails, generateTfmUserAuditDetails } from '@ukef/dtfs2-common/src/helpers/changeStream/generateAuditDetails';
import { UserInformation } from '@ukef/dtfs2-common/src/types/userInformation';
import { ObjectId } from 'mongodb';

export function validateUserInformation(userInformation: unknown): asserts userInformation is UserInformation {
  if (!(userInformation instanceof Object && 'userType' in userInformation)) {
    throw new Error('Missing property `userType`');
  }
  switch (userInformation?.userType) {
    case 'tfm':
      if ('id' in userInformation && typeof userInformation.id === 'string' && ObjectId.isValid(userInformation.id)) {
        return;
      }
      throw new Error('Invalid tfm user id');
    case 'portal':
      if ('id' in userInformation && typeof userInformation.id === 'string' && ObjectId.isValid(userInformation.id)) {
        return;
      }
      throw new Error('Invalid portal user id');
    case 'system':
      return;
    default:
      throw new Error('Invalid userType');
  }
};

export const generateAuditDetailsFromUserInformation = (userInformation: UserInformation) => {
  switch (userInformation.userType) {
    case 'tfm':
      return generateTfmUserAuditDetails(userInformation.id);
    case 'portal':
      return generatePortalUserAuditDetails(userInformation.id);
    case 'system':
      return generateSystemAuditDetails();
    default:
      throw new Error('Invalid userInformation userType');
  }
};
