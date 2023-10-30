jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendAuthenticationEmail: jest.fn(),
  validateAuthenticationEmail: jest.fn(),
  validateToken: () => true,
}));

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { ROLES } = require('../server/constants');
const { get } = require('./create-api').createApi(app);

const allRoles = Object.values(ROLES);

describe('static routes', () => {
  describe('GET /.well-known/security.txt', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/.well-known/security.txt', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('GET /thanks.txt', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/thanks.txt', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
