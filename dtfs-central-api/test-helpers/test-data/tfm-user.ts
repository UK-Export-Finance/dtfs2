import { TfmUser } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';

export const aTfmUser = (): TfmUser => ({
  _id: new ObjectId(),
  username: 'test-user',
  email: 'test-user@test.com',
  firstName: 'Test',
  lastName: 'User',
  teams: [],
  timezone: 'London',
  salt: '',
  hash: '',
  status: 'active',
});
