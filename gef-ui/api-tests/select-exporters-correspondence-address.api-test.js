jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

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

const mockAddresses = JSON.stringify([{ organisationName: 'TEST', addressLine1: '1 Test Street', postalCode: 'AA1 1AA', country: 'United Kingdom' }]);

describe('select exporters correspondence address routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/select-exporters-correspondence-address', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/select-exporters-correspondence-address`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
      extraSessionData: { addresses: mockAddresses, postcode: 'AA1 1AA' },
    });
  });

  describe('POST /application-details/:dealId/select-exporters-correspondence-address', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/select-exporters-correspondence-address`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
      extraSessionData: { addresses: mockAddresses, postcode: 'AA1 1AA' },
    });
  });
});
