import { TfmSessionUser } from './tfm-session-user.ts';

declare global {
  declare namespace Express {
    export interface Request {
      user: TfmSessionUser;
    }
  }
}
