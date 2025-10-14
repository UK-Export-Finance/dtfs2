const { getCurrentGefDealVersion, FACILITY_TYPE, PORTAL_AMENDMENT_STATUS, isPortalFacilityAmendmentsFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { aPortalFacilityAmendment } = require('@ukef/dtfs2-common/mock-data-backend');
const databaseHelper = require('../../../database-helper');

const app = require('../../../../server/createApp');
const testUserCache = require('../../../api-test-users');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../../server/v1/roles/roles');

const { facilityUpdate } = require('../../../fixtures/gef/facility-update');

const { as, get } = require('../../../api')(app);

const baseUrl = '/v1/gef/facilities';

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../../fixtures/gef/application');

const { DB_COLLECTIONS } = require('../../../fixtures/constants');
const { generateANewFacility } = require('./helpers/generate-a-new-facility.tests');

const getAcknowledgedAmendmentsByFacilityIdMock = jest.fn();

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

jest.mock('../../../../server/v1/api', () => ({
  ...jest.requireActual('../../../../server/v1/api'),
  getAcknowledgedAmendmentsByFacilityId: () => getAcknowledgedAmendmentsByFacilityIdMock(),
}));

describe(baseUrl, () => {
  let maker1;
  let mockApplication;
  let newFacility;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    maker1 = testUsers().withRole(MAKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES, DB_COLLECTIONS.DEALS]);

    mockApplication = await as(maker1).post(mockApplications[0]).to(applicationBaseUrl);

    newFacility = generateANewFacility({ dealId: mockApplication.body._id, makerId: maker1._id, dealVersion: getCurrentGefDealVersion() });
  });

  describe(`GET ${baseUrl}?dealId=`, () => {
    let facilitiesUrl;
    let amendment;
    let facility;
    let updatedFacility;

    beforeEach(async () => {
      facilitiesUrl = `${baseUrl}?dealId=${mockApplication.body._id}`;

      await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);

      const {
        body: { details },
      } = await as(maker1).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
      facility = details;

      const {
        body: { details: update },
      } = await as(maker1).put(facilityUpdate).to(`${baseUrl}/${facility._id}`);
      updatedFacility = update;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(facilitiesUrl),
      makeRequestWithAuthHeader: (authHeader) => get(facilitiesUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(facilitiesUrl),
      successStatusCode: 200,
    });

    it('returns a 400 error if the dealId is not a valid mongo id', async () => {
      const { status, body } = await as(maker1).get(`${baseUrl}?dealId=123`);
      expect(status).toEqual(400);
      expect(body).toStrictEqual({ message: 'Invalid Deal Id', status: 400 });
    });

    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
    });

    afterEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
    });

    describe('when there are no amendments', () => {
      it('should return the original facility', async () => {
        const {
          body: { items },
        } = await as(maker1).get(facilitiesUrl);
        const response = items[0].details;

        expect(response).toEqual(updatedFacility);
      });
    });

    describe('when amendments are present', () => {
      beforeEach(async () => {
        const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
        amendment = {
          ...anAcknowledgedPortalAmendment,
          value: 5000,
          facilityId: facility._id,
          coverEndDate: new Date('2023-01-01'),
        };

        jest.mocked(getAcknowledgedAmendmentsByFacilityIdMock).mockResolvedValue([amendment]);
      });

      it('should replace value and coverEndDate with amended values', async () => {
        const {
          body: { items },
        } = await as(maker1).get(facilitiesUrl);
        const response = items[0].details;

        updatedFacility.value = amendment.value;
        updatedFacility.coverEndDate = amendment.coverEndDate.toISOString();

        expect(response).toEqual(updatedFacility);
      });
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    let oneFacilityUrl;

    beforeEach(async () => {
      const {
        body: {
          details: { _id: createdFacilityId },
        },
      } = await as(maker1).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
      oneFacilityUrl = `${baseUrl}/${createdFacilityId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneFacilityUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneFacilityUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneFacilityUrl),
      successStatusCode: 200,
    });

    it('returns an individual item', async () => {
      const { body } = await as(maker1).get(oneFacilityUrl);
      expect(body).toEqual(newFacility);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(maker1).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });
});
