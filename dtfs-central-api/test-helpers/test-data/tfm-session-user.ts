import { TfmSessionUser } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';

export const aTfmSessionUser = (): TfmSessionUser => ({
  username: 'test-user',
  email: 'test@test.com',
  teams: [],
  timezone: 'London',
  firstName: 'Test',
  lastName: 'User',
  status: 'active',
  _id: new ObjectId().toString(),
});
