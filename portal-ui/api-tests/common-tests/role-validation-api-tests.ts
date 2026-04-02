import { ROLES } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { login, loginWithSignInLink } from '../../server/api';
import app from '../../server/createApp';
import { SIGN_IN_TOKEN_LINK_TOKEN } from '../fixtures/sign-in-token-constants';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';
import loginWithSignInLinkAsRole from '../helpers/loginWithSignInLinkAsRole';

const { get, post } = createApi(app);

const allRoles: string[] = Object.values(ROLES) as string[];
const email = 'mock email';
const password = 'mock password';
const token = SIGN_IN_TOKEN_LINK_TOKEN.EXAMPLE_ONE;
const userId = '61e567d7db41bd65b00bd47a';

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

type WithRoleValidationApiTestsParams = {
  makeRequestWithHeaders: (headers: RequestHeaders) => Promise<ApiResponse>;
  whitelistedRoles: string[];
  successCode: number;
  successHeaders?: Record<string, unknown>;
  disableHappyPath?: boolean;
  redirectUrlForInvalidRoles?: string;
};

export const withRoleValidationApiTests = ({
  makeRequestWithHeaders,
  whitelistedRoles,
  successCode,
  successHeaders,
  disableHappyPath,
  redirectUrlForInvalidRoles,
}: WithRoleValidationApiTestsParams) => {
  const nonWhitelistedRoles = allRoles.filter((role) => !whitelistedRoles.includes(role));

  describe('role validation', () => {
    if (!disableHappyPath) {
      // TODO DTFS2-6654: remove and test happy paths.
      if (whitelistedRoles.length) {
        describe('whitelisted roles', () => {
          it.each(whitelistedRoles)(`should return a ${successCode} response if the user only has the '%s' role`, async (allowedRole) => {
            (login as jest.Mock).mockImplementation(mockLogin());
            (loginWithSignInLink as jest.Mock).mockImplementation(loginWithSignInLinkAsRole(allowedRole));

            const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
            await get('/login/sign-in-link', { t: token, u: userId }, { Cookie: sessionCookie });
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
          (login as jest.Mock).mockImplementation(mockLogin());
          (loginWithSignInLink as jest.Mock).mockImplementation(loginWithSignInLinkAsRole(disallowedRole));

          const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
          await get('/login/sign-in-link', { t: token, u: userId }, { Cookie: sessionCookie });
          const response = await makeRequestWithHeaders({ Cookie: sessionCookie });

          expect(response.status).toEqual(302);
          const redirectUrl = redirectUrlForInvalidRoles ?? '/';
          expect(response.headers.location).toEqual(redirectUrl);
        });
      });
    }
  });
};
