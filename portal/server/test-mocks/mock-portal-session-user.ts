import { PortalSessionUser } from '../types/portal-session-user';
import { ROLES } from '../constants';

export const MOCK_PORTAL_SESSION_USER: PortalSessionUser = {
  _id: '65954cc526d3899694cafff2',
  username: 'PAYMENT_REPORT_OFFICER',
  firstname: 'PAYMENT',
  surname: 'REPORT OFFICER',
  email: 'test@testing.com',
  roles: [ROLES.PAYMENT_REPORT_OFFICER],
  bank: {
    id: '1',
    name: 'Test',
  },
  timezone: 'Europe/London',
  'user-status': 'active'
};
