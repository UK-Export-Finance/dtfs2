jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  validateToken: () => true,
}));

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server');
const { get } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const allRoles = Object.values(ROLES);

describe('footer routes', () => {
  describe('GET /contact-us', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/contact-us', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('GET /cookies', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/cookies', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('GET /accessibility-statement', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/accessibility-statement', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
