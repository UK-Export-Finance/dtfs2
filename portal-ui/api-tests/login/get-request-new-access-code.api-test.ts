import { when } from 'jest-when';
import { HttpStatusCode, AxiosResponse } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import * as api from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';

type RequestHeaders = {
  Cookie: string | string[];
};

type SessionCookieResponse = {
  headers: {
    'set-cookie': string[];
  };
};

const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInOTP: jest.fn(),
  loginWithSignInOtp: jest.fn(),
  validatePortal2FAEnabled: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

const { get, post } = createApi(app);

const email = 'mock email';
const password = 'mock password';
const partialAuthToken = 'partial auth token';

describe('GET /login/request-new-access-code', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/login/request-new-access-code', {}, headers),
    validateResponseWasSuccessful: (response: { status: number }) => expect(response.status).toEqual(302),
    numberOfSignInOtpAttemptsRemaining: 2,
  });

  describe('redirects based on numberOfSignInOtpAttemptsRemaining', () => {
    let sessionCookie: string;

    const setupSessionWithAttempts = async (numberOfSignInOtpAttemptsRemaining: number) => {
      when(api.validatePartialAuthToken).resetWhenMocks();
      (api.login as jest.Mock).mockImplementation(mockLogin(partialAuthToken));

      (api.sendSignInOTP as jest.Mock | undefined)?.mockResolvedValue?.({
        data: { numberOfSignInOtpAttemptsRemaining },
      });

      const cookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);

      when(api.validatePartialAuthToken)
        .calledWith(partialAuthToken)
        .mockResolvedValue({ data: {} } as AxiosResponse<unknown>);

      return cookie;
    };

    it('should redirect to /login/check-your-email-access-code when numberOfSignInOtpAttemptsRemaining is 2', async () => {
      sessionCookie = await setupSessionWithAttempts(2);

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login/check-your-email-access-code');
    });

    it('should redirect to /login/new-access-code when numberOfSignInOtpAttemptsRemaining is 1', async () => {
      sessionCookie = await setupSessionWithAttempts(1);

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login/new-access-code');
    });

    it('should redirect to /login/resend-another-access-code when numberOfSignInOtpAttemptsRemaining is 0', async () => {
      sessionCookie = await setupSessionWithAttempts(0);

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login/resend-another-access-code');
    });

    it('should redirect to /login/temporarily-suspended-access-code when numberOfSignInOtpAttemptsRemaining is -1', async () => {
      sessionCookie = await setupSessionWithAttempts(-1);

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login/temporarily-suspended-access-code');
    });

    it('should redirect to /login for any other numberOfSignInOtpAttemptsRemaining value', async () => {
      sessionCookie = await setupSessionWithAttempts(99);

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login');
    });

    it('should render the problem with service page when sendSignInOTP throws an error', async () => {
      when(api.validatePartialAuthToken).resetWhenMocks();
      (api.login as jest.Mock).mockImplementation(mockLogin(partialAuthToken));

      (api.sendSignInOTP as jest.Mock | undefined)?.mockRejectedValue?.(new Error('OTP service error'));

      when(api.validatePartialAuthToken)
        .calledWith(partialAuthToken)
        .mockResolvedValue({ data: {} } as AxiosResponse<unknown>);

      // re-setup so sendSignInOTP is rejected on the next GET
      (api.sendSignInOTP as jest.Mock | undefined)?.mockRejectedValue?.(new Error('OTP service error'));

      // session from login had 0 attempts, so manually build a cookie via a valid login first
      sessionCookie = await setupSessionWithAttempts(2);
      (api.sendSignInOTP as jest.Mock | undefined)?.mockRejectedValue?.(new Error('OTP service error'));

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.BadRequest);
    });
  });
});
