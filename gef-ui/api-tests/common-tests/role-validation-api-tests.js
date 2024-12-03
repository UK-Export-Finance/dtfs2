jest.mock('../../server/services/api', () => ({
  ...jest.requireActual('../../server/services/api'),
  validateToken: () => true,
  validateBank: () => ({ isValid: true }),
}));
jest.mock('../../server/middleware/csrf', () => ({
  ...jest.requireActual('../../server/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));

jest.mock('../../server/utils/csrf-token-checker.js', () => ({
  ...jest.requireActual('../../server/utils/csrf-token-checker.js'),
  isCsrfTokenValid: () => true,
}));

const { ROLES } = require('../../server/constants');
const storage = require('../test-helpers/storage/storage');

const allRoles = Object.values(ROLES);

const withRoleValidationApiTests = ({
  makeRequestWithHeaders,
  whitelistedRoles,
  successCode,
  successHeaders,
  disableHappyPath = false, // TODO DTFS2-6697: remove and test happy paths.
  redirectUrlForInvalidRoles,
}) => {
  const nonWhitelistedRoles = allRoles.filter((role) => !whitelistedRoles.includes(role));

  describe('role validation', () => {
    const includeWhitelistedRolesTests = !disableHappyPath && whitelistedRoles.length;
    const includeNonWhitelistedRolesTests = nonWhitelistedRoles.length;

    if (includeWhitelistedRolesTests || includeNonWhitelistedRolesTests) {
      beforeEach(async () => {
        await storage.flush();
      });

      afterAll(async () => {
        await storage.flush();
      });
    }

    if (includeWhitelistedRolesTests) {
      describe('whitelisted roles', () => {
        it.each(whitelistedRoles)(`returns a ${successCode} response if the user only has the '%s' role`, async (allowedRole) => {
          const { sessionCookie } = await storage.saveUserSession([allowedRole]);

          const response = await makeRequestWithHeaders({
            Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
          });

          expect(response.status).toEqual(successCode);

          if (successHeaders) {
            Object.entries(successHeaders).forEach(([key, value]) => {
              expect(response.headers[key]).toEqual(value);
            });
          }
        });
      });
    }

    if (includeNonWhitelistedRolesTests) {
      describe('non-whitelisted roles', () => {
        it.each(nonWhitelistedRoles)("returns a 302 response if the user only has the '%s' role", async (disallowedRole) => {
          const { sessionCookie } = await storage.saveUserSession([disallowedRole]);

          const response = await makeRequestWithHeaders({
            Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
          });

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
