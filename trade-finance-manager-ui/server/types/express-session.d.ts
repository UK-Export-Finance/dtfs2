import { TfmSessionUser } from './tfm-session-user';

declare module 'express-session' {
  interface SessionData {
    user: TfmSessionUser;
    userToken: string;
  }
}
