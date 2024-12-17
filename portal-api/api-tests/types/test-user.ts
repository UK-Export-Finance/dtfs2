import { PortalSessionUser } from '@ukef/dtfs2-common';

export interface TestUser extends PortalSessionUser {
  token: string;
  password: string;
}
