import { Prettify } from './types-helper';
import { Bank, SessionBank } from './banks';
import { RoleId } from './role-id';

export type PortalUser = Prettify<{
    _id: string;
    'user-status': string;
    disabled?: boolean;
    timezone: string;
    firstname: string;
    surname: string;
    roles: RoleId[];
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
    signInLinkSendCount?: number;
  }>;

export type PortalSessionUser = Prettify<
  Pick<
    PortalUser,
    | 'username'
    | 'firstname'
    | 'surname'
    | 'email'
    | 'roles'
    | 'timezone'
    | 'lastLogin'
    | 'user-status'
    | 'disabled'
    | 'signInLinkSendDate'
    | 'signInLinkSendCount'
    | '_id'
  > & {
    bank: SessionBank;
  }
>;
