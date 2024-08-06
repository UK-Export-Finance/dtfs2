import { Request } from 'express';
import { LoggedInPortalSessionData, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';

type Session = Request['session'];

export type LoggedInUserSession = Session & LoggedInPortalSessionData;

/**
 * By default, all session data will be optional
 * (see use of `Partial` {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L17 here})
 *
 * This helper function asserts that the `loginStatus`, `user` and `userToken` properties are
 * present in the session, or throws an `Error` if not.
 *
 * Note: this doesn't assert on the validity of the user data values (which
 * should have already been authenticated in middleware by this point), only
 * that the values are present.
 */
export const asLoggedInUserSession = (session: Session): LoggedInUserSession => {
  const { user, userToken, loginStatus } = session as LoggedInUserSession;

  if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
    throw Error('Expected session.loginStatus to be `Valid 2FA`', {
      cause: {
        code: 'InvalidLoginStatus',
        value: loginStatus,
      },
    });
  }

  if (!user) {
    throw Error('Expected session.user to be defined', {
      cause: {
        code: 'InvalidUser',
        value: user,
      },
    });
  }

  if (!userToken) {
    throw Error('Expected session.userToken to be defined', {
      cause: {
        code: 'InvalidUserToken',
        value: userToken,
      },
    });
  }

  return Object.assign(session, { user, userToken, loginStatus });
};
