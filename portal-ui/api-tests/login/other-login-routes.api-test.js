jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { ROLES } = require('@ukef/dtfs2-common');
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { get, post } = require('../create-api').createApi(app);

const allRoles = Object.values(ROLES);

const pwdResetToken = 'pwd-reset-token';

describe('GET /logout', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/logout', {}, headers),
    whitelistedRoles: allRoles,
    successCode: 302,
    successHeaders: { location: '/login' },
  });
});

describe('GET /reset-password', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/reset-password', {}, headers),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});

describe('POST /reset-password', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => post({}, headers).to('/reset-password'),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});

describe('GET /reset-password/:pwdResetToken', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get(`/reset-password/${pwdResetToken}`, {}, headers),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});
