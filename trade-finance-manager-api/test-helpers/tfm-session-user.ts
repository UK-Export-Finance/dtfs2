import { TfmSessionUser } from '@ukef/dtfs2-common';
import { MOCK_EMAIL } from '@ukef/dtfs2-common/test-helpers';
import { ObjectId } from 'mongodb';

export const aTfmSessionUser = (): TfmSessionUser => ({
  username: 'test-user',
  email: MOCK_EMAIL,
  teams: [],
  timezone: 'London',
  firstName: 'Test',
  lastName: 'User',
  status: 'active',
  _id: new ObjectId().toString(),
});
