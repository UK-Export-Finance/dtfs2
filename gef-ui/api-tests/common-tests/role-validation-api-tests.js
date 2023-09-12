jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/middleware/csrf', () => ({
  ...jest.requireActual('../../server/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/services/api', () => ({
  ...jest.requireActual('../../server/services/api'),
  login: jest.fn(),
  validateToken: () => true,
}));

const { login } = require('../../server/services/api');
const { ROLES } = require('../../server/constants');
const app = require('../../server/createApp');
const { request } = require('../../server/services/axios');
// const { post } = require('../create-api').createApi(app);

const allRoles = Object.values(ROLES);

// const email = 'mock email';
// const password = 'mock password';

const loginAsRole = (role) => () => ({
  success: true,
  token: 'mock token',
  user: { roles: [role] },

  get: async (url, query = {}, headers = {}) => request(app).get(url).set(headers).query(query),

  post: (data, headers = {}) => ({
    to: async (url) => request(app).post(url).set(headers).send(data),
  }),
});

// const extractSessionCookie = (res) => res.headers['set-cookie'].pop().split(';')[0];

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
            login.mockImplementation(loginAsRole(allowedRole));

            // const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);

            // const response = await makeRequestWithHeaders({ Cookie: [sessionCookie] });

            const response = await makeRequestWithHeaders();
            expect(response.status).toBe(successCode);

            if (successHeaders) {
              Object.entries(successHeaders).forEach(([key, value]) => {
                expect(response.headers[key]).toBe(value);
              });
            }
          });
        });
      }
    }

    if (nonWhitelistedRoles.length) {
      describe('non-whitelisted roles', () => {
        it.each(nonWhitelistedRoles)("returns a 302 response if the user only has the '%s' role", async (disallowedRole) => {
          login.mockImplementation(loginAsRole(disallowedRole));

          // const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);

          // const response = await makeRequestWithHeaders({ Cookie: [sessionCookie] });

          const response = await makeRequestWithHeaders();
          expect(response.status).toBe(302);
          const redirectUrl = redirectUrlForInvalidRoles ?? '/';
          expect(response.headers.location).toBe(redirectUrl);
        });
      });
    }
  });
};

module.exports = {
  withRoleValidationApiTests,
};
