import { PortalUser } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { aBank } from './bank';

export const aPortalUser = (): PortalUser => ({
  _id: new ObjectId(),
  username: 'Test user',
  email: 'test-user@test.com',
  firstname: 'Test',
  surname: 'User',
  roles: [],
  bank: aBank(),
  timezone: 'London',
  'user-status': 'active',
  salt: '',
  hash: '',
});
