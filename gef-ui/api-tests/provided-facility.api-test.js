const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = 'dealId-test-value';
const facilityId = 'facilityId-test-value';

describe('provided facility routes', () => {
  describe('GET /application-details/:dealId/facilities/:facilityId/provided-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities/${facilityId}/provided-facility`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/facilities/:facilityId/provided-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/facilities/${facilityId}/provided-facility`),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });
});
