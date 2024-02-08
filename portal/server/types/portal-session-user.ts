import { SessionBank } from './session-bank';
import { Role } from './role';
import { UnixTimestamp } from './date';

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
  bank: SessionBank;
  timezone: string;
  lastLogin?: number;
  'user-status': string;
  disabled?: boolean;
  signInLinkSendDate?: UnixTimestamp;
  signInLinkSendCount?: number;
};
