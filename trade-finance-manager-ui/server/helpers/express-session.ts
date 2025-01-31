import { Request } from 'express';
import { UserPartialLoginDataNotDefinedError, UserSessionNotDefinedError, UserTokenNotDefinedError } from '@ukef/dtfs2-common';
import { PartiallyLoggedInUserSessionData, UserSessionData } from '../types/express-session';

type Session = Request['session'];

export type UserSession = Session & UserSessionData;

type PartiallyLoggedInUserSession = Session & PartiallyLoggedInUserSessionData;
/**
 * By default, all session data will be optional
 * (see use of `Partial` {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L17 here})
 *
 * This helper function asserts that the `user` and `userToken` properties are
 * present in the session, or throws an `Error` if not.
 *
 * Note: this doesn't assert on the validity of the user data values (which
 * should have already been authenticated in middleware by this point), only
 * that the values are present.
 */
export const asUserSession = (session: Session): UserSession => {
  const { user, userToken } = session;

  if (!user) {
    throw new UserSessionNotDefinedError();
  }

  if (!userToken) {
    throw new UserTokenNotDefinedError();
  }

  return Object.assign(session, { user, userToken });
};

export const assertPartiallyLoggedInUser: (session: Session) => asserts session is PartiallyLoggedInUserSession = (session: Session) => {
  const { loginData } = session;

  if (!loginData) {
    throw new UserPartialLoginDataNotDefinedError();
  }
};

export const asPartiallyLoggedInUserSession = (session: Session): PartiallyLoggedInUserSession => {
  assertPartiallyLoggedInUser(session);
  return session;
};
