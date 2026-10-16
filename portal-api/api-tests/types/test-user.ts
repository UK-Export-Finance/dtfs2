import { PortalSessionUser } from '@ukef/dtfs2-common';

export type TestUser = {
  token: string;
  password: string;
} & PortalSessionUser;
