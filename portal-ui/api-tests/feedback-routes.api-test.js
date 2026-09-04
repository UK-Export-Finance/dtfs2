jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  createFeedback: jest.fn(),
}));

const { ROLES } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/api');

const { get, post } = createApi(app);

const allRoles = Object.values(ROLES);

describe('feedback routes', () => {
  beforeEach(() => {
    api.createFeedback.mockResolvedValue({});
  });

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
      successCode: 302,
      successHeaders: { location: '/thank-you-feedback' },
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
