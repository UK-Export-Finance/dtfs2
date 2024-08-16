jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/middleware/csrf', () => ({
  ...jest.requireActual('../../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));

const { HttpStatusCode } = require('axios');
const { when, resetAllWhenMocks } = require('jest-when');
const { MAKER } = require('../../server/constants/roles');
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { post } = require('../create-api').createApi(app);
const api = require('../../server/services/api');
const storage = require('../test-helpers/storage/storage');

api.getFacility = jest.fn();
api.updateFacility = jest.fn();
api.updateApplication = jest.fn();

const dealId = '123';
const facilityId = '111';

describe('facility end date routes', () => {
  beforeEach(async () => {
    resetAllWhenMocks();
    await storage.flush();
    jest.clearAllMocks();

    when(api.getFacility)
      .calledWith({ facilityId, userToken: expect.anything() })
      .mockResolvedValueOnce({
        details: {
          isUsingFacilityEndDate: true,
          coverStartDate: '2024-07-15T00:00:00.000Z',
        },
      });
  });

  afterAll(async () => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    await storage.flush();
  });

  const describeCases = [
    {
      url: `/application-details/${dealId}/unissued-facilities/${facilityId}/facility-end-date`,
      description: 'POST /application-details/:dealId/unissued-facilities/:facilityId/facility-end-date',
      nextPageUrl: `/gef/application-details/${dealId}/unissued-facilities`,
    },
    {
      url: `/application-details/${dealId}/unissued-facilities/${facilityId}/facility-end-date/change`,
      description: 'POST /application-details/:dealId/unissued-facilities/:facilityId/facility-end-date/change',
      nextPageUrl: `/gef/application-details/${dealId}`,
    },
  ];

  describe.each(describeCases)('$description', ({ url, nextPageUrl }) => {
    describe('with saveAndReturn false', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) =>
          post({ 'facility-end-date-year': '2024', 'facility-end-date-month': '8', 'facility-end-date-day': '12' }, headers).to(url),
        whitelistedRoles: [MAKER],
        successCode: HttpStatusCode.Found,
        successHeaders: {
          location: nextPageUrl,
        },
      });

      describe('when the user is a maker', () => {
        let sessionCookie;
        const makeRequest = (body) => post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);

        beforeEach(async () => {
          ({ sessionCookie } = await storage.saveUserSession([MAKER]));
        });

        it('returns 200 & does not update the database if the request body fails validation', async () => {
          // Arrange
          const body = { 'facility-end-date-year': '2023', 'facility-end-date-month': '8', 'facility-end-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Ok);
          expect(api.updateFacility).toHaveBeenCalledTimes(0);
        });

        it('redirects if the request body is valid', async () => {
          // Arrange
          const body = { 'facility-end-date-year': '2024', 'facility-end-date-month': '08', 'facility-end-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(nextPageUrl);
        });

        it('updates the facility if request body is valid', async () => {
          // Arrange
          const facilityEndDate = new Date(1723417200000);
          const body = {
            'facility-end-date-year': facilityEndDate.getFullYear().toString(),
            'facility-end-date-month': (facilityEndDate.getMonth() + 1).toString(),
            'facility-end-date-day': facilityEndDate.getDate().toString(),
          };

          // Act
          await makeRequest(body);

          // Assert
          expect(api.updateFacility).toHaveBeenCalledWith({
            facilityId,
            payload: {
              facilityEndDate,
            },
            userToken: expect.anything(),
          });
        });

        it('updates the application if request body is valid', async () => {
          // Arrange
          const body = { 'facility-end-date-year': '2024', 'facility-end-date-month': '08', 'facility-end-date-day': '12' };

          // Act
          await makeRequest(body);

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

    describe('with saveAndReturn true', () => {
      const saveAndReturnUrl = `${url}?saveAndReturn=true`;
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) =>
          post({ 'facility-end-date-year': '2024', 'facility-end-date-month': '8', 'facility-end-date-day': '12' }, headers).to(saveAndReturnUrl),
        whitelistedRoles: [MAKER],
        successCode: HttpStatusCode.Found,
        successHeaders: {
          location: nextPageUrl,
        },
      });

      describe('when the user is a maker', () => {
        let sessionCookie;
        const makeRequest = (body) => post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(saveAndReturnUrl);

        beforeEach(async () => {
          ({ sessionCookie } = await storage.saveUserSession([MAKER]));
        });

        it('returns 200 & does not update the database if the request body fails validation', async () => {
          // Arrange
          const body = { 'facility-end-date-year': '2023', 'facility-end-date-month': '8', 'facility-end-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Ok);
          expect(api.updateFacility).toHaveBeenCalledTimes(0);
        });

        it('redirects if the facility end date is blank', async () => {
          // Arrange
          const body = { 'facility-end-date-year': '', 'facility-end-date-month': '', 'facility-end-date-day': '' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(nextPageUrl);
        });

        it('redirects if the request body is valid', async () => {
          // Arrange
          const body = { 'facility-end-date-year': '2024', 'facility-end-date-month': '08', 'facility-end-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(nextPageUrl);
        });

        it('updates the facility if request body is valid', async () => {
          // Arrange
          const facilityEndDate = new Date(1723417200000);
          const body = {
            'facility-end-date-year': facilityEndDate.getFullYear().toString(),
            'facility-end-date-month': (facilityEndDate.getMonth() + 1).toString(),
            'facility-end-date-day': facilityEndDate.getDate().toString(),
          };

          // Act
          await makeRequest(body);

          // Assert
          expect(api.updateFacility).toHaveBeenCalledWith({
            facilityId,
            payload: {
              facilityEndDate,
            },
            userToken: expect.anything(),
          });
        });

        it('updates the application if request body is valid', async () => {
          // Arrange
          const body = { 'facility-end-date-year': '2024', 'facility-end-date-month': '08', 'facility-end-date-day': '12' };

          // Act
          await makeRequest(body);

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
  });
});
