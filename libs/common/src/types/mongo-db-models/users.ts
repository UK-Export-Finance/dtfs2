import { WithId } from 'mongodb';
import { Bank } from './banks';
import { UnixTimestamp } from '../date';
import { Prettify } from '../types-helper';

export type PortalRole = 'maker' | 'checker' | 'admin' | 'read-only' | 'payment-report-officer';

export type PortalUser = Prettify<
  WithId<{
    'user-status': string;
    disabled?: boolean;
    timezone: string;
    firstname: string;
    surname: string;
    roles: PortalRole[];
    email: string;
    bank: Bank;
    username: string;
    salt: string;
    hash: string;
    resetPwdToken?: string;
    resetPwdTimestamp?: string;
    lastLogin?: UnixTimestamp;
    loginFailureCount?: number;
    sessionIdentifier?: string;
    signInLinkSendDate?: UnixTimestamp;
    signInLinkSendCount?: number;
  }>
>;
