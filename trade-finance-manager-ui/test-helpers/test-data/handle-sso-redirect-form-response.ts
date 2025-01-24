import { HandleSsoRedirectFormResponse } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from './tfm-session-user';

export const aHandleSsoRedirectFormResponse = (): HandleSsoRedirectFormResponse => ({
  user: aTfmSessionUser(),
  token: 'a-token',
  expires: 'a-date',
  successRedirect: 'a-redirect',
});
