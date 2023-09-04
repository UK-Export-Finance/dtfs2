jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/api', () => ({
  ...(jest.requireActual('../../server/api')),
  login: jest.fn(),
  validateToken: () => true,
}));

const { login } = require('../../server/api');
const { ROLES } = require('../../server/constants');
const app = require('../../server/createApp');
const { post } = require('../create-api').createApi(app);

const email = 'mock email';
const password = 'mock password';

const loginAsRole = (role) => () => ({
  success: true,
  token: 'mock token',
  user: { roles: [role] },
});

const extractSessionCookie = (res) => res.headers['set-cookie'].pop().split(';')[0];

const withRoleValidationApiTests = ({
  makeRequestWithHeaders,
  whitelistedRoles,
  successCode,
  successHeaders,
  disableHappyPath, // TODO DTFS2-6654: remove and test happy paths.
}) => {
  const nonWhitelistedRoles = ROLES.filter((role) => !whitelistedRoles.includes(role));

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
            expect(response.headers.location).toBe('/');
          },
        );
      });
    }
  });
};

module.exports = {
  withRoleValidationApiTests,
};
