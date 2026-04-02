import { HttpStatusCode } from 'axios';
import { resetAllWhenMocks, when } from 'jest-when';
import { ROLES } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import * as api from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import type { SessionCookieResponse, RequestHeaders, ApiResponse } from '../types';
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
  validatePortal2FAEnabled: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

export const withSendNewOtpApiTests = (endpoint: string, attemptsLeft: number) => {
  describe(`POST /login/${endpoint}`, () => {
    const { post } = createApi(app);
    const mockedLogin = api.login as jest.Mock;
    const mockedValidatePartialAuthToken = api.validatePartialAuthToken as jest.Mock;
    const mockedSendSignInOTP = api.sendSignInOTP as jest.Mock;
    const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
    const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);
    const allRoles: string[] = Object.values(ROLES) as string[];

    withRoleValidationOtpApiTests({
      makeRequestWithHeaders: (headers?: RequestHeaders) => post({ sixDigitAccessCode: '123456' }, headers).to(`/login/${endpoint}`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: '/dashboard' },
      endpoint,
      attemptsLeft,
    });

    withPartial2faAuthValidationApiTests({
      makeRequestWithHeaders: (headers?: RequestHeaders) => post({ sixDigitAccessCode: '123456' }, headers).to(`/login/${endpoint}`),
      validateResponseWasSuccessful: (response: ApiResponse) => {
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual('/dashboard');
      },
      numberOfSignInOtpAttemptsRemaining: attemptsLeft,
    });

    describe('with a valid partial auth token', () => {
      const partialAuthToken = 'partial auth token';
      const email = 'email@example.com';
      const password = 'a password';
      const numberOfSendSignInOtpAttemptsRemaining = attemptsLeft;
      let sessionCookie: string;
      beforeEach(async () => {
        resetAllWhenMocks();
        jest.clearAllMocks();
        mockedLogin.mockImplementation(mockLogin(partialAuthToken));
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

        itRedirectsTheUserToDashboard();
      });

      function itRedirectsTheUserToDashboard() {
        it('should redirect the user to /dashboard', async () => {
          const { status, headers } = await post({ sixDigitAccessCode: '123456' }, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

          expect(status).toEqual(HttpStatusCode.Found);
          expect(headers.location).toEqual('/dashboard');
        });
      }

      function mockSuccessfulSendSignInOtpResponse() {
        when(mockedSendSignInOTP).calledWith(expect.anything()).mockResolvedValue({ data: { numberOfSendSignInOtpAttemptsRemaining } });
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
  });
};
