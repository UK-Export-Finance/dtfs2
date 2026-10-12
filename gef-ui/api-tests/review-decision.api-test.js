const { createApi, cloneMock } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const { get, post } = createApi(app);

const dealId = MOCK_BASIC_DEAL._id;

describe('review decision routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
    api.getPortalAmendmentsOnDeal.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/review-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/review-decision`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('POST /application-details/:dealId/review-decision', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({ decision: 'true' }, headers).to(`/application-details/${dealId}/review-decision`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Found,
      successHeaders: { location: `/gef/application-details/${dealId}/unissued-facilities` },
    });
  });
});
