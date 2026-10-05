import { TfmSessionUser } from '@ukef/dtfs2-common';
import { MOCK_EMAIL } from '@ukef/dtfs2-common/test-helpers';

export const MOCK_TFM_USER: TfmSessionUser = {
  _id: '5ce819935e539c343f141ece',
  username: 'test_user',
  email: MOCK_EMAIL,
  teams: [],
  timezone: 'Europe/London',
  firstName: 'Test',
  lastName: 'User',
  status: 'active',
  lastLogin: 0,
};
