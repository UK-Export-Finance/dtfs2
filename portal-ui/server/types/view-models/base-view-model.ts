import { PortalSessionUser } from '@ukef/dtfs2-common';
import { PrimaryNavKey } from '../primary-nav-key';

export type BaseViewModel = {
  user: PortalSessionUser;
  primaryNav: PrimaryNavKey;
};
