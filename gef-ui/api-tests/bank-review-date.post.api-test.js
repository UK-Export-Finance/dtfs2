jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));

const { HttpStatusCode } = require('axios');
const { when, resetAllWhenMocks } = require('jest-when');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { post } = require('./create-api').createApi(app);
const api = require('../server/services/api');
const storage = require('./test-helpers/storage/storage');

api.getFacility = jest.fn();
api.updateFacility = jest.fn();
api.updateApplication = jest.fn();

const dealId = '123';
const facilityId = '111';

describe('bank review date routes', () => {
  beforeEach(async () => {
    resetAllWhenMocks();
    await storage.flush();
    jest.clearAllMocks();

    when(api.getFacility)
      .calledWith({ facilityId, userToken: expect.anything() })
      .mockResolvedValueOnce({
        details: {
          _id: facilityId,
          dealId,
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
      url: `/application-details/${dealId}/unissued-facilities/${facilityId}/bank-review-date`,
      description: 'POST /application-details/:dealId/unissued-facilities/:facilityId/bank-review-date',
      nextPageUrl: `/gef/application-details/${dealId}/unissued-facilities`,
      saveAndReturnRedirectUrl: `/gef/application-details/${dealId}/unissued-facilities`,
    },
    {
      url: `/application-details/${dealId}/unissued-facilities/${facilityId}/bank-review-date/change`,
      description: 'POST /application-details/:dealId/unissued-facilities/:facilityId/bank-review-date/change',
      nextPageUrl: `/gef/application-details/${dealId}`,
      saveAndReturnRedirectUrl: `/gef/application-details/${dealId}`,
    },
    {
      url: `/application-details/${dealId}/facilities/${facilityId}/bank-review-date`,
      description: 'POST /application-details/:dealId/facilities/:facilityId/bank-review-date',
      nextPageUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`,
      saveAndReturnRedirectUrl: `/gef/application-details/${dealId}`,
    },
  ];

  describe.each(describeCases)('$description', ({ url, nextPageUrl, saveAndReturnRedirectUrl }) => {
    describe('with saveAndReturn false', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) =>
          post({ 'bank-review-date-year': '2024', 'bank-review-date-month': '8', 'bank-review-date-day': '12' }, headers).to(url),
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
          const body = { 'bank-review-date-year': '2023', 'bank-review-date-month': '8', 'bank-review-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Ok);
          expect(api.updateFacility).toHaveBeenCalledTimes(0);
        });

        it('redirects if the request body is valid', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(nextPageUrl);
        });

        it('updates the facility if request body is valid', async () => {
          // Arrange
          const bankReviewDate = new Date(1723417200000);
          const body = {
            'bank-review-date-year': bankReviewDate.getFullYear().toString(),
            'bank-review-date-month': (bankReviewDate.getMonth() + 1).toString(),
            'bank-review-date-day': bankReviewDate.getDate().toString(),
          };

          // Act
          await makeRequest(body);

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
          post({ 'bank-review-date-year': '2024', 'bank-review-date-month': '8', 'bank-review-date-day': '12' }, headers).to(saveAndReturnUrl),
        whitelistedRoles: [MAKER],
        successCode: HttpStatusCode.Found,
        successHeaders: {
          location: saveAndReturnRedirectUrl,
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
          const body = { 'bank-review-date-year': '2023', 'bank-review-date-month': '8', 'bank-review-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Ok);
          expect(api.updateFacility).toHaveBeenCalledTimes(0);
        });

        it('redirects if the bank review date is blank and does not update the database', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '', 'bank-review-date-month': '', 'bank-review-date-day': '' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(saveAndReturnRedirectUrl);

          expect(api.updateFacility).toHaveBeenCalledTimes(0);
        });

        it('redirects if the request body is valid', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' };

          // Act
          const response = await makeRequest(body);

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(saveAndReturnRedirectUrl);
        });

        it('updates the facility if request body is valid', async () => {
          // Arrange
          const bankReviewDate = new Date(1723417200000);
          const body = {
            'bank-review-date-year': bankReviewDate.getFullYear().toString(),
            'bank-review-date-month': (bankReviewDate.getMonth() + 1).toString(),
            'bank-review-date-day': bankReviewDate.getDate().toString(),
          };

          // Act
          await makeRequest(body);

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
