import { ObjectId } from 'mongodb';
import { PortalUser } from '@ukef/dtfs2-common';
import { MOCK_BANKS } from '../banks';

export const aPortalUser = (): PortalUser => ({
  _id: new ObjectId(),
  firstname: 'Test',
  surname: 'User',
  username: 'test-user',
  email: 'user@test.com',
  bank: MOCK_BANKS.testBank1,
  roles: [],
  'user-status': 'active',
  timezone: 'London',
  salt: '',
  hash: '',
});
