import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ROLES, API_ERROR_CODE } from '@ukef/dtfs2-common';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';

const originalEnv = { ...process.env };

const { post } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../server/middleware/csrf', () => ({
  csrfToken: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

const mockDeleteAmendment = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const validUrl = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.ABANDON}`;

describe(`POST ${validUrl}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'deleteAmendment').mockImplementation(mockDeleteAmendment);
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
      expect(mockDeleteAmendment).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Amendment has been abandoned');
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
