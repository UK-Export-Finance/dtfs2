jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/test-helpers');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');

const { get, post } = createApi(app);

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
