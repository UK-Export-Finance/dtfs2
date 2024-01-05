import { WithId } from 'mongodb';
import { Role } from '../portal/role';
import { Bank } from './banks';

export type PortalUser = WithId<{
  _id: string;
  'user-status': string;
  timezone: string;
  firstname: string;
  surname: string;
  roles: Role[];
  email: `${string}@${string}.${string}`;
  bank: Bank;
  username: string;
  salt: string;
  hash: string;
  resetPwdToken?: string;
  resetPwdTimestamp?: string;
  lastLogin?: number;
  loginFailureCount?: number;
  sessionIdentifier?: string;
}>;
