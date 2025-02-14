import { GetAuthCodeUrlRequest } from '../../types';

export const aGetAuthCodeUrlRequest = (): GetAuthCodeUrlRequest => ({
  successRedirect: 'an-example-redirect-url',
});
