const { ROLES } = require('@ukef/dtfs2-common');
const { login, loginWithSignInLink } = require('../../server/api');
const app = require('../../server/createApp');
const { SIGN_IN_TOKEN_LINK_TOKEN } = require('../fixtures/sign-in-token-constants');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const mockLogin = require('../helpers/login');
const loginWithSignInLinkAsRole = require('../helpers/loginWithSignInLinkAsRole');
const { post, get } = require('../create-api').createApi(app);

const allRoles = Object.values(ROLES);
const email = 'mock email';
const password = 'mock password';
const token = SIGN_IN_TOKEN_LINK_TOKEN.EXAMPLE_ONE;
const userId = '61e567d7db41bd65b00bd47a';

const withRoleValidationApiTests = ({
  makeRequestWithHeaders,
  whitelistedRoles,
  successCode,
  successHeaders,
  disableHappyPath, // TODO DTFS2-6654: remove and test happy paths.
  redirectUrlForInvalidRoles,
}) => {
  const nonWhitelistedRoles = allRoles.filter((role) => !whitelistedRoles.includes(role));

  describe('role validation', () => {
    if (!disableHappyPath) {
      // TODO DTFS2-6654: remove and test happy paths.
      if (whitelistedRoles.length) {
        describe('whitelisted roles', () => {
          it.each(whitelistedRoles)(`returns a ${successCode} response if the user only has the '%s' role`, async (allowedRole) => {
            login.mockImplementation(mockLogin());
            loginWithSignInLink.mockImplementation(loginWithSignInLinkAsRole(allowedRole));

            const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
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
        it.each(nonWhitelistedRoles)("returns a 302 response if the user only has the '%s' role", async (disallowedRole) => {
          login.mockImplementation(mockLogin());
          loginWithSignInLink.mockImplementation(loginWithSignInLinkAsRole(disallowedRole));

          const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
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

module.exports = {
  withRoleValidationApiTests,
};
