import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY, MOCK_UNISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { withGetAmendmentPageErrorHandlingTests } from './with-get-amendment-page-error-handling.api-tests';

const originalEnv = { ...process.env };

const { get } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../server/middleware/csrf', () => ({
  csrfToken: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

const mockGetFacility = jest.fn();
const mockGetApplication = jest.fn();
const mockGetAmendment = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.FACILITY_VALUE}`;

describe(`GET ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'getFacility').mockImplementation(mockGetFacility);
    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    jest.spyOn(api, 'getAmendment').mockImplementation(mockGetAmendment);

    mockGetFacility.mockResolvedValue(MOCK_ISSUED_FACILITY);
    mockGetApplication.mockResolvedValue(mockDeal);
    mockGetAmendment.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withChangeFacilityValue(true)
        .build(),
    );
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
      const response = await getWithSessionCookie(sessionCookie);

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
      makeRequestWithHeaders: (headers: Headers) => get(url, {}, headers),
      whitelistedRoles: [ROLES.MAKER],
      successCode: HttpStatusCode.Ok,
    });

    withGetAmendmentPageErrorHandlingTests({
      makeRequest: () => getWithSessionCookie(sessionCookie),
      mockGetAmendment,
      mockGetApplication,
      mockGetFacility,
    });

    it('should render `New facility value` page', async () => {
      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('New facility value');
    });

    it('should redirect to deal summary page when facility cannot be amended', async () => {
      // Arrange
      mockGetFacility.mockResolvedValue(MOCK_UNISSUED_FACILITY);

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(`/gef/application-details/${dealId}`);
    });

    it('should redirect to "what do you need to change" page if amendment is not changing facility value', async () => {
      // Arrange
      mockGetAmendment.mockResolvedValue(
        new PortalFacilityAmendmentWithUkefIdMockBuilder()
          .withDealId(dealId)
          .withFacilityId(facilityId)
          .withAmendmentId(amendmentId)
          .withChangeFacilityValue(false)
          .build(),
      );

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
      );
    });
  });
});

function getWithSessionCookie(sessionCookie: string) {
  return get(
    url,
    {},
    {
      Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
    },
  );
}
