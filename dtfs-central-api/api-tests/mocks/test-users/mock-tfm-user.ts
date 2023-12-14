import { ObjectId } from 'mongodb';
import { TfmSessionUser } from '../../../src/types/tfm/tfm-session-user';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../src/constants';

export const MOCK_TFM_USER: TfmSessionUser = {
  _id: new ObjectId('5ce819935e539c343f141ece'),
  username: 'test_user',
  email: 'test@email.com',
  teams: [],
  timezone: 'Europe/London',
  firstName: 'Test',
  lastName: 'User',
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  lastLogin: 0,
};
