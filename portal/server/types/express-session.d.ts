import { PortalSessionUser } from './portal/portal-session-user';

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData {
    user: PortalSessionUser;
  }
}
