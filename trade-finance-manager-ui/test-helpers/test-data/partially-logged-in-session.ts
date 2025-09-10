import { anAuthorisationUrlRequest } from "@ukef/dtfs2-common/test-helpers";
import { PartiallyLoggedInUserSessionData } from '../../server/types/express-session';

/**
 * Returns a new instance of a partially logged in user session for use in tests
 */
export const aPartiallyLoggedInUserSession = (): PartiallyLoggedInUserSessionData => ({
  loginData: {
    authCodeUrlRequest: anAuthorisationUrlRequest(),
  },
});
