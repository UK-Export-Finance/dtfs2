import { AuthorizationUrlRequest } from '@azure/msal-node';

export const anAuthorisationUrlRequest = (): AuthorizationUrlRequest => ({
  scopes: ['a-scope'],
  redirectUri: 'a-redirect-uri',
});
