jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/middleware/csrf', () => ({
  ...jest.requireActual('../../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));

const { when, resetAllWhenMocks } = require('jest-when');
const { MAKER } = require('../../server/constants/roles');
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { get } = require('../create-api').createApi(app);
const api = require('../../server/services/api');
const storage = require('../test-helpers/storage/storage');

api.getFacility = jest.fn();
api.getApplication = jest.fn();
api.updateFacility = jest.fn();
api.updateApplication = jest.fn();

const dealId = '123';
const facilityId = '111';

describe('facility end date routes', () => {
  beforeEach(async () => {
    resetAllWhenMocks();
    await storage.flush();
  });

  afterAll(async () => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    await storage.flush();
  });

  describe('GET /application-details/:dealId/unissued-facilities/:facilityId/facility-end-date', () => {
    describe('with deal version 1 and not using facility end date', () => {
      beforeEach(() => {
        mockIsUsingFacilityEndDate(true);
        mockDealVersion(1);
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities/${facilityId}/facility-end-date`, {}, headers),
        whitelistedRoles: [MAKER],
        successCode: 200,
      });
    });

    describe('when the user is a maker', () => {
      let sessionCookie;
      beforeEach(async () => {
        ({ sessionCookie } = await storage.saveUserSession([MAKER]));
      });

      it('returns 200 when the deal v1 and facility is using facility end date', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(true);
        mockDealVersion(1);

        // Act
        const response = await getFacilityEndDateWithSessionCookie(sessionCookie);

        // Assert
        expect(response.status).toBe(200);
      });

      it('redirects the user to the application details page if the deal is version 0', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(true);
        mockDealVersion(0);

        // Act
        const response = await getFacilityEndDateWithSessionCookie(sessionCookie);

        // Assert
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
      });

      it('redirects the user to the application details page if version is 1 & isUsingFacilityEndDate is null ', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(null);
        mockDealVersion(1);

        // Act
        const response = await getFacilityEndDateWithSessionCookie(sessionCookie);

        // Assert
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
      });

      it('redirects the user to the application details page if version is 1 & isUsingFacilityEndDate is false', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(false);
        mockDealVersion(1);

        // Act
        const response = await getFacilityEndDateWithSessionCookie(sessionCookie);

        // Assert
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
      });
    });
  });
});

function mockIsUsingFacilityEndDate(isUsingFacilityEndDate) {
  when(api.getFacility).calledWith({ facilityId, userToken: expect.anything() }).mockResolvedValueOnce({ details: { isUsingFacilityEndDate } });
}

function mockDealVersion(version) {
  when(api.getApplication).calledWith({ dealId, userToken: expect.anything() }).mockResolvedValueOnce({ version });
}

function getFacilityEndDateWithSessionCookie(sessionCookie) {
  return get(
    `/application-details/${dealId}/unissued-facilities/${facilityId}/facility-end-date`,
    {},
    {
      Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
    },
  );
}
