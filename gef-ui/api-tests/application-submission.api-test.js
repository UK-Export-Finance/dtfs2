const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const cloneMock = (value) => JSON.parse(JSON.stringify(value));

const dealId = '123';

const { get, post } = createApi(app);

describe('application submission routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
    api.updateApplication.mockResolvedValue({});
    api.setApplicationStatus.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/submit', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/submit`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/submit', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/submit`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
