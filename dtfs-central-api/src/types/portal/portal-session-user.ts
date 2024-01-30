import { Prettify } from '@ukef/dtfs2-common';
import { PortalUser } from '../db-models/users';
import { SessionBank } from '../session-bank';

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
