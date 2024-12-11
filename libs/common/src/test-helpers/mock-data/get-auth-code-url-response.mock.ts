import { GetAuthCodeUrlResponse } from '../../types';
import { anAuthorisationCodeRequest } from './authorisation-code-request.mock';

export const aGetAuthCodeUrlResponse = (): GetAuthCodeUrlResponse => ({
  authCodeUrl: 'a-auth-code-url',
  authCodeUrlRequest: anAuthorisationCodeRequest(),
});
