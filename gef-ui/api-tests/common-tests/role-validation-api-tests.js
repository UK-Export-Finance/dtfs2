jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/middleware/csrf', () => ({
  ...jest.requireActual('../../server/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/services/api', () => ({
  ...jest.requireActual('../../server/services/api'),
  validateToken: () => true,
  validateBank: () => ({ isValid: true }),
}));

// const middleware = require('../../server/middleware');
const { ROLES } = require('../../server/constants');
// const app = require('../../server/createApp');
const storage = require('../test-helpers/storage/storage');

const allRoles = Object.values(ROLES);

// const loginAsRole = (role) => () => ({
//   success: true,
//   token: 'mock token',
//   user: { roles: [role] },

//   get: async (url, query = {}, headers = {}) => request(app).get(url).set(headers).query(query),

//   post: (data, headers = {}) => ({
//     to: async (url) => request(app).post(url).set(headers).send(data),
//   }),
// });

// const extractSessionCookie = (res) => res.headers['set-cookie'].pop().split(';')[0];

const withRoleValidationApiTests = ({
  makeRequestWithHeaders,
  whitelistedRoles,
  // successCode,
  // successHeaders,
  // disableHappyPath, // TODO DTFS2-6654: remove and test happy paths.
  redirectUrlForInvalidRoles,
}) => {
  const nonWhitelistedRoles = allRoles.filter((role) => !whitelistedRoles.includes(role));

  describe('role validation', () => {
    beforeEach(async () => {
      await storage.flush();
    });

    afterAll(() => {
      storage.flush();
    });

    describe('non-whitelisted roles', () => {
      it.each(nonWhitelistedRoles)("returns a 302 response if the user only has the '%s' role", async (disallowedRole) => {
        // const validateRoleSpy = jest.spyOn(middleware, 'validateRole');

        const { sessionCookie } = await storage.saveUserSession([disallowedRole]);

        const response = await makeRequestWithHeaders({ Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] });
        // expect(validateRoleSpy).toHaveBeenCalledWith({ role: whitelistedRoles });

        expect(response.status).toBe(302);
        const redirectUrl = redirectUrlForInvalidRoles ?? '/';
        expect(response.headers.location).toBe(redirectUrl);
      });
    });
  });
};

module.exports = {
  withRoleValidationApiTests,
};
