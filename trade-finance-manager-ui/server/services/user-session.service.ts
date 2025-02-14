/* eslint-disable no-param-reassign */
import { AuthorizationUrlRequest } from '@azure/msal-node';
import { TfmSessionUser } from '@ukef/dtfs2-common';
import { Session, SessionData } from 'express-session';

/**
 * UserSessionService provides methods to manage user sessions.
 */
export class UserSessionService {
  /**
   * Deletes the partially logged in session data from a session object.
   * @param session The session object to remove partially logged in data from.
   */
  private static deleteExistingPartiallyLoggedInSession = (session: Session & Partial<SessionData>) => {
    delete session.loginData;
  };

  /**
   * Deletes the existing logged in session data from a session object.
   * @param session The session object to remove existing logged in data from.
   */
  private static deleteExistingLoggedInSession = (session: Session & Partial<SessionData>) => {
    delete session.user;
    delete session.userToken;
  };

  /**
   * Creates a partially logged-in session.
   * @param session The session object to initialize.
   * @param authCodeUrlRequest The authorization code URL request.
   */
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

  /**
   * creates a logged in session.
   * @param session The existing session object.
   * @param user The user object.
   * @param userToken The user token.
   */
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
