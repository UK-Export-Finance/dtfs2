jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { get, post } = require('../create-api').createApi(app);
const { ROLES } = require('../../server/constants');

const allRoles = Object.values(ROLES);
describe('GET /login/check-your-email', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/login/check-your-email', {}, headers),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});

// TODO DTFS2-6770: e2e and api tests
// TODO DTFS2-6770: auth api tests
describe('POST /login/check-your-email', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => post({}, headers).to('/login/check-your-email'),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});
