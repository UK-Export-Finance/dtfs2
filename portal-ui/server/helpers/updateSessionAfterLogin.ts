import { PortalSessionUser } from '@ukef/dtfs2-common';
import { Request } from 'express';
import { DASHBOARD } from '../constants';

type AugmentedSession = Request['session'] & {
  dashboardFilters?: { keyword: null };
  numberOfSignInOtpAttemptsRemaining?: number;
  userEmail?: string;
};

/**
 * Updates the session object after user login with authentication and user information.
 * Clears previous authentication attempt data and resets dashboard filters to default.
 *
 * @param params - The parameters object
 * @param params.req - Express request object containing the session
 * @param params.newUserToken - The new authentication token for the logged-in user
 * @param params.loginStatus - The current login status of the user
 * @param params.user - The user object containing user information
 * @returns void
 */
export const updateSessionAfterLogin = ({
  req,
  newUserToken,
  loginStatus,
  user,
}: {
  req: Pick<Request, 'session'>;
  newUserToken?: string;
  loginStatus?: string;
  user?: PortalSessionUser;
}) => {
  const session = req.session as AugmentedSession;

  session.userToken = newUserToken;
  session.user = user;
  session.loginStatus = loginStatus;
  session.dashboardFilters = DASHBOARD.DEFAULT_FILTERS;
  delete session.numberOfSignInOtpAttemptsRemaining;
  delete session.userEmail;
};
