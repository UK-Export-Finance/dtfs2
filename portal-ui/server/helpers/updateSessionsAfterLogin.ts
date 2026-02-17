import { CustomExpressRequest, PortalSessionUser } from '@ukef/dtfs2-common';
import { DASHBOARD } from '../constants';

type SessionShape = {
  userToken?: string;
  user?: PortalSessionUser;
  loginStatus?: string;
  dashboardFilters?: typeof DASHBOARD.DEFAULT_FILTERS;
  numberOfSignInOtpAttemptsRemaining?: number;
  userEmail?: string;
};

type RequestWithSession = CustomExpressRequest<Record<string, never>> & { session: SessionShape };

type UpdateSessionAfterLoginParams = {
  req: RequestWithSession;
  newUserToken: string;
  loginStatus: string;
  user: PortalSessionUser;
};

/**
 * Updates the session after a successful login or 2FA validation.
 *
 * @param params - Parameters required to update the logged-in session.
 * @param params.req - Express request containing the session to update.
 * @param params.newUserToken - Freshly issued user token after authentication.
 * @param params.loginStatus - Current login status to persist in the session.
 * @param params.user - User details to store in the session.
 * @returns void.
 */
export const updateSessionAfterLogin = ({ req, newUserToken, loginStatus, user }: UpdateSessionAfterLoginParams): void => {
  req.session.userToken = newUserToken;
  req.session.user = user;
  req.session.loginStatus = loginStatus;
  req.session.dashboardFilters = DASHBOARD.DEFAULT_FILTERS;
  delete req.session.numberOfSignInOtpAttemptsRemaining;
  delete req.session.userEmail;
};
