const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = '123';
const facilityId = '111';

describe('facilities routes', () => {
  describe('GET /application-details/:dealId/facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });

  describe('GET /application-details/:dealId/facilities/:facilityId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities/${facilityId}`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/facilities`),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/facilities/:facilityId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/facilities/${facilityId}`),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });
});
