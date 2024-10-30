jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));

const { when, resetAllWhenMocks } = require('jest-when');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);
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
  });

  afterAll(async () => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    await storage.flush();
  });

  const describeCases = [
    {
      url: `/application-details/${dealId}/unissued-facilities/${facilityId}/bank-review-date`,
      description: 'GET /application-details/:dealId/unissued-facilities/:facilityId/bank-review-date',
      previousPageUrl: `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/about`,
    },
    {
      url: `/application-details/${dealId}/unissued-facilities/${facilityId}/bank-review-date/change`,
      description: 'GET /application-details/:dealId/unissued-facilities/:facilityId/bank-review-date/change',
      previousPageUrl: `/gef/application-details/${dealId}/unissued-facilities/${facilityId}/change`,
    },
    {
      url: `/application-details/${dealId}/facilities/${facilityId}/bank-review-date`,
      description: 'GET /application-details/:dealId/facilities/:facilityId/bank-review-date',
      previousPageUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/about-facility`,
    },
  ];

  describe.each(describeCases)('$description', ({ url, previousPageUrl }) => {
    describe('with deal version 1 and not using facility end date', () => {
      beforeEach(() => {
        mockIsUsingFacilityEndDate(false);
        mockDealVersion(1);
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(url, {}, headers),
        whitelistedRoles: [MAKER],
        successCode: 200,
      });
    });

    describe('when the user is a maker', () => {
      let sessionCookie;
      beforeEach(async () => {
        ({ sessionCookie } = await storage.saveUserSession([MAKER]));
      });

      it('returns 200 when the deal is version 1 and facility is not using facility end date', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(false);
        mockDealVersion(1);

        // Act
        const response = await getWithSessionCookie(url, sessionCookie);

        // Assert
        expect(response.status).toEqual(200);
      });

      it('redirects the user to the previous page if the deal is version 0', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(false);
        mockDealVersion(0);

        // Act
        const response = await getWithSessionCookie(url, sessionCookie);

        // Assert
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual(previousPageUrl);
      });

      it('redirects the user to the previous page if version is 1 & isUsingFacilityEndDate is null', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(null);
        mockDealVersion(1);

        // Act
        const response = await getWithSessionCookie(url, sessionCookie);

        // Assert
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual(previousPageUrl);
      });

      it('redirects the user to the previous page if version is 1 & isUsingFacilityEndDate is true', async () => {
        // Arrange
        mockIsUsingFacilityEndDate(true);
        mockDealVersion(1);

        // Act
        const response = await getWithSessionCookie(url, sessionCookie);

        // Assert
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual(previousPageUrl);
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

function getWithSessionCookie(url, sessionCookie) {
  return get(
    url,
    {},
    {
      Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
    },
  );
}
