import { Request } from 'express';
import { PartiallyLoggedInPortalSessionData, LoggedInPortalSessionData, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';

type Session = Request['session'];

export type LoggedInUserSession = Session & LoggedInPortalSessionData;
type PartiallyLoggedInUserSession = Session & PartiallyLoggedInPortalSessionData;
type UnknownLogInStatusUserSession = Session & Pick<LoggedInPortalSessionData | PartiallyLoggedInPortalSessionData, 'userToken' | 'loginStatus'>;

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

/**
 * By default, all session data will be optional
 * (see use of `Partial` {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L17 here})
 *
 * This helper function asserts that the `loginStatus`, `userToken`, `userEmail`
 * and `numberOfSignInLinkAttemptsRemaining` properties are present in the session,
 * or throws an `Error` if not.
 *
 * Note: this doesn't assert on the validity of the values (which
 * should have already been authenticated in middleware by this point), only
 * that the values are present.
 */
export const asPartiallyLoggedInUserSession = (session: Session): PartiallyLoggedInUserSession => {
  const { userToken, loginStatus, userEmail, numberOfSignInLinkAttemptsRemaining } = session as PartiallyLoggedInUserSession;

  if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD) {
    throw Error('Expected session.loginStatus to be `Valid username and password`', {
      cause: {
        code: 'InvalidLoginStatus',
        value: loginStatus,
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

  if (!userEmail) {
    throw Error('Expected session.userEmail to be defined', {
      cause: {
        code: 'InvalidUserEmail',
        value: userEmail,
      },
    });
  }

  if (!numberOfSignInLinkAttemptsRemaining) {
    throw Error('Expected session.numberOfSignInLinkAttemptsRemaining to be defined', {
      cause: {
        code: 'InvalidNumberOfSignInLinkAttemptsRemaining',
        value: numberOfSignInLinkAttemptsRemaining,
      },
    });
  }

  return Object.assign(session, { userToken, loginStatus, userEmail, numberOfSignInLinkAttemptsRemaining });
};

/**
 * By default, all session data will be optional
 * (see use of `Partial` {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L17 here})
 *
 * This helper function asserts that the `loginStatus` and `userToken` properties are
 * present in the session, or throws an `Error` if not.
 *
 * Note: this doesn't assert on the validity of the user data values (which
 * should have already been authenticated in middleware by this point), only
 * that the values are present.
 */

export const withUnknownLoginStatusUserSession = (session: Session): UnknownLogInStatusUserSession => {
  const { userToken, loginStatus } = session as UnknownLogInStatusUserSession;

  if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA && loginStatus !== PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD) {
    throw Error('Expected session.loginStatus to be `Valid 2FA` or `Valid username and password`', {
      cause: {
        code: 'InvalidLoginStatus',
        value: loginStatus,
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

  return Object.assign(session, { userToken, loginStatus });
};
