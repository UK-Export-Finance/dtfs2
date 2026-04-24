const { createApi } = require('@ukef/dtfs2-common/api-test');
const { CHECKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const { get, post } = createApi(app);

const dealId = '123';

describe('return to maker routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(MOCK_BASIC_DEAL);
    api.setApplicationStatus.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/return-to-maker', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/return-to-maker`, {}, headers),
      whitelistedRoles: [CHECKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/return-to-maker', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/return-to-maker`),
      whitelistedRoles: [CHECKER],
      successCode: 302,
    });
  });
});
