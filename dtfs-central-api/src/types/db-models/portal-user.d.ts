import { WithId } from 'mongodb';
import { Role } from '../portal/role';
import { Bank } from './banks';

export type PortalUser = WithId<{
  _id: string;
  'user-status': string;
  disabled: string;
  timezone: string;
  firstname: string;
  surname: string;
  roles: Role[];
  email: string;
  bank: Bank;
  username: string;
  salt: string;
  hash: string;
  resetPwdToken?: string;
  resetPwdTimestamp?: string;
  lastLogin?: number;
  loginFailureCount?: number;
  sessionIdentifier?: string;
  signInLinkSendDate?: Date;
  signInLinkSendCount: number;
}>;
