const { createApi } = require('@ukef/dtfs2-common/api-test');
const { cloneMock } = require('@ukef/dtfs2-common/api-test');
const { CHECKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const { get, post } = createApi(app);

const dealId = '123';

describe('submit to ukef routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
    api.updateApplication.mockResolvedValue({});
    api.setApplicationStatus.mockResolvedValue({});
  });

  describe('GET /application-details/:dealId/submit-to-ukef', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/submit-to-ukef`, {}, headers),
      whitelistedRoles: [CHECKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/submit-to-ukef', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({ confirmSubmitUkef: 'true' }, headers).to(`/application-details/${dealId}/submit-to-ukef`),
      whitelistedRoles: [CHECKER],
      successCode: 200,
    });
  });
});
