import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { AnyObject, DEAL_STATUS, PORTAL_AMENDMENT_STATUS, ROLES, aPortalSessionUser } from '@ukef/dtfs2-common';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';

const originalEnv = { ...process.env };

const { post } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../server/middleware/csrf', () => ({
  csrfToken: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

const mockUpdateAmendmentStatus = jest.fn();
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getUserDetailsMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockUser = aPortalSessionUser();

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS}`;

const deal = {
  ...MOCK_BASIC_DEAL,
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
};

describe(`POST ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'updateAmendmentStatus').mockImplementation(mockUpdateAmendmentStatus);
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);
    jest.spyOn(api, 'getUserDetails').mockImplementation(getUserDetailsMock);

    const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
      .build();

    mockUpdateAmendmentStatus.mockResolvedValue(amendment);
    getAmendmentMock.mockResolvedValue(amendment);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getApplicationMock.mockResolvedValue(deal);
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
      const response = await postWithSessionCookie({}, sessionCookie);

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
      const response = await postWithSessionCookie({}, sessionCookie);

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
      makeRequestWithHeaders: (headers: Headers) => post({}, headers).to(url),
      whitelistedRoles: [ROLES.MAKER],
      successCode: HttpStatusCode.Found,
    });

    it('should redirect to the next page', async () => {
      // Act
      const response = await postWithSessionCookie({}, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.SUBMITTED_FOR_CHECKING}`,
      );
    });

    it('should render problem with service if updateAmendmentStatus throws an error', async () => {
      // Arrange
      mockUpdateAmendmentStatus.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie({}, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getApplicationMock throws an error', async () => {
      // Arrange
      getApplicationMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie({}, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getFacilityMock throws an error', async () => {
      // Arrange
      getFacilityMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie({}, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getAmendmentMock throws an error', async () => {
      // Arrange
      getAmendmentMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie({}, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });

    it('should render problem with service if getUserDetailsMock throws an error', async () => {
      // Arrange
      getUserDetailsMock.mockRejectedValue(new Error('test error'));

      // Act
      const response = await postWithSessionCookie({}, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
    });
  });
});

function postWithSessionCookie(body: AnyObject, sessionCookie: string) {
  return post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}
