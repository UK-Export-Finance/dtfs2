import { aTfmSessionUser } from './tfm-session-user';

export const aRequestSession = () => ({
  user: aTfmSessionUser(),
  userToken: 'a user token',
});
