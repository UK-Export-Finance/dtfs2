import { GetAuthCodeUrlResponse } from '../../types';
import { anAuthorisationCodeRequest } from './authorisation-code-request.mock';

export const aGetAuthCodeUrlResponse = (): GetAuthCodeUrlResponse => ({
  authCodeUrl: 'https://auth-code-url',
  authCodeUrlRequest: anAuthorisationCodeRequest(),
});
