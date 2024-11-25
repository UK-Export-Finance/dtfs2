import { CreateTfmUserRequest } from '../../types';

export const aCreateTfmUserRequest = (): CreateTfmUserRequest => ({
  azureOid: 'an-azure-oid',
  email: 'an-email',
  username: 'a-username',
  teams: ['BUSINESS_SUPPORT'],
  timezone: 'Europe/London',
  firstName: 'a-first-name',
  lastName: 'a-last-name',
  lastLogin: Date.now(),
});
