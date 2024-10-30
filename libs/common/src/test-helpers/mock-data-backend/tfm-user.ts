import { ObjectId } from 'mongodb';
import { TfmUser } from '../../types';

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
