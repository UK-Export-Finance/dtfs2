import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { format, getUnixTime, startOfDay } from 'date-fns';
import { HttpStatusCode } from 'axios';
import { AnyObject, DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
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

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

const today = startOfDay(new Date());

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE}`;

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

    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withEffectiveDate(getUnixTime(today))
      .build();
    mockGetFacility.mockResolvedValue(MOCK_ISSUED_FACILITY);
    mockGetApplication.mockResolvedValue(mockDeal);
    mockGetAmendment.mockResolvedValue(amendment);
    mockUpdateAmendment.mockResolvedValue(amendment);
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
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
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
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
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
            'effective-date-day': format(today, 'd'),
            'effective-date-month': format(today, 'M'),
            'effective-date-year': format(today, 'yyyy'),
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
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
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
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
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
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should render date amendment effective date page with errors if effective date is invalid', async () => {
      // Arrange
      const body = { 'effective-date-day': '1000', 'effective-date-month': '100', 'effective-date-year': '100' };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Date amendment effective from');
      expect(response.text).toContain('Date amendment effective from must be a real date');
    });

    it('should render date amendment effective date page with errors if effective date is not provided', async () => {
      // Arrange
      const body = { 'effective-date-day': '', 'effective-date-month': '', 'effective-date-year': '' };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Date amendment effective from');
      expect(response.text).toContain('Enter the date amendment effective from');
    });

    it('should redirect to the next page if the effective date is valid', async () => {
      // Arrange
      const body = {
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS}`,
      );
    });

    it('should render `problem with service` if getApplication throws an error', async () => {
      // Arrange
      mockGetApplication.mockRejectedValue(new Error('test error'));

      const body = {
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render `problem with service` if getFacility throws an error', async () => {
      // Arrange
      mockGetFacility.mockRejectedValue(new Error('test error'));

      const body = {
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
      };

      // Act
      const response = await postWithSessionCookie(body, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render `problem with service` if updateAmendment throws an error', async () => {
      // Arrange
      mockUpdateAmendment.mockRejectedValue(new Error('test error'));

      const body = {
        'effective-date-day': format(today, 'd'),
        'effective-date-month': format(today, 'M'),
        'effective-date-year': format(today, 'yyyy'),
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
