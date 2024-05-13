import { Prettify, PortalUser } from '@ukef/dtfs2-common';
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
    | 'signInLinkSendDate' // todo dtfs2-7075 check whether this is needed
    | 'signInLinkSendCount'
    | '_id'
  > & {
    bank: SessionBank;
  }
>;
