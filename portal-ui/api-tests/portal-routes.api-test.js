jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  getUnissuedFacilitiesReport: jest.fn(),
  getUkefDecisionReport: jest.fn(),
}));

const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/api');

const { get } = createApi(app);

describe('portal routes', () => {
  beforeEach(() => {
    api.getUnissuedFacilitiesReport.mockResolvedValue([]);
    api.getUkefDecisionReport.mockResolvedValue([]);
  });

  describe('GET /reports', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });

  describe('GET /reports/review-unissued-facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-unissued-facilities', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });

  describe('GET /reports/review-unconditional-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-unconditional-decision', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });

  describe('GET /reports/review-conditional-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-conditional-decision', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });

  describe('GET /reports/download-unissued-facilities-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-unissued-facilities-report', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });

  describe('GET /reports/download-unconditional-decision-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-unconditional-decision-report', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });

  describe('GET /reports/download-conditional-decision-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-conditional-decision-report', {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
    });
  });
});
