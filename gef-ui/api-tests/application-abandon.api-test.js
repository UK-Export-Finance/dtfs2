const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const dealId = '123';

const { get, post } = createApi(app);

describe('application abandon routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(MOCK_BASIC_DEAL);
    api.getFacilities.mockResolvedValue(MOCK_BASIC_DEAL.facilities);
    api.getUserDetails.mockResolvedValue({});
    api.setApplicationStatus.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/abandon', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/abandon`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/abandon', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/abandon`),
      whitelistedRoles: [MAKER],
      successCode: 302,
    });
  });
});
