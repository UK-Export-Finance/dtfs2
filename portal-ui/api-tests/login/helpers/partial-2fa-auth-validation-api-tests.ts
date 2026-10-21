import { when } from 'jest-when';
import { HttpStatusCode, type AxiosResponse } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import type { RequestHeaders, SessionCookieResponse, ApiResponse } from '@ukef/dtfs2-common';
import * as api from '../../../server/api';
import app from '../../../server/createApp';
import extractSessionCookie from '../../helpers/extractSessionCookie';
import mockLogin from '../../helpers/login';

/**
 * Which second-factor path the caller's POST /login should exercise.
 *
 * Sign-in-link tests establish the partial-auth session via the email-link flow (FF off);
 * access-code tests via the OTP flow (FF on). Each caller only needs to mock the
 * `sendSignIn*` function it actually uses.
 */
type Flow = 'sign-in-link' | 'access-code';

type WithPartial2faAuthValidationApiTestsBaseParams = {
  makeRequestWithHeaders: (headers?: RequestHeaders) => Promise<ApiResponse>;
  validateResponseWasSuccessful: (response: ApiResponse) => void;
};

type WithPartial2faAuthValidationApiTestsParams =
  | (WithPartial2faAuthValidationApiTestsBaseParams & { flow: Extract<Flow, 'sign-in-link'> })
  | (WithPartial2faAuthValidationApiTestsBaseParams & {
      flow: Extract<Flow, 'access-code'>;
      numberOfSignInOtpAttemptsRemaining: number;
    });

export const withPartial2faAuthValidationApiTests = (params: WithPartial2faAuthValidationApiTestsParams) => {
  const { makeRequestWithHeaders, validateResponseWasSuccessful, flow } = params;
  const { login, validatePartialAuthToken } = api;
  const { post } = createApi(app);

  const email = 'mock email';
  const password = 'mock password';
  const partialAuthToken = 'partial auth token';

  const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
  const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);

  describe('partial 2fa auth validation', () => {
    let sessionCookie: string;

    const originalPortal2faEnabled = process.env.FF_PORTAL_2FA_ENABLED;

    beforeAll(() => {
      process.env.FF_PORTAL_2FA_ENABLED = flow === 'access-code' ? 'true' : 'false';
    });

    afterAll(() => {
      if (originalPortal2faEnabled === undefined) {
        delete process.env.FF_PORTAL_2FA_ENABLED;
      } else {
        process.env.FF_PORTAL_2FA_ENABLED = originalPortal2faEnabled;
      }
    });

    beforeEach(async () => {
      // Reset every mock this helper mutates so queued *Once implementations, prior
      // mockImplementation values, and call history from a previous suite (potentially
      // running in the same Jest worker) cannot leak into this test.
      (validatePartialAuthToken as jest.Mock).mockReset();
      (login as jest.Mock).mockReset();
      (login as jest.Mock).mockImplementation(mockLogin(partialAuthToken));

      if (params.flow === 'access-code') {
        (api.sendSignInOTP as jest.Mock).mockReset();
        (api.sendSignInOTP as jest.Mock).mockResolvedValue({
          data: { numberOfSignInOtpAttemptsRemaining: params.numberOfSignInOtpAttemptsRemaining },
        });
      } else {
        (api.sendSignInLink as jest.Mock).mockReset();
        (api.sendSignInLink as jest.Mock).mockResolvedValue({
          data: { numberOfSendSignInLinkAttemptsRemaining: 5 },
        });
      }

      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
    });

    it('should redirect to /login if the user does not have a session', async () => {
      const response = await makeRequestWithHeaders();
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login');
    });

    it('should redirect to /login if the user has a session with an invalid partial auth token', async () => {
      when(validatePartialAuthToken).calledWith(expect.any(String)).mockRejectedValueOnce(new Error('test error'));

      const response = await makeRequestWithHeaders({ Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Found);
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
