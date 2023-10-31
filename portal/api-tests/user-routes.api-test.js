jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  validateAuthenticationEmail: jest.fn(),
  validateToken: () => true,
}));

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const allRoles = Object.values(ROLES);

const _id = '64f736071f0fd6ecf617db8a';

describe('user routes', () => {
  describe('GET /user/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/user/${_id}`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /user/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/user/${_id}/change-password`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('POST /user/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/user/${_id}/change-password`),
      whitelistedRoles: allRoles,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
