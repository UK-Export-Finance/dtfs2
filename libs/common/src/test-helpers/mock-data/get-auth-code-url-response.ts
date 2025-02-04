import { GetAuthCodeUrlResponse } from '../../types';

export const aGetAuthCodeUrlResponse = (): GetAuthCodeUrlResponse => ({
  authCodeUrl: 'https://auth-code-url',
  authCodeUrlRequest: {
    scopes: ['user.read'],
    redirectUri: 'https://redirect-uri',
  },
});
