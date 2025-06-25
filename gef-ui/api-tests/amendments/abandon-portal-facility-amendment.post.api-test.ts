import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ROLES, API_ERROR_CODE, PORTAL_AMENDMENT_STATUS, DEAL_STATUS, DEAL_SUBMISSION_TYPE, aPortalSessionUser } from '@ukef/dtfs2-common';
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

const deleteAmendmentMock = jest.fn();
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getUserDetailsMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };
const validUrl = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.ABANDON}`;
const mockUser = aPortalSessionUser();

describe(`POST ${validUrl}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);
    jest.spyOn(api, 'getUserDetails').mockImplementation(getUserDetailsMock);
    jest.spyOn(api, 'deleteAmendment').mockImplementation(deleteAmendmentMock);
    jest.spyOn(console, 'error');

    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
      .build();

    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getApplicationMock.mockResolvedValue(mockDeal);
    getAmendmentMock.mockResolvedValue(amendment);
    getUserDetailsMock.mockResolvedValue(mockUser);
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
      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

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
      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

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
      makeRequestWithHeaders: (headers: Headers) => post(headers).to(validUrl),
      whitelistedRoles: [ROLES.MAKER],
      successCode: HttpStatusCode.Found,
    });

    it(`should return ${HttpStatusCode.BadRequest} when the facility id is invalid`, async () => {
      const invalidFacilityId = 'InvalidId';

      const invalidUrl = `/application-details/${dealId}/facilities/${invalidFacilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.CANCEL}`;
      const response = await postWithSessionCookie(sessionCookie, invalidUrl);
      expect(response.status).toEqual(HttpStatusCode.BadRequest);

      expect(response.body).toEqual({
        message: "Expected path parameter 'facilityId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it(`should return ${HttpStatusCode.BadRequest} when the amendment id is invalid`, async () => {
      const invalidAmendmentId = 'InvalidId';

      const invalidUrl = `/application-details/${dealId}/facilities/${facilityId}/amendments/${invalidAmendmentId}/${PORTAL_AMENDMENT_PAGES.CANCEL}`;
      const response = await postWithSessionCookie(sessionCookie, invalidUrl);
      expect(response.status).toEqual(HttpStatusCode.BadRequest);

      expect(response.body).toEqual({
        message: "Expected path parameter 'amendmentId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it('should not call console.error if the facility and amendment are valid', async () => {
      // Act
      await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should render the amendment has been abandoned template', async () => {
      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Amendment has been abandoned');
    });

    it('should render problem with service if getApplication throws an error', async () => {
      // Arrange
      getApplicationMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(getApplicationMock).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getFacility throws an error', async () => {
      // Arrange
      getFacilityMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(getFacilityMock).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getAmendment throws an error', async () => {
      // Arrange
      getAmendmentMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(getAmendmentMock).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if deleteAmendment throws an error', async () => {
      // Arrange
      deleteAmendmentMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });
  });
});

function postWithSessionCookie(sessionCookie: string, url: string) {
  return post({}, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}
