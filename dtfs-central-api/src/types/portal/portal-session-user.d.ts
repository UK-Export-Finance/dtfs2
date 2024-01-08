import { Prettify } from '../types-helper';
import { PortalUser } from '../db-models/portal-user';
import { SessionBank } from '../session-bank';

export type PortalSessionUser = Prettify<Omit<PortalUser,
  | 'bank'
  | 'salt'
  | 'hash'
  | 'resetPwdToken'
  | 'resetPwdTimestamp'
  | 'loginFailureCount'
  | 'sessionIdentifier'> & {
  bank: SessionBank;
}>;
