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
  });

  afterAll(async () => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    await storage.flush();
  });

  describe('POST /application-details/:dealId/unissued-facilities/:facilityId/facility-end-date', () => {
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

    const describeCases = [
      {
        postWithHeaders: postFacilityEndDateWithHeaders,
        description: 'when initially issuing the facility',
        successUrl: `/gef/application-details/${dealId}/unissued-facilities`,
      },
      {
        postWithHeaders: postChangeFacilityEndDateWithHeaders,
        description: 'when changing the values',
        successUrl: `/gef/application-details/${dealId}`,
      },
    ];

    describe.each(describeCases)('$description', ({ postWithHeaders, successUrl }) => {
      const postWithBodyAndSessionCookie = ({ body, sessionCookie, saveAndReturn = false }) => {
        return postWithHeaders({
          body,
          headers: {
            Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
          },
          saveAndReturn,
        });
      };

      describe('with saveAndReturn false', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) =>
            postWithHeaders({
              body: { 'facility-end-date-year': '2024', 'facility-end-date-month': '8', 'facility-end-date-day': '12' },
              headers,
            }),
          whitelistedRoles: [MAKER],
          successCode: HttpStatusCode.Found,
          successHeaders: {
            location: successUrl,
          },
        });

        describe('when the user is a maker', () => {
          let sessionCookie;

          beforeEach(async () => {
            ({ sessionCookie } = await storage.saveUserSession([MAKER]));
          });

          it('returns 200 & does not update the database if the request body fails validation', async () => {
            // Arrange
            const body = { 'facility-end-date-year': '2023', 'facility-end-date-month': '8', 'facility-end-date-day': '12' };

            // Act
            const response = await postWithBodyAndSessionCookie({ body, sessionCookie });

            // Assert
            expect(response.status).toBe(HttpStatusCode.Ok);
            expect(api.updateFacility).toHaveBeenCalledTimes(0);
          });

          it('redirects if the request body is valid', async () => {
            // Arrange
            const body = { 'facility-end-date-year': '2024', 'facility-end-date-month': '08', 'facility-end-date-day': '12' };

            // Act
            const response = await postWithBodyAndSessionCookie({ body, sessionCookie });

            // Assert
            expect(response.status).toBe(HttpStatusCode.Found);
            expect(response.headers.location).toBe(successUrl);
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
            await postWithBodyAndSessionCookie({ body, sessionCookie });

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
            await postWithBodyAndSessionCookie({ body, sessionCookie });

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
            postWithHeaders({
              body: { 'facility-end-date-year': '2024', 'facility-end-date-month': '8', 'facility-end-date-day': '12' },
              headers,
              saveAndReturn: true,
            }),
          whitelistedRoles: [MAKER],
          successCode: HttpStatusCode.Found,
          successHeaders: {
            location: successUrl,
          },
        });

        describe('when the user is a maker', () => {
          let sessionCookie;

          beforeEach(async () => {
            ({ sessionCookie } = await storage.saveUserSession([MAKER]));
          });

          it('returns 200 & does not update the database if the request body fails validation', async () => {
            // Arrange
            const body = { 'facility-end-date-year': '2023', 'facility-end-date-month': '8', 'facility-end-date-day': '12' };

            // Act
            const response = await postWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

            // Assert
            expect(response.status).toBe(HttpStatusCode.Ok);
            expect(api.updateFacility).toHaveBeenCalledTimes(0);
          });

          it('redirects if the facility end date is blank', async () => {
            // Arrange
            const body = { 'facility-end-date-year': '', 'facility-end-date-month': '', 'facility-end-date-day': '' };

            // Act
            const response = await postWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

            // Assert
            expect(response.status).toBe(HttpStatusCode.Found);
            expect(response.headers.location).toBe(successUrl);
          });

          it('redirects if the request body is valid', async () => {
            // Arrange
            const body = { 'facility-end-date-year': '2024', 'facility-end-date-month': '08', 'facility-end-date-day': '12' };

            // Act
            const response = await postWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

            // Assert
            expect(response.status).toBe(HttpStatusCode.Found);
            expect(response.headers.location).toBe(successUrl);
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
            await postWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

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
            await postWithBodyAndSessionCookie({ body, sessionCookie, saveAndReturn: true });

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
});

function postFacilityEndDateWithHeaders({ body, headers, saveAndReturn = false }) {
  return post(body, headers).to(
    `/application-details/${dealId}/unissued-facilities/${facilityId}/facility-end-date${saveAndReturn ? '?saveAndReturn=true' : ''}`,
  );
}

function postChangeFacilityEndDateWithHeaders({ body, headers, saveAndReturn = false }) {
  return post(body, headers).to(
    `/application-details/${dealId}/unissued-facilities/${facilityId}/facility-end-date/change${saveAndReturn ? '?saveAndReturn=true' : ''}`,
  );
}
