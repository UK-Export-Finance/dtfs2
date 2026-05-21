const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');
const { MOCK_ISSUED_FACILITY } = require('../server/utils/mocks/mock-facilities');

const { get, post } = createApi(app);

const dealId = '123';
const facilityId = '111';

describe('facility currency routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(MOCK_BASIC_DEAL);
    api.getFacility.mockResolvedValue(MOCK_ISSUED_FACILITY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/facilities/:facilityId/facility-currency', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities/${facilityId}/facility-currency`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/facilities/:facilityId/facility-currency', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/facilities/${facilityId}/facility-currency`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
