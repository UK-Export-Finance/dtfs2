const { createApi } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const cloneMock = (value) => JSON.parse(JSON.stringify(value));

const dealId = MOCK_BASIC_DEAL._id;

const { get, post } = createApi(app);

describe('application details routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
    api.getPortalAmendmentsOnDeal.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}`, {}, headers),
      whitelistedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('POST /application-details/:dealId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Found,
      successHeaders: { location: `/gef/application-details/${dealId}/submit` },
    });
  });
});
