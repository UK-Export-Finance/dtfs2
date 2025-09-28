import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { AnyObject, DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';
import { MOCK_PIM_TEAM } from '../../server/utils/mocks/mock-tfm-teams.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment.ts';

const originalEnv = { ...process.env };

const { post } = createApi(app);


jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

const mockGetFacility = jest.fn();
const mockGetApplication = jest.fn();
const mockGetAmendment = jest.fn();
const mockUpdateAmendment = jest.fn();
const mockGetTfmTeam = jest.fn();
console.error = jest.fn();

const validBody = { amendmentOptions: ['changeFacilityValue'] };
const invalidBody = { amendmentOptions: [] };
const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';
const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };
const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`;

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
    jest.spyOn(api, 'getTfmTeam').mockImplementation(mockGetTfmTeam);

    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(false)
      .withChangeFacilityValue(true)
      .build();
    mockGetFacility.mockResolvedValue(MOCK_ISSUED_FACILITY);
    mockGetApplication.mockResolvedValue(mockDeal);
    mockGetAmendment.mockResolvedValue(amendment);
    mockUpdateAmendment.mockResolvedValue(amendment);
    mockGetTfmTeam.mockResolvedValue(MOCK_PIM_TEAM);
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
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/not-found');
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED feature flag is not set', () => {
    beforeEach(() => {
      delete process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED;
    });

    it('should redirect to /not-found', async () => {
      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/not-found');
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED feature flag is enabled', () => {
    beforeEach(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
    });

    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers: Headers) => post(validBody, headers).to(url),
      whitelistedRoles: [ROLES.MAKER],
      successCode: HttpStatusCode.Found,
    });

    it('should redirect to /not-found when facility not found', async () => {
      // Arrange
      mockGetFacility.mockResolvedValue({ details: undefined });

      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when amendment not found', async () => {
      // Arrange
      mockGetAmendment.mockResolvedValue(undefined);

      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when deal not found', async () => {
      // Arrange
      mockGetApplication.mockResolvedValue(undefined);

      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should render the page with errors if the selected options are invalid', async () => {
      // Act
      const response = await postWithSessionCookie(invalidBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('What do you need to change?');
      expect(response.text).toContain('Select if you need to change the facility cover end date, value or both');
    });

    it('should redirect to facility value page if just facility value is selected', async () => {
      // Act
      const changeFacilityValueSelection = { amendmentOptions: ['changeFacilityValue'] };
      const response = await postWithSessionCookie(changeFacilityValueSelection, sessionCookie);

      mockUpdateAmendment.mockResolvedValueOnce(
        new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withDealId(dealId)
          .withFacilityId(facilityId)
          .withAmendmentId(amendmentId)
          .withChangeCoverEndDate(false)
          .withChangeFacilityValue(true)
          .build(),
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.FACILITY_VALUE}`,
      );
    });

    it('should redirect to the cover end date page if just cover end date is selected', async () => {
      // Act
      const changeCoverEndDateSelection = { amendmentOptions: ['changeCoverEndDate'] };
      mockUpdateAmendment.mockResolvedValueOnce(
        new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withDealId(dealId)
          .withFacilityId(facilityId)
          .withAmendmentId(amendmentId)
          .withChangeCoverEndDate(true)
          .withChangeFacilityValue(false)
          .build(),
      );
      const response = await postWithSessionCookie(changeCoverEndDateSelection, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.COVER_END_DATE}`,
      );
    });

    it('should redirect to the cover end date page if both options are selected', async () => {
      // Act
      const changeBothSelection = { amendmentOptions: ['changeFacilityValue', 'changeCoverEndDate'] };
      mockUpdateAmendment.mockResolvedValueOnce(
        new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withDealId(dealId)
          .withFacilityId(facilityId)
          .withAmendmentId(amendmentId)
          .withChangeCoverEndDate(true)
          .withChangeFacilityValue(true)
          .build(),
      );

      const response = await postWithSessionCookie(changeBothSelection, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.COVER_END_DATE}`,
      );
    });

    it('should render problem with service if getApplication throws an error', async () => {
      // Arrange
      mockGetApplication.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getFacility throws an error', async () => {
      // Arrange
      mockGetFacility.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getTfmTeam throws an error', async () => {
      // Arrange
      mockGetTfmTeam.mockRejectedValue(new Error('Invalid team'));

      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
      expect(console.error).toHaveBeenCalledWith('Error posting amendments what needs to change page %o', new Error('Invalid team'));
    });

    it('should render problem with service if updateAmendment throws an error', async () => {
      // Arrange
      mockUpdateAmendment.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(validBody, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });
  });
});

function postWithSessionCookie(body: AnyObject, sessionCookie: string) {
  return post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}
