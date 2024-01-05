import { PortalUser } from '../db-models/portal-user';
import { SessionBank } from '../session-bank';

export type PortalSessionUser = Omit<PortalUser,
  | 'bank'
  | 'salt'
  | 'hash'
  | 'resetPwdToken'
  | 'resetPwdTimestamp'
  | 'loginFailureCount'
  | 'sessionIdentifier'> & {
  bank: SessionBank;
};
