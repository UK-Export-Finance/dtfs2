import { Request } from "express";
import { PartiallyLoggedInSessionData, LoggedInSessionData } from "../types/express-session";

type Session = Request['session'];

type LoggedInUserSession = Session & LoggedInSessionData;
type PartiallyLoggedInUserSession = Session & PartiallyLoggedInSessionData;

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
export const asLoggedInUserSession = (session: Session): LoggedInUserSession  => {
  const { user, userToken, loginStatus } = session as Session & LoggedInSessionData;

  if (loginStatus !== 'Valid 2FA' ) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw Error(`User is not fully logged in. Log in status ${loginStatus}`)
  }

  if (!user) {
    throw Error('Expected session.user to be defined');
  }

  if (!userToken) {
    throw Error('Expected session.userToken to be defined');
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
export const asPartiallyLoggedInUserSession = (session: Session): PartiallyLoggedInUserSession  => {
  const { userToken, loginStatus, userEmail, numberOfSignInLinkAttemptsRemaining } = session as Session & PartiallyLoggedInSessionData;

  if (loginStatus !== 'Valid username and password' ) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw Error(`User is not partially logged in. Log in status ${loginStatus}`)
  }

  if (!userToken) {
    throw Error('Expected session.userToken to be defined');
  }

  if (!userEmail) {
    throw Error('Expected session.userEmail to be defined');
  }

  if (!numberOfSignInLinkAttemptsRemaining) {
    throw Error('Expected session.numberOfSignInLinkAttemptsRemaining to be defined');
  }

  return Object.assign(session, { userToken, loginStatus, userEmail, numberOfSignInLinkAttemptsRemaining });
};
