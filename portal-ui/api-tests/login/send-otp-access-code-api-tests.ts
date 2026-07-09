import { HttpStatusCode } from 'axios';
import { resetAllWhenMocks, when } from 'jest-when';
import { PORTAL_LOGIN_STATUS, ROLES } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import type { SessionCookieResponse, RequestHeaders, ApiResponse } from '@ukef/dtfs2-common';
import * as api from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';
import { withRoleValidationOtpApiTests } from '../common-tests/role-validation-with-otp-api-tests';

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

export const withSendNewOtpApiTests = (
  endpoint: string,
  attemptsLeft: number,
  expectedSuccessResponse: { status: number; location?: string } = { status: HttpStatusCode.Ok },
) => {
  describe(`POST /login/${endpoint}`, () => {
    const { post } = createApi(app);
    const mockedLogin = api.login as jest.Mock;
    const mockedValidatePartialAuthToken = api.validatePartialAuthToken as jest.Mock;
    const mockedSendSignInOTP = api.sendSignInOTP as jest.Mock;
    const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
    const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);
    const allRoles: string[] = Object.values(ROLES) as string[];

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

    withRoleValidationOtpApiTests({
      makeRequestWithHeaders: (headers?: RequestHeaders) => post({ sixDigitAccessCode: '123456' }, headers).to(`/login/${endpoint}`),
      whitelistedRoles: allRoles,
      successCode: expectedSuccessResponse.status,
      successHeaders: expectedSuccessResponse.location ? { location: expectedSuccessResponse.location } : undefined,
      attemptsLeft,
    });

    withPartial2faAuthValidationApiTests({
      makeRequestWithHeaders: (headers?: RequestHeaders) => post({ sixDigitAccessCode: '123456' }, headers).to(`/login/${endpoint}`),
      validateResponseWasSuccessful: (response: ApiResponse) => {
        expect(response.status).toEqual(expectedSuccessResponse.status);
        if (expectedSuccessResponse.location) {
          expect(response.headers.location).toEqual(expectedSuccessResponse.location);
        } else {
          expect(response.headers.location).toBeUndefined();
        }
      },
      numberOfSignInOtpAttemptsRemaining: attemptsLeft,
    });

    describe('with a valid partial auth token', () => {
      const partialAuthToken = 'partial auth token';
      const email = 'email@example.com';
      const password = 'a password';
      const numberOfSignInOtpAttemptsRemaining = attemptsLeft;
      let sessionCookie: string;
      beforeEach(async () => {
        resetAllWhenMocks();
        jest.clearAllMocks();
        mockedLogin.mockImplementation(mockLogin(partialAuthToken));
        mockedSendSignInOTP.mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: attemptsLeft } });
        (api.loginWithSignInOtp as jest.Mock).mockResolvedValue({
          loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
          token: 'mock 2FA validated token',
          user: { roles: [ROLES.MAKER] },
        });
        sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
        when(mockedValidatePartialAuthToken)
          .calledWith(partialAuthToken)
          .mockResolvedValueOnce({} as any);
      });

      describe('when the user does not have a session', () => {
        beforeEach(() => {
          mockSuccessfulSendSignInOtpResponse();
        });

        it('should redirect the user to /login', async () => {
          const { status, headers } = await post({}).to(`/login/${endpoint}`);

          expect(status).toEqual(HttpStatusCode.Found);
          expect(headers.location).toEqual('/login');
        });
      });

      describe.each([
        {
          description: 'when a user is not blocked',
          beforeEachSetUp: () => {
            mockSuccessfulSendSignInOtpResponse();
          },
        },
        {
          description: 'when a user is blocked',
          beforeEachSetUp: () => {
            mock403SendSignInOtpResponse();
          },
        },
        {
          description: 'when sending an email fails',
          beforeEachSetUp: () => {
            mock500SendSignInOtpResponse();
          },
        },
      ])('$description', ({ beforeEachSetUp }) => {
        beforeEach(() => {
          beforeEachSetUp();
        });

        itHandlesSuccessfulOtpSubmission();
      });

      function itHandlesSuccessfulOtpSubmission() {
        it('should complete the OTP submission with the expected response', async () => {
          const { status, headers } = await post({ sixDigitAccessCode: '123456' }, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

          expect(status).toEqual(expectedSuccessResponse.status);
          if (expectedSuccessResponse.location) {
            expect(headers.location).toEqual(expectedSuccessResponse.location);
          } else {
            expect(headers.location).toBeUndefined();
          }
        });
      }

      function mockSuccessfulSendSignInOtpResponse() {
        when(mockedSendSignInOTP).calledWith(expect.anything()).mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining } });
      }

      function mockUnsuccessfulSendSignInOtpResponseWithStatusCode(statusCode: number) {
        const error = new Error(`Request failed with status: ${statusCode}`) as Error & { response?: { status: number } };
        error.response = { status: statusCode };
        when(mockedSendSignInOTP).calledWith(expect.anything()).mockRejectedValue(error);
      }

      function mock403SendSignInOtpResponse() {
        mockUnsuccessfulSendSignInOtpResponseWithStatusCode(403);
      }

      function mock500SendSignInOtpResponse() {
        mockUnsuccessfulSendSignInOtpResponseWithStatusCode(500);
      }
    });

    describe('OTP expiration handling', () => {
      const partialAuthToken = 'partial auth token';
      const email = 'email@example.com';
      const password = 'a password';
      let sessionCookie: string;

      beforeEach(async () => {
        resetAllWhenMocks();
        jest.clearAllMocks();
        mockedLogin.mockImplementation(mockLogin(partialAuthToken));
        mockedSendSignInOTP.mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: attemptsLeft } });
        sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
        when(mockedValidatePartialAuthToken)
          .calledWith(partialAuthToken)
          .mockResolvedValueOnce({} as any);
      });

      it('should redirect to /login/access-code-expired when OTP has expired via isExpired flag', async () => {
        (api.loginWithSignInOtp as jest.Mock).mockResolvedValue({ isExpired: true });

        const { status, headers } = await post({ sixDigitAccessCode: '123456' }, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

        expect(status).toEqual(HttpStatusCode.Found);
        expect(headers.location).toEqual('/login/access-code-expired');
      });

      it('should redirect to /login/access-code-expired when API returns 401 with expired error message', async () => {
        const expiredError = Object.assign(new Error('Unauthorized'), {
          isAxiosError: true,
          response: {
            status: HttpStatusCode.Unauthorized,
            data: { errors: [{ msg: 'The access code has expired. Request a new code.' }] },
          },
        });
        (api.loginWithSignInOtp as jest.Mock).mockRejectedValue(expiredError);

        const { status, headers } = await post({ sixDigitAccessCode: '123456' }, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

        expect(status).toEqual(HttpStatusCode.Found);
        expect(headers.location).toEqual('/login/access-code-expired');
      });

      it('should redirect to /login/access-code-expired when API returns 403 with expired error message', async () => {
        const expiredError = Object.assign(new Error('Forbidden'), {
          isAxiosError: true,
          response: {
            status: HttpStatusCode.Forbidden,
            data: { errors: [{ msg: 'access code expired' }] },
          },
        });
        (api.loginWithSignInOtp as jest.Mock).mockRejectedValue(expiredError);

        const { status, headers } = await post({ sixDigitAccessCode: '123456' }, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

        expect(status).toEqual(HttpStatusCode.Found);
        expect(headers.location).toEqual('/login/access-code-expired');
      });
    });
  });
};
