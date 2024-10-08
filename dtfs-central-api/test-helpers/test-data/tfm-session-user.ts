import { ObjectId } from 'mongodb';
import { TfmSessionUser } from '../../src/types/tfm/tfm-session-user';

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
