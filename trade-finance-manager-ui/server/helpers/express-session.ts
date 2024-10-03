import { Request } from 'express';
import { UserSessionNotDefinedError, UserTokenNotDefinedError } from '@ukef/dtfs2-common';
import { UserSessionData } from '../types/express-session';

type Session = Request['session'];

type UserSession = Session & UserSessionData;

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
