import { PortalSessionUser } from '../types/portal-session-data/portal-session-user';
import { aPortalSessionBank } from './portal-session-bank';

export const aPortalSessionUser = (): PortalSessionUser => ({
  _id: 'abc123',
  username: 'firstlast',
  firstname: 'first',
  surname: 'last',
  email: 'first.last@ukexportfinance.gov.uk',
  roles: [],
  bank: aPortalSessionBank(),
  timezone: 'Europe/London',
  'user-status': 'active',
  isTrusted: false,
});
