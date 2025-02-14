import { aTfmSessionUser } from './tfm-session-user';
import { UserSessionData } from '../../server/types/express-session';

export const aRequestSession = (): UserSessionData => ({
  user: aTfmSessionUser(),
  userToken: 'a user token',
});
