import { PortalSessionUser } from './portal-session-user';

export type PartiallyLoggedInSessionData = {
  userToken: string;
  loginStatus: 'Valid username and password';
  userEmail: string;
  numberOfSignInLinkAttemptsRemaining: number;
};

export type LoggedInSessionData = {
  userToken: string;
  loginStatus: 'Valid 2FA';
  user: PortalSessionUser;
  dashboardFilters?: unknown;
};

export type UserSessionData = PartiallyLoggedInSessionData | LoggedInSessionData;

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends UserSessionData {}
}
