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

const { ROLES } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');

const { get } = createApi(app);

const allRoles = Object.values(ROLES);

describe('default route', () => {
  describe('GET /', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 302,
    });
  });
});
