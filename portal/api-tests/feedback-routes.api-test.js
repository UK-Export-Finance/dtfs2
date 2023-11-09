jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const allRoles = Object.values(ROLES);

describe('feedback routes', () => {
  describe('GET /feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/feedback', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('POST /feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/feedback'),
      whitelistedRoles: allRoles,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /thank-you-feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/thank-you-feedback', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
