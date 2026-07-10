import { when } from 'jest-when';
import { HttpStatusCode, AxiosResponse } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import type { RequestHeaders, SessionCookieResponse } from '@ukef/dtfs2-common';
import * as api from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';

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
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

describe('GET /login/request-new-access-code', () => {
  const { get, post } = createApi(app);

  const email = 'mock email';
  const password = 'mock password';
  const partialAuthToken = 'partial auth token';

  const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
  const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);

  const originalPortal2faEnabled = process.env.FF_PORTAL_2FA_ENABLED;

  beforeEach(() => {
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  afterAll(() => {
    if (originalPortal2faEnabled === undefined) {
      delete process.env.FF_PORTAL_2FA_ENABLED;
    } else {
      process.env.FF_PORTAL_2FA_ENABLED = originalPortal2faEnabled;
    }
  });

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/login/request-new-access-code', {}, headers),
    validateResponseWasSuccessful: (response: { status: number }) => expect(response.status).toEqual(HttpStatusCode.Found),
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
      sessionCookie = await setupSessionWithAttempts(2);

      // Override sendSignInOTP to reject for the GET under test (session has already been built above).
      (api.sendSignInOTP as jest.Mock).mockRejectedValueOnce(new Error('OTP service error'));

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem-with-service page when numberOfSignInOtpAttemptsRemaining is less than -1', async () => {
      sessionCookie = await setupSessionWithAttempts(-999);

      const response = await get('/login/request-new-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });
  });
});
