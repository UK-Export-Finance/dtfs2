const { MAKER, TODO_DTFS2_UPDATE_ROLE } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = 'dealId-test-value';
const facilityId = 'facilityId-test-value';

describe('unissued facilities routes', () => {
  describe('GET /application-details/:dealId/unissued-facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('GET /application-details/:dealId/unissued-facilities/:facilityId/about', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities/${facilityId}/about`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/unissued-facilities/:facilityId/about', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/unissued-facilities/${facilityId}/about`),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('GET /application-details/:dealId/unissued-facilities/:facilityId/change', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities/${facilityId}/change`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/unissued-facilities/:facilityId/change', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/unissued-facilities/${facilityId}/change`),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('GET /application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities/${facilityId}/change-to-unissued`, {}, headers),
      whitelistedRoles: [TODO_DTFS2_UPDATE_ROLE],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/unissued-facilities/${facilityId}/change-to-unissued`),
      whitelistedRoles: [TODO_DTFS2_UPDATE_ROLE],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });
});
