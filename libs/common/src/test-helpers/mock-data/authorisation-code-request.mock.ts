import { AuthorizationCodeRequest } from '@azure/msal-node';

export function anAuthorisationCodeRequest(): AuthorizationCodeRequest {
  return {
    scopes: ['a-scope'],
    redirectUri: 'a-redirect-uri',
    code: 'a-code',
  };
}
