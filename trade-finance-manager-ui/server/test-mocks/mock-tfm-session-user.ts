import { TEAM_IDS, TfmSessionUser } from '@ukef/dtfs2-common';

export const MOCK_TFM_SESSION_USER: TfmSessionUser = {
  _id: '65954cc526d3899694cafff2',
  username: 'PDC_RECONCILE',
  email: 'test@testing.com',
  teams: [TEAM_IDS.PDC_RECONCILE],
  timezone: 'Europe/London',
  firstName: 'PDC',
  lastName: 'Reconcile',
  status: 'active',
  lastLogin: 1704283362,
};
