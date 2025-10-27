const { FACILITY_TYPE, PORTAL_AMENDMENT_STATUS, isPortalFacilityAmendmentsFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { aPortalFacilityAmendment } = require('@ukef/dtfs2-common/mock-data-backend');
const databaseHelper = require('../../database-helper');

const app = require('../../../server/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../server/v1/roles/roles');

const mockApplications = require('../../fixtures/gef/application');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const { as, get } = require('../../api')(app);

const baseUrl = '/v1/facilities';
const gefBaseUrl = '/v1/gef/facilities';
const applicationBaseUrl = '/v1/gef/application';

const getAcknowledgedAmendmentsByFacilityIdMock = jest.fn();

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

jest.mock('../../../server/v1/api', () => ({
  ...jest.requireActual('../../../server/v1/api'),
  getAcknowledgedAmendmentsByFacilityId: () => getAcknowledgedAmendmentsByFacilityIdMock(),
}));

describe(baseUrl, () => {
  let maker1;
  let mockApplication;
  let createdFacility;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    maker1 = testUsers().withRole(MAKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES, DB_COLLECTIONS.DEALS]);

    // create a GEF application/deal to attach facility to
    mockApplication = await as(maker1).post(mockApplications[0]).to(applicationBaseUrl);

    // create a facility for the deal
    const {
      body: { details },
    } = await as(maker1).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(gefBaseUrl);

    createdFacility = details;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(baseUrl),
    makeRequestWithAuthHeader: (authHeader) => get(baseUrl, { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(baseUrl),
    successStatusCode: 200,
  });

  it('should return the created facility', async () => {
    const { body } = await as(maker1).get(baseUrl);
    const items = body.facilities || [];

    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0]._id).toEqual(createdFacility._id);
  });

  describe('when amendments are present and feature flag enabled', () => {
    beforeEach(async () => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);

      const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
      // amend value and coverEndDate for the facility
      const amendment = {
        ...anAcknowledgedPortalAmendment,
        value: 12345,
        facilityId: createdFacility._id,
        coverEndDate: new Date('2030-12-31'),
      };

      jest.mocked(getAcknowledgedAmendmentsByFacilityIdMock).mockResolvedValue([amendment]);
    });

    it('should replace value and coverEndDate with amended values', async () => {
      const { body } = await as(maker1).get(baseUrl);
      const items = body.facilities || [];
      expect(items.length).toBeGreaterThanOrEqual(1);

      const responseFacilityItem = items.find((i) => `${i._id}` === `${createdFacility._id}`);
      const response = responseFacilityItem;

      expect(response.value).toEqual(12345);
      expect(new Date(response.coverEndDate).toISOString()).toEqual(new Date('2030-12-31').toISOString());
    });
  });
});
