import { AuthorizationUrlRequest } from '@azure/msal-node';
import { EntraIdAuthCodeRedirectResponseBody } from './entra-id';
import { TfmSessionUser } from './tfm-session-user';

export type handleSsoRedirectFormRequest = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest: AuthorizationUrlRequest;
};

export type handleSsoRedirectFormResponse = {
  user: TfmSessionUser;
  userToken: string;
  successRedirect: string;
};
