import { Headers } from 'node-mocks-http';
import { Request, Response, NextFunction } from 'express';
import * as libs from '@ukef/dtfs2-common';
import { AnyObject, DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';

const originalEnv = { ...process.env };

const { post } = createApi(app);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  verify: jest.fn((req: Request, res: Response, next: NextFunction): void => next()),
}));

const mockGetFacility = jest.fn();
const mockGetApplication = jest.fn();
const mockUpdateAmendment = jest.fn();
const mockGetAmendment = jest.fn();

const aMockError = () => new Error();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE}`;

describe(`POST ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.clearAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'getFacility').mockImplementation(mockGetFacility);
    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    jest.spyOn(api, 'getAmendment').mockImplementation(mockGetAmendment);
    jest.spyOn(api, 'updateAmendment').mockImplementation(mockUpdateAmendment);

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
  });

  afterAll(async () => {
    jest.resetAllMocks();
    await storage.flush();
    process.env = originalEnv;
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED feature flag is disabled', () => {
    beforeEach(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
    });

    it('should redirect to /not-found', async () => {
      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED feature flag is not set', () => {
    beforeEach(() => {
      delete process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED;
    });

    it('should redirect to /not-found', async () => {
      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, sessionCookie);

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
      makeRequestWithHeaders: (headers: Headers) => post({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, headers).to(url),
      whitelistedRoles: [ROLES.MAKER],
      successCode: HttpStatusCode.Found,
    });

    it('should redirect to /not-found when facility not found', async () => {
      // Arrange
      mockGetFacility.mockResolvedValue({ details: undefined });

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when deal not found', async () => {
      // Arrange
      mockGetApplication.mockResolvedValue(undefined);

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should render facility value page with errors if isUsingFacilityEndDate is invalid', async () => {
      // Arrange
      const isUsingFacilityEndDate = '';

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Do you have a facility end date?');
      expect(response.text).toContain('Select if there is an end date for this facility');
    });

    it('should redirect to facility end date page if isUsingFacilityEndDate is "true"', async () => {
      // Arrange
      const isUsingFacilityEndDate = 'true';
      mockUpdateAmendment.mockResolvedValue(
        new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withDealId(dealId)
          .withFacilityId(facilityId)
          .withAmendmentId(amendmentId)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(true)
          .build(),
      );

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE}`,
      );
    });

    it('should redirect to bank review date page if isUsingFacilityEndDate is "false"', async () => {
      // Arrange
      const isUsingFacilityEndDate = 'false';
      mockUpdateAmendment.mockResolvedValue(
        new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withDealId(dealId)
          .withFacilityId(facilityId)
          .withAmendmentId(amendmentId)
          .withChangeCoverEndDate(true)
          .withIsUsingFacilityEndDate(false)
          .build(),
      );

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE}`,
      );
    });

    it('should render problem with service if getApplication throws an error', async () => {
      // Arrange
      mockGetApplication.mockRejectedValue(aMockError());

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getFacility throws an error', async () => {
      // Arrange
      mockGetFacility.mockRejectedValue(aMockError());

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if updateAmendment throws an error', async () => {
      // Arrange
      mockUpdateAmendment.mockRejectedValue(aMockError());

      // Act
      const response = await postWithSessionCookie({ isUsingFacilityEndDate: 'true', previousPage: 'previousPage' }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });
  });
});

function postWithSessionCookie(body: AnyObject, sessionCookie: string) {
  return post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}
