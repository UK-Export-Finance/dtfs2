const { createApi, cloneMock } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_UNISSUED_FACILITY } = require('../server/utils/mocks/mock-facilities');

const { get, post } = createApi(app);

const dealId = '123';
const facilityId = '111';

describe('facility confirm deletion routes', () => {
  beforeEach(() => {
    api.getFacility.mockResolvedValue(cloneMock(MOCK_UNISSUED_FACILITY));
    api.deleteFacility.mockResolvedValue({});
    api.updateApplication.mockResolvedValue({});
  });

  describe('GET /application-details/:dealId/facilities/:facilityId/confirm-deletion', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities/${facilityId}/confirm-deletion`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/facilities/:facilityId/confirm-deletion', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/facilities/${facilityId}/confirm-deletion`),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: `/gef/application-details/${dealId}` },
    });
  });
});
