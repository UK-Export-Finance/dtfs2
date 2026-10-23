const { createApi } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const cloneMock = (value) => JSON.parse(JSON.stringify(value));

const { get, post } = createApi(app);

const dealId = '123';
const documentType = 'manual-inclusion-questionnaire';

describe('supporting information routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/supporting-information/document/:documentType', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/supporting-information/document/${documentType}`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('POST /application-details/:dealId/supporting-information/document/:documentType', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/supporting-information/document/${documentType}`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });
});
