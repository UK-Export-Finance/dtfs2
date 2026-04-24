const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const { get, post } = createApi(app);

const dealId = '123';

describe('about exporter routes', () => {
  beforeEach(() => {
    jest.spyOn(api, 'getApplication').mockResolvedValue(MOCK_BASIC_DEAL);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /application-details/:dealId/about-exporter', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/about-exporter`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/about-exporter', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/about-exporter`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
