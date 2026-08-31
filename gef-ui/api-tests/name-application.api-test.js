const { createApi, cloneMock } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const { get, post } = createApi(app);

const dealId = '123';
const applicationNameUrl = `/applications/${dealId}/name`;

describe('name application routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    jest.spyOn(api, 'createApplication').mockResolvedValue({ _id: '123456' });
    api.updateApplication.mockResolvedValue({ _id: '123456' });
  });

  describe('GET /name-application', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/name-application', {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /name-application', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({ bankInternalRefName: 'Test ref', additionalRefName: 'Additional ref' }, headers).to('/name-application'),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Found,
      successHeaders: {
        location: '/gef/application-details/123456',
      },
    });
  });

  describe('GET /applications/:dealId/name', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(applicationNameUrl, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /applications/:dealId/name', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({ bankInternalRefName: 'Test ref', additionalRefName: 'Additional ref' }, headers).to(applicationNameUrl),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Found,
      successHeaders: {
        location: '/gef/application-details/123456',
      },
    });
  });
});
