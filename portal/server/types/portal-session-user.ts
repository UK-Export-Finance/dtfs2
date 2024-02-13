import { Role } from './role';
import { Bank } from './bank';

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
  bank: Bank;
  timezone: string;
  'user-status': string;
}
