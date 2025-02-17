import { TfmSessionUser } from '@ukef/dtfs2-common';

// This is needed so that we can access the user property on the Request object which is used for generating audit details
declare global {
  declare namespace Express {
    export interface Request {
      user: TfmSessionUser;
    }
  }
}
