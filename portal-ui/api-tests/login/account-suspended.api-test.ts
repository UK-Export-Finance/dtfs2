import { when } from 'jest-when';
import { HttpStatusCode, AxiosResponse } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import * as api from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';

const { get, post } = createApi(app);

const email = 'mock email';
const password = 'mock password';
const partialAuthToken = 'partial auth token';

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

describe('GET /login/temporarily-suspended-access-code', () => {
  // Ensure sendSignInOTP returns suspended state for the helper tests
  (api.sendSignInOTP as jest.Mock | undefined)?.mockResolvedValue?.({ data: { numberOfSignInOtpAttemptsRemaining: -1 } } as AxiosResponse<unknown>);

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/login/temporarily-suspended-access-code', {}, headers),
    validateResponseWasSuccessful: (response: { status: number }) => expect(response.status).toEqual(200),
  });

  describe('page rendering', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      when(api.validatePartialAuthToken as jest.Mock).resetWhenMocks?.();
      (api.login as jest.Mock).mockImplementation(mockLogin(partialAuthToken));

      (api.sendSignInOTP as jest.Mock | undefined)?.mockResolvedValue?.({
        data: { numberOfSignInOtpAttemptsRemaining: -1 },
      } as AxiosResponse<unknown>);

      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);

      when(api.validatePartialAuthToken as jest.Mock)
        .calledWith(partialAuthToken)
        .mockResolvedValue({ data: {} } as AxiosResponse<unknown>);
    });

    it(`should render the temporarily suspended access code page with HTTP status ${HttpStatusCode.Ok}`, async () => {
      const response = await get('/login/temporarily-suspended-access-code', {}, { Cookie: sessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('This account has been temporarily suspended');
    });

    it('should redirect to /not-found when numberOfSignInOtpAttemptsRemaining is not -1', async () => {
      (api.sendSignInOTP as jest.Mock | undefined)?.mockResolvedValue?.({
        data: { numberOfSignInOtpAttemptsRemaining: 2 },
      } as AxiosResponse<unknown>);

      const invalidSessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);

      when(api.validatePartialAuthToken as jest.Mock)
        .calledWith(partialAuthToken)
        .mockResolvedValue({ data: {} } as AxiosResponse<unknown>);

      const response = await get('/login/temporarily-suspended-access-code', {}, { Cookie: invalidSessionCookie });

      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });
  });
});
