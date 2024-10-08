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

const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);

describe('portal routes', () => {
  describe('GET /reports', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/review-unissued-facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-unissued-facilities', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/review-unconditional-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-unconditional-decision', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/review-conditional-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-conditional-decision', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/download-unissued-facilities-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-unissued-facilities-report', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/download-unconditional-decision-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-unconditional-decision-report', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/download-conditional-decision-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-conditional-decision-report', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
