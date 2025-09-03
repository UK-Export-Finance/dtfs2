jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { ROLES } = require('@ukef/dtfs2-common');
const mockProvide = require('./helpers/mockProvide');

mockProvide();

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const { MAKER } = ROLES;

const allRoles = Object.values(ROLES);

describe('start routes', () => {
  describe('GET /before-you-start', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/before-you-start', {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /before-you-start', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/before-you-start'),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: '/before-you-start/bank-deal' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /before-you-start/bank-deal', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/before-you-start/bank-deal', {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /before-you-start/bank-deal', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/before-you-start/bank-deal'),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: '/contract/undefined' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /unable-to-proceed', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/unable-to-proceed', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
