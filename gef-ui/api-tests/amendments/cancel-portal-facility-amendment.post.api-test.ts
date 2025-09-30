import { Headers } from 'node-mocks-http';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { ROLES, API_ERROR_CODE } from '@ukef/dtfs2-common';
import * as libs from '@ukef/dtfs2-common';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { MOCK_AIN_APPLICATION } from '../../server/utils/mocks/mock-applications';

const originalEnv = { ...process.env };

const { post } = createApi(app);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  verify: jest.fn((req: Request, res: Response, next: NextFunction): void => next()),
}));

const mockDeleteAmendment = jest.fn();
const mockGetApplication = jest.fn();
const mockGetAmendment = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const validUrl = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.CANCEL}`;

describe(`POST ${validUrl}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.clearAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'deleteAmendment').mockImplementation(mockDeleteAmendment);
    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    jest.spyOn(api, 'getAmendment').mockImplementation(mockGetAmendment);

    mockGetApplication.mockResolvedValue(MOCK_AIN_APPLICATION);
    mockGetAmendment.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build(),
    );

    jest.spyOn(console, 'error');
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

    it(`should return ${HttpStatusCode.BadRequest} when the deal id is invalid`, async () => {
      const invalidDealId = 'InvalidId';

      const invalidUrl = `/application-details/${invalidDealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.CANCEL}`;
      const response = await postWithSessionCookie(sessionCookie, invalidUrl);
      expect(response.status).toEqual(HttpStatusCode.BadRequest);

      expect(response.body).toEqual({
        message: "Expected path parameter 'dealId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
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

    it('should redirect to the applications details page, after the amendment has been deleted successfully', async () => {
      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(mockDeleteAmendment).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(`/gef/application-details/${dealId}`);
    });

    it('should render problem with service if getAmendment throws an error', async () => {
      // Arrange
      mockGetAmendment.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(mockGetAmendment).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if deleteAmendment throws an error', async () => {
      // Arrange
      mockDeleteAmendment.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie(sessionCookie, validUrl);

      // Assert
      expect(mockDeleteAmendment).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });
  });
});

function postWithSessionCookie(sessionCookie: string, url: string) {
  return post({}, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}
