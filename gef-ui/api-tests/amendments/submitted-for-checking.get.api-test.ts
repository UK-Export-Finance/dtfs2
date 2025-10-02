import { Headers } from 'node-mocks-http';
import { Request, Response, NextFunction } from 'express';
import * as libs from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_STATUS, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { MOCK_AIN_APPLICATION } from '../../server/utils/mocks/mock-applications';

const originalEnv = { ...process.env };

const { get } = createApi(app);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  verify: jest.fn((req: Request, res: Response, next: NextFunction): void => next()),
}));

const mockGetAmendment = jest.fn();
const mockGetApplication = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.SUBMITTED_FOR_CHECKING}`;

describe(`GET ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.clearAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'getAmendment').mockImplementation(mockGetAmendment);
    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);

    mockGetAmendment.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
        .build(),
    );

    mockGetApplication.mockResolvedValue(MOCK_AIN_APPLICATION);
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

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED feature flag is not set', () => {
    beforeEach(() => {
      delete process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED;
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

    it('should render submitted for checking page', async () => {
      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Amendment submitted for checking at your bank');
    });

    it('should redirect to /not-found when amendment not found', async () => {
      // Arrange
      mockGetAmendment.mockResolvedValueOnce(undefined);

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it(`should redirect to /not-found if the amendment has a status which is not ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, async () => {
      // Arrange
      const draftAmendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .build();

      mockGetAmendment.mockResolvedValueOnce(draftAmendment);

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should render problem with service if getAmendment throws an error', async () => {
      // Arrange
      mockGetAmendment.mockRejectedValue(new Error('test error'));

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
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
