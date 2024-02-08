import { PortalSessionUser } from './portal-session-user';

export type UserSessionData = {
  user: PortalSessionUser;
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends UserSessionData {}
}
