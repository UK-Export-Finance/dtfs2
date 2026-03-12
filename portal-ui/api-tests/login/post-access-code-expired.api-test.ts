import { when, resetAllWhenMocks } from 'jest-when';
import type { Response } from 'supertest';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { HttpStatusCode } from 'axios';
import type { AxiosResponse } from 'axios';
import * as api from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';

const { post } = createApi(app);

const partialAuthToken = 'partial auth token';
const email = 'email@example.com';
const password = 'a password';

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
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => next()),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  loginWithSignInOtp: jest.fn(),
  validateToken: jest.fn(() => false),
  validatePartialAuthToken: jest.fn(),
  sendSignInOTP: jest.fn(),
}));

describe('POST /login/check-your-email-access-code', () => {
  const originalEnv = process.env.FF_PORTAL_2FA_ENABLED;

  beforeAll(() => {
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  afterAll(() => {
    if (typeof originalEnv === 'undefined') {
      delete process.env.FF_PORTAL_2FA_ENABLED;
    } else {
      process.env.FF_PORTAL_2FA_ENABLED = originalEnv;
    }
  });

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => post({ sixDigitAccessCode: '123456' }, headers).to('/login/check-your-email-access-code'),
    validateResponseWasSuccessful: (response: Response) => {
      expect(response.status).toEqual(HttpStatusCode.Found);
    },
  });

  describe('when the user has a valid partial auth token and an expired access code', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      // Arrange
      resetAllWhenMocks();
      jest.clearAllMocks();
      // Use a custom login mock that includes userId, which is required by the controller
      (api.login as jest.Mock).mockResolvedValue({
        token: partialAuthToken,
        user: { email, userId: 'mock-user-id' },
        loginStatus: 'Valid username and password',
      });
      (api.sendSignInOTP as jest.Mock).mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: 2 } });
      (api.loginWithSignInOtp as jest.Mock).mockResolvedValue({ isExpired: true });
      when(api.validatePartialAuthToken as jest.Mock)
        .calledWith(partialAuthToken)
        .mockResolvedValue(undefined as unknown as AxiosResponse);

      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
    });

    it('should redirect to /login/access-code-expired', async () => {
      const requestBody = { sixDigitAccessCode: '000000' };

      // Act
      const response = await post(requestBody, { Cookie: sessionCookie }).to('/login/check-your-email-access-code');

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login/access-code-expired');
    });
  });
});
