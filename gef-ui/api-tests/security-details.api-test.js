const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const { get, post } = createApi(app);

const dealId = '123';

const cloneMock = (value) => JSON.parse(JSON.stringify(value));

describe('security details routes', () => {
  beforeEach(() => {
    const mockDeal = cloneMock(MOCK_BASIC_DEAL);
    api.getApplication.mockResolvedValue(mockDeal);
    api.getFacilities.mockResolvedValue(mockDeal.facilities);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/supporting-information/security-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/supporting-information/security-details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/supporting-information/security-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/supporting-information/security-details`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
