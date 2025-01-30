import { anAuthorisationUrlRequest } from '@ukef/dtfs2-common';
import { PartiallyLoggedInUserSessionData } from '../../server/types/express-session';

export const aPartiallyLoggedInUserSession = (): PartiallyLoggedInUserSessionData => ({
  loginData: {
    authCodeUrlRequest: anAuthorisationUrlRequest(),
  },
});
