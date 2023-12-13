import { ObjectId } from 'mongodb';
import { TfmUser } from '../../../src/types/db-models/tfm-user';

export const MOCK_TFM_USER: TfmUser = {
  _id: new ObjectId('5ce819935e539c343f141ece'),
  username: 'test_user',
  email: 'test@email.com',
  teams: [],
  timezone: 'Europe/London',
  firstName: 'Test',
  lastName: 'User',
};
