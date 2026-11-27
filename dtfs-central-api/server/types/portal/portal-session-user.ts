import { Prettify, PortalUser } from '@ukef/dtfs2-common';
import { SessionBank } from '../session-bank';

export type PortalSessionUser = Prettify<
  Pick<
    PortalUser,
    | 'username'
    | 'firstname'
    | 'lastName'
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
