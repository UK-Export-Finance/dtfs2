const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const storage = require('./test-helpers/storage/storage');
const { MOCK_ISSUED_FACILITY } = require('../server/utils/mocks/mock-facilities');

const { get, post } = createApi(app);

const dealId = '123';
const facilityId = '111';

describe('facilities routes', () => {
  beforeEach(() => {
    jest.spyOn(api, 'getFacility').mockResolvedValue(MOCK_ISSUED_FACILITY);
    jest.spyOn(api, 'createFacility').mockResolvedValue(MOCK_ISSUED_FACILITY);
    jest.spyOn(api, 'updateFacility').mockResolvedValue(MOCK_ISSUED_FACILITY);
    jest.spyOn(api, 'updateApplication').mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('GET /application-details/:dealId/facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });

    it('should render the facilities page (happy path)', async () => {
      const { sessionCookie } = await storage.saveUserSession([MAKER]);

      const response = await get(
        `/application-details/${dealId}/facilities`,
        {},
        {
          Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        },
      );

      expect(response.status).toEqual(200);
      expect(response.text).toContain('Facilities');
    });
  });

  describe('GET /application-details/:dealId/facilities/:facilityId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities/${facilityId}`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/facilities`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/facilities/:facilityId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/facilities/${facilityId}`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
