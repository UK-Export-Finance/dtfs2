import { Headers } from 'node-mocks-http';
import { Request, Response, NextFunction } from 'express';
import * as libs from '@ukef/dtfs2-common';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { Deal } from '../../server/types/deal';

const originalEnv = { ...process.env };

const { get } = createApi(app);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  verify: jest.fn((req: Request, res: Response, next: NextFunction): void => next()),
}));

console.error = jest.fn();
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, submissionCount: 0, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.SUBMIT_AMENDMENT_TO_UKEF}`;

describe(`GET ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.clearAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.CHECKER]));
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
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
      whitelistedRoles: [ROLES.CHECKER],
      successCode: HttpStatusCode.Ok,
    });

    it('should render `confirm submission` page', async () => {
      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Confirm your submission');
    });

    it('should redirect to "/not-found" when deal not found', async () => {
      // Arrange
      getApplicationMock.mockResolvedValue(undefined);

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when facility not found', async () => {
      // Arrange
      getFacilityMock.mockResolvedValue({ details: undefined });

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when amendment not found', async () => {
      // Arrange
      getAmendmentMock.mockResolvedValue(undefined);

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
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
