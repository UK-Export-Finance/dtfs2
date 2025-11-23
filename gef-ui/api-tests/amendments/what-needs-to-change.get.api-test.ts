import { Headers } from 'node-mocks-http';
import { Request, Response, NextFunction } from 'express';
import * as libs from '@ukef/dtfs2-common';
import { DEAL_STATUS, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { MOCK_ISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';
import { MOCK_PIM_TEAM } from '../../server/utils/mocks/mock-tfm-teams.ts';
import { withGetAmendmentPageErrorHandlingTests } from './with-get-amendment-page-error-handling.api-tests';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment.ts';

const originalEnv = { ...process.env };

const { get } = createApi(app);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof libs>('@ukef/dtfs2-common'),
  verify: jest.fn((req: Request, res: Response, next: NextFunction): void => next()),
}));

const mockGetFacility = jest.fn();
const mockGetApplication = jest.fn();
const mockGetAmendment = jest.fn();
const mockGetTfmTeam = jest.fn();
console.error = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };
const mockFacility = MOCK_ISSUED_FACILITY.details;

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`;

describe(`GET ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.clearAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.MAKER]));
    jest.spyOn(api, 'getFacility').mockImplementation(mockGetFacility);
    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    jest.spyOn(api, 'getAmendment').mockImplementation(mockGetAmendment);
    jest.spyOn(api, 'getTfmTeam').mockImplementation(mockGetTfmTeam);

    mockGetFacility.mockResolvedValue({ details: mockFacility });
    mockGetApplication.mockResolvedValue(mockDeal);
    mockGetTfmTeam.mockResolvedValue(MOCK_PIM_TEAM);
    mockGetAmendment.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build(),
    );
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
      const response = await getWithSessionCookie(sessionCookie);

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
      const response = await getWithSessionCookie(sessionCookie);

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

    it('should render `What do you need to change?` page', async () => {
      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('What do you need to change?');
    });

    it('should redirect to deal summary page when facility cannot be amended', async () => {
      // Arrange
      mockGetFacility.mockResolvedValue({ details: { ...mockFacility, hasBeenIssued: false } });

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(`/gef/application-details/${dealId}`);
    });

    it('should render problem with service if getTfmTeam throws an error', async () => {
      // Arrange
      mockGetTfmTeam.mockRejectedValue(new Error('Invalid team'));

      // Act
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('Problem with the service');
      expect(console.error).toHaveBeenCalledWith('Error getting amendments what needs to change page %o', new Error('Invalid team'));
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
