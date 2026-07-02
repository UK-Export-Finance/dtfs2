import { when } from 'jest-when';
import { HttpStatusCode, AxiosResponse } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import type { SessionCookieResponse, RequestHeaders } from '@ukef/dtfs2-common';
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
  validatePortal2FAEnabled: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

describe('GET /login/access-code-expired', () => {
  const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
  const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);
  const { get, post } = createApi(app);
  const email = 'mock email';
  const password = 'mock password';
  const partialAuthToken = 'partial auth token';

  beforeEach(() => {
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/login/access-code-expired', {}, headers),
    validateResponseWasSuccessful: (response: { status: number }) => expect(response.status).toEqual(200),
    numberOfSignInOtpAttemptsRemaining: 2,
  });

  describe('page rendering', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      when(api.validatePartialAuthToken).resetWhenMocks();
      (api.login as jest.Mock).mockImplementation(mockLogin(partialAuthToken));

      (api.sendSignInOTP as jest.Mock | undefined)?.mockResolvedValue?.({
        data: { numberOfSignInOtpAttemptsRemaining: 2 },
      });

      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);

      when(api.validatePartialAuthToken)
        .calledWith(partialAuthToken)
        .mockResolvedValue({ data: {} } as AxiosResponse<unknown>);
    });

    it(`should render the access code expired page with HTTP status ${HttpStatusCode.Ok}`, async () => {
      const response = await get('/login/access-code-expired', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Your access code has expired');
    });
  });
});
