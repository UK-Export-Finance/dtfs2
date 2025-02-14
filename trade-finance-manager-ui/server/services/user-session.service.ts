/* eslint-disable no-param-reassign */
import { AuthorizationUrlRequest } from '@azure/msal-node';
import { TfmSessionUser } from '@ukef/dtfs2-common';
import { Session, SessionData } from 'express-session';

export class UserSessionService {
  private static deleteExistingPartiallyLoggedInSession = (session: Session & Partial<SessionData>) => {
    delete session.loginData;
  };

  private static deleteExistingLoggedInSession = (session: Session & Partial<SessionData>) => {
    delete session.user;
    delete session.userToken;
  };

  public static createPartiallyLoggedInSession = ({
    session,
    authCodeUrlRequest,
  }: {
    session: Session & Partial<SessionData>;
    authCodeUrlRequest: AuthorizationUrlRequest;
  }) => {
    UserSessionService.deleteExistingLoggedInSession(session);
    session.loginData = { authCodeUrlRequest };
  };

  public static createLoggedInSession = ({
    session,
    user,
    userToken,
  }: {
    session: Session & Partial<SessionData>;
    user: TfmSessionUser;
    userToken: string;
  }) => {
    UserSessionService.deleteExistingPartiallyLoggedInSession(session);
    session.user = user;
    session.userToken = userToken;
  };
}
