import { PortalSessionUser } from '@ukef/dtfs2-common';
import { PrimaryNavKey } from '@ukef/portal-ui/server/types/primary-nav-key';

export type BaseViewModel = {
  user: PortalSessionUser;
  primaryNav: PrimaryNavKey;
};
