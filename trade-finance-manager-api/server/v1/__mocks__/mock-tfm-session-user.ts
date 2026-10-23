import { TfmSessionUser } from '@ukef/dtfs2-common';
import { MOCK_EMAIL } from '@ukef/dtfs2-common/test-helpers';

export const MOCK_TFM_SESSION_USER: TfmSessionUser = {
  _id: '5e63c3a5e4232e4cd0274ac2',
  username: 'Test user',
  email: MOCK_EMAIL,
  teams: [],
  timezone: 'London',
  firstName: 'Test',
  lastName: 'User',
  status: 'active',
};
