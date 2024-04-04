import { ObjectId } from "mongodb";

type UserInformation = {
  userType: 'tfm' | 'portal';
  id: string | ObjectId;
} | {
  userType: 'system';
};

export const generateSystemUserInformation = (): UserInformation => ({
  userType: 'system'
});

export const generatePortalUserInformation = (id: string | ObjectId): UserInformation => ({
  userType: 'portal',
  id,
});

export const generateTfmUserInformation = (id: string | ObjectId): UserInformation => ({
  userType: 'tfm',
  id,
});
