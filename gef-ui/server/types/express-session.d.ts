import { LoggedInPortalSessionData } from '@ukef/dtfs2-common';

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends LoggedInPortalSessionData {}
}
