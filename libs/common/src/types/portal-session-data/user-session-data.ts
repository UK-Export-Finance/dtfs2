import { ReportPeriod } from '../utilisation-reports';
import { PortalSessionUser } from './portal-session-user';

/**
 * The type of the req.session object used in portal & gef-ui when the user has entered
 * a username & password but not fully signed in
 */
export type PartiallyLoggedInPortalSessionData = {
  userToken: string;
  loginStatus: 'Valid username and password';
  userEmail: string;
  numberOfSignInLinkAttemptsRemaining: number;
};

/**
 * The type of the req.session object used in portal & gef-ui when the user is fully signed in
 */
export type LoggedInPortalSessionData = {
  userToken: string;
  loginStatus: 'Valid 2FA';
  user: PortalSessionUser;
  dashboardFilters?: unknown;
  utilisationReport?: {
    formattedReportPeriod: string;
    reportPeriod: ReportPeriod;
  };
};
