import { ObjectId } from 'mongodb';
import { UserInformation } from '../../types/userInformation';

export const generateSystemUserInformation = (): UserInformation => ({
  userType: 'system',
});

export const generatePortalUserInformation = (id: string | ObjectId): UserInformation => ({
  userType: 'portal',
  id,
});

export const generateTfmUserInformation = (id: string | ObjectId): UserInformation => ({
  userType: 'tfm',
  id,
});
