import { PartiallyLoggedInPortalSessionData, LoggedInPortalSessionData } from '@ukef/dtfs2-common';

export type UserSessionData = PartiallyLoggedInPortalSessionData | LoggedInPortalSessionData;

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends UserSessionData {}
}
