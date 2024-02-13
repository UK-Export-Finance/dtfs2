import { WithId } from 'mongodb';
import { Prettify } from '@ukef/dtfs2-common';
import { PortalRole } from '../portal/portal-role';
import { Bank } from './banks';
import { UnixTimestamp } from '../date';

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
