import { TEAM_IDS, TfmSessionUser } from '@ukef/dtfs2-common';
import { MOCK_EMAIL } from '@ukef/dtfs2-common/test-helpers';

export const aTfmSessionUser = (): TfmSessionUser => ({
  _id: '65954cc526d3899694cafff2',
  username: 'PDC_RECONCILE',
  email: MOCK_EMAIL,
  teams: [TEAM_IDS.PDC_RECONCILE],
  timezone: 'Europe/London',
  firstName: 'PDC',
  lastName: 'Reconcile',
  status: 'active',
  lastLogin: 1704283362,
});
