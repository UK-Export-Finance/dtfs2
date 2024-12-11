/* eslint-disable no-param-reassign */
import { AuthorizationUrlRequest } from '@azure/msal-node';
import { TfmSessionUser } from '@ukef/dtfs2-common';
import { Session, SessionData } from 'express-session';

export class UserSessionService {
  private deleteExistingPartiallyLoggedInSession(session: Session & Partial<SessionData>) {
    delete session.loginData;
  }

  private deleteExistingLoggedInSession(session: Session & Partial<SessionData>) {
    delete session.user;
    delete session.userToken;
  }

  public createPartiallyLoggedInSession({
    session,
    authCodeUrlRequest,
  }: {
    session: Session & Partial<SessionData>;
    authCodeUrlRequest: AuthorizationUrlRequest;
  }) {
    this.deleteExistingLoggedInSession(session);
    session.loginData = { authCodeUrlRequest };
  }

  public createLoggedInSession({ session, user, userToken }: { session: Session & Partial<SessionData>; user: TfmSessionUser; userToken: string }) {
    this.deleteExistingPartiallyLoggedInSession(session);
    session.user = user;
    session.userToken = userToken;
  }
}
