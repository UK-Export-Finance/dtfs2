const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const cloneMock = (value) => JSON.parse(JSON.stringify(value));

const { get, post } = createApi(app);

const dealId = MOCK_BASIC_DEAL._id;
const facilityId = '61a771cc2ae62b0013dae68a';

describe('confirm cover start date routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
    api.getPortalAmendmentsOnDeal.mockResolvedValue([]);
    api.getFacility.mockResolvedValue({
      details: { _id: facilityId, dealId, name: 'Facility one', coverEndDate: '2030-01-01T00:00:00.000Z', coverStartDate: null },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/:facilityId/confirm-cover-start-date/', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/${facilityId}/confirm-cover-start-date/`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/:facilityId/confirm-cover-start-date/', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/${facilityId}/confirm-cover-start-date/`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
