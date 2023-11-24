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

const pwdResetToken = 'pwd-reset-token';

describe('GET /login/sign-in-link?t={signInToken}', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/login/sign-in-link', { t: '123' }, headers),
    whitelistedRoles: allRoles,
    successCode: 302,
  });
});

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

describe('POST /reset-password/:pwdResetToken', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => post({}, headers).to(`/reset-password/${pwdResetToken}`),
    whitelistedRoles: allRoles,
    successCode: 302,
    successHeaders: { location: '/login?passwordupdated=1' },
    disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
  });
});
