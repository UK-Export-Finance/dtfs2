jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));

const { when, resetAllWhenMocks } = require('jest-when');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const api = require('../server/services/api');
const storage = require('./test-helpers/storage/storage');

api.getFacility = jest.fn();
api.getApplication = jest.fn();
api.updateFacility = jest.fn();
api.updateApplication = jest.fn();

const dealId = '123';
const facilityId = '111';

describe('bank-review-date routes', () => {
  beforeEach(async () => {
    await storage.flush();
  });

  afterEach(() => {
    resetAllWhenMocks();
  });

  afterAll(async () => {
    await storage.flush();
  });

  describe('GET /application-details/:dealId/facilities/:facilityId/bank-review-date', () => {
    describe('with a valid facility and deal', () => {
      beforeEach(() => {
        mockGetFacilityReturn({
          isUsingFacilityEndDate: false,
        });
        mockGetApplicationReturn({
          version: 1,
        });
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date`, {}, headers),
        whitelistedRoles: [MAKER],
        successCode: 200,
      });
    });

    it('redirects the user to the application details page if the deal is version 0', async () => {
      // Arrange
      mockGetFacilityReturn({
        isUsingFacilityEndDate: false,
      });
      mockGetApplicationReturn({
        version: 0,
      });

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      const response = await get(
        `/application-details/${dealId}/facilities/${facilityId}/bank-review-date`,
        {},
        {
          Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        },
      );

      // Assert
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
    });

    it('redirects the user to the application details page if version is 1 & isUsingFacilityEndDate is null ', async () => {
      // Arrange
      mockGetFacilityReturn({
        isUsingFacilityEndDate: null,
      });

      mockGetApplicationReturn({
        version: 1,
      });

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      const response = await get(
        `/application-details/${dealId}/facilities/${facilityId}/bank-review-date`,
        {},
        {
          Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        },
      );

      // Assert
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
    });

    it('redirects the user to the application details page if version is 1 & isUsingFacilityEndDate is true', async () => {
      // Arrange
      mockGetFacilityReturn({
        isUsingFacilityEndDate: true,
      });
      mockGetApplicationReturn({
        version: 1,
      });

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      const response = await get(
        `/application-details/${dealId}/facilities/${facilityId}/bank-review-date`,
        {},
        {
          Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        },
      );

      // Assert
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
    });
  });

  describe('POST /application-details/:dealId/facilities/:facilityId/bank-review-date', () => {
    beforeEach(() => {
      mockGetFacilityReturn({
        isUsingFacilityEndDate: null,
        coverStartDate: '2024-07-15T00:00:00.000Z',
      });
    });

    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) =>
        post(
          { 'bank-review-date-year': '2024', 'bank-review-date-month': '8', 'bank-review-date-day': '12' },
          { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        ).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date`),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: {
        location: `/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`,
      },
    });

    it('returns 200 if the request body fails validation', async () => {
      // Arrange
      const body = { 'bank-review-date-year': '2023', 'bank-review-date-month': '8', 'bank-review-date-day': '12' };

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      const response = await post(body, {
        Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        'Content-Type': 'application/x-www-form-urlencoded',
      }).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date`);

      // Assert
      expect(response.status).toBe(200);
    });

    it('returns 200 if the request body fails validation & saveAndReturn = true', async () => {
      // Arrange
      const body = { 'bank-review-date-year': '2023', 'bank-review-date-month': '8', 'bank-review-date-day': '12' };

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      const response = await post(body, {
        Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        'Content-Type': 'application/x-www-form-urlencoded',
      }).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date?saveAndReturn=true`);

      // Assert
      expect(response.status).toBe(200);
    });

    it('redirects to application details page if the bank review date is blank & saveAndReturn = true', async () => {
      // Arrange
      const body = { 'bank-review-date-year': '', 'bank-review-date-month': '', 'bank-review-date-day': '' };

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      const response = await post(body, {
        Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        'Content-Type': 'application/x-www-form-urlencoded',
      }).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date?saveAndReturn=true`);

      // Assert
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
    });

    it('redirects to application details page if the request body is valid & saveAndReturn = true', async () => {
      // Arrange
      const body = { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' };

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      const response = await post(body, {
        Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        'Content-Type': 'application/x-www-form-urlencoded',
      }).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date?saveAndReturn=true`);

      // Assert
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
    });

    it('updates the facility if request body is valid', async () => {
      // Arrange
      const bankReviewDate = new Date(1723417200000);
      const body = {
        'bank-review-date-year': bankReviewDate.getFullYear().toString(),
        'bank-review-date-month': (bankReviewDate.getMonth() + 1).toString,
        'bank-review-date-day': bankReviewDate.getDate().toString(),
      };

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      await post(body, {
        Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        'Content-Type': 'application/x-www-form-urlencoded',
      }).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date?saveAndReturn=true`);

      // Assert
      expect(api.updateFacility).toHaveBeenCalledWith({
        facilityId,
        payload: {
          bankReviewDate,
        },
        userToken: expect.anything(),
      });
    });

    it('updates the application if request body is valid', async () => {
      // Arrange
      const body = { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' };

      // Act
      const { sessionCookie } = await storage.saveUserSession([MAKER]);
      await post(body, {
        Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
        'Content-Type': 'application/x-www-form-urlencoded',
      }).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date?saveAndReturn=true`);

      // Assert
      expect(api.updateApplication).toHaveBeenCalledWith({
        dealId,
        application: {
          editorId: expect.anything(),
        },
        userToken: expect.anything(),
      });
    });
  });
});

function mockGetFacilityReturn(facility) {
  when(api.getFacility).calledWith({ facilityId, userToken: expect.anything() }).mockResolvedValueOnce({ details: facility });
}

function mockGetApplicationReturn(application) {
  when(api.getApplication).calledWith({ dealId, userToken: expect.anything() }).mockResolvedValueOnce(application);
}
