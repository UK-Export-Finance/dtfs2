import { Role } from '../portal/roles';
import { PortalSessionBank } from './portal-session-bank';

/**
 * This type is based on the return of `sanitizeUser` in
 * `portal-api`
 */
export type PortalSessionUser = {
  _id: string;
  username: string;
  firstname: string;
  surname: string;
  email: string;
  roles: Role[];
  bank: PortalSessionBank;
  timezone: string;
  'user-status': string;
  isTrusted: boolean;
};
