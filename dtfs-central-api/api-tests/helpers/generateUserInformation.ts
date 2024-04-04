type UserInformation = {
  userType: 'tfm' | 'portal';
  id: string;
} | {
  userType: 'system';
};

export const generateSystemUserInformation = (): UserInformation => ({
  userType: 'system'
});

export const generatePortalUserInformation = (id: string): UserInformation => ({
  userType: 'portal',
  id,
});

export const generateTfmUserInformation = (id: string): UserInformation => ({
  userType: 'tfm',
  id,
});
