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
const app = require('../server/createApp');
const { MAKER, CHECKER } = require('../server/constants/roles');
const { get, post } = require('./create-api').createApi(app);

describe('scheme type routes', () => {
  describe('GET /select-scheme', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/select-scheme', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });

  describe('POST /select-scheme', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/select-scheme'),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
