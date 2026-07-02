const { createApi } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const { get, post } = createApi(app);

const dealId = '123';

const validIndustry = {
  name: 'Manufacturing',
  class: {
    name: 'Industry class',
  },
};

const MOCK_DEAL_WITH_VALID_INDUSTRY = {
  ...MOCK_BASIC_DEAL,
  exporter: {
    ...MOCK_BASIC_DEAL.exporter,
    industries: [validIndustry],
    selectedIndustry: validIndustry,
  },
};

describe('about exporter routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(MOCK_DEAL_WITH_VALID_INDUSTRY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/about-exporter', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/about-exporter`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('POST /application-details/:dealId/about-exporter', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/about-exporter`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });
});
