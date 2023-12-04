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
const { ADMIN } = require('../server/constants/roles');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

describe('GET /activity', () => {
  const usersSearchTerm = 'test';

  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/activity', { usersSearchTerm }, headers),
    whitelistedRoles: [ADMIN],
    successCode: 200,
  });
});

describe('POST /activity', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => post('/activity', {}, headers),
    whitelistedRoles: [ADMIN],
    successCode: 200,
  });
});
