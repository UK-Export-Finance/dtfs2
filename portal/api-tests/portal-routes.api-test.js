const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);

describe('portal routes', () => {
  describe('GET /reports', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports', {}, headers),
      whitelistedRoles: ['maker', 'checker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/review-unissued-facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-unissued-facilities', {}, headers),
      whitelistedRoles: ['maker', 'checker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/review-unconditional-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-unconditional-decision', {}, headers),
      whitelistedRoles: ['maker', 'checker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/review-conditional-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/review-conditional-decision', {}, headers),
      whitelistedRoles: ['maker', 'checker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/download-unissued-facilities-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-unissued-facilities-report', {}, headers),
      whitelistedRoles: ['maker', 'checker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/download-unconditional-decision-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-unconditional-decision-report', {}, headers),
      whitelistedRoles: ['maker', 'checker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /reports/download-conditional-decision-report', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reports/download-conditional-decision-report', {}, headers),
      whitelistedRoles: ['maker', 'checker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
