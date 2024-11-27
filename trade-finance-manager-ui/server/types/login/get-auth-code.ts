import { AuthorizationUrlRequest } from '@azure/msal-node';

export type GetAuthCodeUrlParams = {
  successRedirect?: string;
};

export type GetAuthCodeUrlResponse = {
  authCodeUrl: string;
  authCodeUrlRequest: AuthorizationUrlRequest;
};
