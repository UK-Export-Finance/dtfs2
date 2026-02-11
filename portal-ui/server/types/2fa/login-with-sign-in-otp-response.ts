import { PortalSessionUser } from '@ukef/dtfs2-common';

export type LoginWithSignInOtpResponse = {
  loginStatus?: string;
  token?: string;
  user?: PortalSessionUser;
};
