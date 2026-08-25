jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  user: jest.fn(),
}));

const { ROLES } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/api');
const { MOCK_PORTAL_SESSION_USER } = require('../server/test-mocks/mock-portal-session-user');

const { get, post } = createApi(app);

const allRoles = Object.values(ROLES);

const _id = '64f736071f0fd6ecf617db8a';

describe('user routes', () => {
  beforeEach(() => {
    api.user.mockResolvedValue(MOCK_PORTAL_SESSION_USER);
  });

  describe('GET /user/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/user/${_id}`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
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
    });
  });
});
