import { PORTAL_LOGIN_STATUS, ROLES } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { login, loginWithSignInOtp, sendSignInOTP } from '../../server/api';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';

const { post } = createApi(app);
const mockedLogin = login as jest.Mock;
const mockedSendSignInOTP = sendSignInOTP as jest.Mock;
const mockedLoginWithSignInOtp = loginWithSignInOtp as jest.Mock;

const allRoles: string[] = Object.values(ROLES) as string[];
const email = 'mock email';
const password = 'mock password';

type SessionCookieResponse = {
  headers: {
    'set-cookie': string[];
  };
};

const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);

type RequestHeaders = {
  Cookie: string | string[];
};

type ApiResponse = {
  status: number;
  headers: Record<string, unknown>;
};

type WithRoleValidationOtpApiTestsParams = {
  makeRequestWithHeaders: (headers: RequestHeaders) => Promise<ApiResponse>;
  whitelistedRoles: string[];
  successCode: number;
  successHeaders?: Record<string, unknown>;
  endpoint: string;
  attemptsLeft?: number;
  disableHappyPath?: boolean;
  redirectUrlForInvalidRoles?: string;
};

const mockSuccessfulSendSignInOtp = (attemptsLeft?: number) => ({
  data: {
    numberOfSignInOtpAttemptsRemaining: attemptsLeft,
  },
});

export const withRoleValidationOtpApiTests = ({
  makeRequestWithHeaders,
  whitelistedRoles,
  successCode,
  successHeaders,
  endpoint,
  attemptsLeft,
  disableHappyPath, // TODO DTFS2-6654: remove and test happy paths.
  redirectUrlForInvalidRoles,
}: WithRoleValidationOtpApiTestsParams) => {
  const nonWhitelistedRoles = allRoles.filter((role) => !whitelistedRoles.includes(role));

  describe('role validation', () => {
    if (!disableHappyPath) {
      // TODO DTFS2-6654: remove and test happy paths.
      if (whitelistedRoles.length) {
        describe('whitelisted roles', () => {
          it.each(whitelistedRoles)(`should return a ${successCode} response if the user only has the '%s' role`, async (allowedRole) => {
            mockedLogin.mockImplementation(mockLogin());
            mockedSendSignInOTP.mockResolvedValue(mockSuccessfulSendSignInOtp(attemptsLeft));
            mockedLoginWithSignInOtp.mockResolvedValue({
              loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
              token: 'mock 2FA validated token',
              user: { roles: [allowedRole] },
            });

            const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);

            // Set up session with numberOfSignInOtpAttemptsRemaining = 2 by calling the sendNewSignInLink endpoint
            await post({}, { Cookie: [sessionCookie] }).to(`/login/${endpoint}`);

            const response = await makeRequestWithHeaders({ Cookie: sessionCookie });
            expect(response.status).toEqual(successCode);

            if (successHeaders) {
              for (const [key, value] of Object.entries(successHeaders)) {
                expect(response.headers[key]).toEqual(value);
              }
            }
          });
        });
      }
    }

    if (nonWhitelistedRoles.length) {
      describe('non-whitelisted roles', () => {
        it.each(nonWhitelistedRoles)("should return a 302 response if the user only has the '%s' role", async (disallowedRole) => {
          mockedLogin.mockImplementation(mockLogin());
          mockedSendSignInOTP.mockResolvedValue(mockSuccessfulSendSignInOtp());
          mockedLoginWithSignInOtp.mockResolvedValue({
            loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
            token: 'mock 2FA validated token',
            user: { roles: [disallowedRole] },
          });

          const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);

          // Set up session with numberOfSignInOtpAttemptsRemaining = 2 by calling the sendSignInOTP endpoint
          await post({}, { Cookie: [sessionCookie] }).to(`/login/${endpoint}`);

          const response = await makeRequestWithHeaders({ Cookie: [sessionCookie] });

          expect(response.status).toEqual(302);
          const redirectUrl = redirectUrlForInvalidRoles ?? '/';
          expect(response.headers.location).toEqual(redirectUrl);
        });
      });
    }
  });
};
