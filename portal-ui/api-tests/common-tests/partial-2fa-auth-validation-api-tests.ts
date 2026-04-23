import { when } from 'jest-when';
import type { AxiosResponse } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import type { RequestHeaders, SessionCookieResponse, ApiResponse } from '@ukef/dtfs2-common';
import * as api from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';

type WithPartial2faAuthValidationApiTestsParams = {
  makeRequestWithHeaders: (headers?: RequestHeaders) => Promise<ApiResponse>;
  validateResponseWasSuccessful: (response: ApiResponse) => void;
  numberOfSignInOtpAttemptsRemaining?: number;
};

export const withPartial2faAuthValidationApiTests = ({
  makeRequestWithHeaders,
  validateResponseWasSuccessful,
  numberOfSignInOtpAttemptsRemaining,
}: WithPartial2faAuthValidationApiTestsParams) => {
  const { login, validatePartialAuthToken } = api;
  const { post } = createApi(app);

  const email = 'mock email';
  const password = 'mock password';
  const partialAuthToken = 'partial auth token';

  const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
  const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);

  describe('partial 2fa auth validation', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      when(validatePartialAuthToken).resetWhenMocks();
      (login as jest.Mock).mockImplementation(mockLogin(partialAuthToken));

      (api.sendSignInOTP as jest.Mock | undefined)?.mockResolvedValue?.({
        data: { numberOfSignInOtpAttemptsRemaining },
      });

      (api.sendSignInLink as jest.Mock | undefined)?.mockResolvedValue?.({
        data: { numberOfSendSignInLinkAttemptsRemaining: 5 },
      });

      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
    });

    it('should redirect to /login if the user does not have a session', async () => {
      const response = await makeRequestWithHeaders();
      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/login');
    });

    it('should redirect to /login if the user has a session with an invalid partial auth token', async () => {
      when(validatePartialAuthToken).calledWith(expect.any(String)).mockRejectedValueOnce(new Error('test error'));

      const response = await makeRequestWithHeaders({ Cookie: sessionCookie });

      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/login');
    });

    it('should succeed if the user has a session with a valid partial auth token', async () => {
      when(validatePartialAuthToken)
        .calledWith(partialAuthToken)
        .mockResolvedValueOnce({ data: {} } as AxiosResponse<unknown>);

      const response = await makeRequestWithHeaders({ Cookie: sessionCookie });

      validateResponseWasSuccessful(response);
    });
  });
};
