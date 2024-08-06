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
api.getApplication = jest.fn();
api.updateFacility = jest.fn();
api.updateApplication = jest.fn();

const dealId = '123';
const facilityId = '111';

describe('bank review date routes', () => {
  beforeEach(async () => {
    resetAllWhenMocks();
    await storage.flush();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    await storage.flush();
  });

  describe('POST /application-details/:dealId/facilities/:facilityId/bank-review-date', () => {
    beforeEach(() => {
      when(api.getFacility)
        .calledWith({ facilityId, userToken: expect.anything() })
        .mockResolvedValueOnce({
          details: {
            isUsingFacilityEndDate: null,
            coverStartDate: '2024-07-15T00:00:00.000Z',
          },
        });
    });

    describe('with saveAndReturn false', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) =>
          postBankReviewDateWithHeaders({ body: { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' }, headers }),
        whitelistedRoles: [MAKER],
        successCode: HttpStatusCode.Found,
        successHeaders: {
          location: `/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`,
        },
      });

      describe('when the user is a maker', () => {
        let sessionCookie;

        beforeEach(async () => {
          ({ sessionCookie } = await storage.saveUserSession([MAKER]));
        });

        it('returns 200 & does not update the database if the request body fails validation', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '2023', 'bank-review-date-month': '8', 'bank-review-date-day': '12' };

          // Act
          const response = await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie });

          // Assert
          expect(response.status).toBe(HttpStatusCode.Ok);
          expect(api.updateFacility).toHaveBeenCalledTimes(0);
        });

        it('redirects to provided facility page if the request body is valid', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' };

          // Act
          const response = await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie });

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(`/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`);
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
          await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie });

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
          await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie });

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
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) =>
          postBankReviewDateWithHeaders({
            body: { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' },
            headers,
            saveAndReturn: true,
          }),
        whitelistedRoles: [MAKER],
        successCode: HttpStatusCode.Found,
        successHeaders: {
          location: `/gef/application-details/${dealId}`,
        },
      });

      describe('when the user is a maker', () => {
        let sessionCookie;

        beforeEach(async () => {
          ({ sessionCookie } = await storage.saveUserSession([MAKER]));
        });

        it('returns 200 & does not update the database if the request body fails validation', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '2023', 'bank-review-date-month': '8', 'bank-review-date-day': '12' };

          // Act
          const response = await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

          // Assert
          expect(response.status).toBe(HttpStatusCode.Ok);
          expect(api.updateFacility).toHaveBeenCalledTimes(0);
        });

        it('redirects to application details page if the bank review date is blank', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '', 'bank-review-date-month': '', 'bank-review-date-day': '' };

          // Act
          const response = await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
        });

        it('redirects to application details page if the request body is valid', async () => {
          // Arrange
          const body = { 'bank-review-date-year': '2024', 'bank-review-date-month': '08', 'bank-review-date-day': '12' };

          // Act
          const response = await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

          // Assert
          expect(response.status).toBe(HttpStatusCode.Found);
          expect(response.headers.location).toBe(`/gef/application-details/${dealId}`);
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
          await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

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
          await postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

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

function postBankReviewDateWithHeaders({ body, headers, saveAndReturn = false }) {
  return post(body, headers).to(`/application-details/${dealId}/facilities/${facilityId}/bank-review-date${saveAndReturn ? '?saveAndReturn=true' : ''}`);
}

function postBankReviewDateWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn = false }) {
  return postBankReviewDateWithHeaders({
    body,
    headers: {
      Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
    },
    saveAndReturn,
  });
}
