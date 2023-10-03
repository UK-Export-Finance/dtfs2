const { login } = require('../../server/api');
const { ROLES } = require('../../server/constants');
const app = require('../../server/createApp');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const loginAsRole = require('../helpers/loginAsRole');
const { post } = require('../create-api').createApi(app);

const allRoles = Object.values(ROLES);
const email = 'mock email';
const password = 'mock password';

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
    if (!disableHappyPath) { // TODO DTFS2-6654: remove and test happy paths.
      if (whitelistedRoles.length) {
        describe('whitelisted roles', () => {
          it.each(whitelistedRoles)(
            `returns a ${successCode} response if the user only has the '%s' role`,
            async (allowedRole) => {
              login.mockImplementation(loginAsRole(allowedRole));

              const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);

              const response = await makeRequestWithHeaders({ Cookie: [sessionCookie] });

              expect(response.status).toBe(successCode);

              if (successHeaders) {
                for (const [key, value] of Object.entries(successHeaders)) {
                  expect(response.headers[key]).toBe(value);
                }
              }
            },
          );
        });
      }
    }

    if (nonWhitelistedRoles.length) {
      describe('non-whitelisted roles', () => {
        it.each(nonWhitelistedRoles)(
          'returns a 302 response if the user only has the \'%s\' role',
          async (disallowedRole) => {
            login.mockImplementation(loginAsRole(disallowedRole));

            const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);

            const response = await makeRequestWithHeaders({ Cookie: [sessionCookie] });

            expect(response.status).toBe(302);
            const redirectUrl = redirectUrlForInvalidRoles ?? '/';
            expect(response.headers.location).toBe(redirectUrl);
          },
        );
      });
    }
  });
};

module.exports = {
  withRoleValidationApiTests,
};
