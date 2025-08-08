import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { add, format, startOfDay } from 'date-fns';
import { HttpStatusCode } from 'axios';
import { AnyObject, DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES, MOCK_TFM_FACILITY } from '@ukef/dtfs2-common';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';

const originalEnv = { ...process.env };

const { post } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../server/middleware/csrf', () => ({
  csrfToken: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

const mockGetFacility = jest.fn();
const mockGetApplication = jest.fn();
const mockGetAmendment = jest.fn();
const mockUpdateAmendment = jest.fn();
const mockGetTfmFacility = jest.fn();
const mockGetLatestAmendmentFacilityValueAndCoverEndDate = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

const todayPlusTwoYears = startOfDay(add(new Date(), { years: 2 }));

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.COVER_END_DATE}`;

const getLatestAmendmentFacilityValueAndCoverEndDateResponse = {
  coverEndDate: '2024-12-31T00:00:00.000Z',
  value: '1000000',
};

describe(`POST ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'getFacility').mockImplementation(mockGetFacility);
    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    jest.spyOn(api, 'getAmendment').mockImplementation(mockGetAmendment);
    jest.spyOn(api, 'updateAmendment').mockImplementation(mockUpdateAmendment);
    jest.spyOn(api, 'getTfmFacility').mockImplementation(mockGetTfmFacility);
    jest.spyOn(console, 'error');
    jest.spyOn(api, 'getLatestAmendmentFacilityValueAndCoverEndDate').mockImplementation(mockGetLatestAmendmentFacilityValueAndCoverEndDate);

    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .build();
    mockGetFacility.mockResolvedValue(MOCK_ISSUED_FACILITY);
    mockGetApplication.mockResolvedValue(mockDeal);
    mockGetAmendment.mockResolvedValue(amendment);
    mockUpdateAmendment.mockResolvedValue(amendment);
    mockGetTfmFacility.mockResolvedValue(MOCK_TFM_FACILITY);
    mockGetLatestAmendmentFacilityValueAndCoverEndDate.mockResolvedValue(getLatestAmendmentFacilityValueAndCoverEndDateResponse);
  });

  afterAll(async () => {
    jest.resetAllMocks();
    await storage.flush();
    process.env = originalEnv;
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled', () => {
    beforeEach(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is not set', () => {
    beforeEach(() => {
      delete process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED;
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
    beforeEach(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
    });

    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers: Headers) =>
        post(
          {
            'cover-end-date-day': format(todayPlusTwoYears, 'd'),
            'cover-end-date-month': format(todayPlusTwoYears, 'M'),
            'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
          },
          headers,
        ).to(url),
      whitelistedRoles: [ROLES.MAKER],
      successCode: HttpStatusCode.Found,
    });

    it('should redirect to /not-found when facility not found', async () => {
      // Arrange
      mockGetFacility.mockResolvedValue({ details: undefined });

      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when amendment not found', async () => {
      // Arrange
      mockGetAmendment.mockResolvedValue(undefined);

      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when deal not found', async () => {
      // Arrange
      mockGetApplication.mockResolvedValue(undefined);

      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should not call console.error if the facility and amendment are valid', async () => {
      // Arrange
      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should render cover end date page with errors if cover end date is invalid', async () => {
      // Arrange
      const body = { 'cover-end-date-day': '1000', 'cover-end-date-month': '100', 'cover-end-date-year': '100' };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Cover end date');
      expect(response.text).toContain('Cover end date must be a real date');
    });

    it('should redirect to the next page if the cover end date is valid', async () => {
      // Arrange
      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE}`,
      );
    });

    it('should render problem with service if getApplication throws an error', async () => {
      // Arrange
      mockGetApplication.mockRejectedValue(new Error('test error'));

      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getFacility throws an error', async () => {
      // Arrange
      mockGetFacility.mockRejectedValue(new Error('test error'));

      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if updateAmendment throws an error', async () => {
      // Arrange
      mockUpdateAmendment.mockRejectedValue(new Error('test error'));

      const body = {
        'cover-end-date-day': format(todayPlusTwoYears, 'd'),
        'cover-end-date-month': format(todayPlusTwoYears, 'M'),
        'cover-end-date-year': format(todayPlusTwoYears, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });
  });
});

function postWithSessionCookie(body: AnyObject, sessionCookie: string) {
  return post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}
