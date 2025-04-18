import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { AnyObject, DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES, PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { MOCK_BASIC_DEAL } from '../../server/utils/mocks/mock-applications';
import { PORTAL_AMENDMENT_PAGES } from '../../server/constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-amendment';
import { Deal } from '../../server/types/deal';
import { getAmendmentsUrl } from '../../server/controllers/amendments/helpers/navigation.helper';
import * as createReferenceNumber from '../../server/controllers/amendments/helpers/create-amendment-reference-number.helper';

const originalEnv = { ...process.env };

const { post } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../server/middleware/csrf', () => ({
  csrfToken: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

console.error = jest.fn();
const getApplicationMock = jest.fn();
const updateSubmitAmendmentMock = jest.fn();
const createReferenceNumberMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, submissionCount: 0, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.SUBMIT_AMENDMENT_TO_UKEF}`;
const referenceNumber = `${facilityId}-01`;
const confirmSubmitUkef = true;

describe(`GET ${url}`, () => {
  let sessionCookie: string;
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.CHECKER]));
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'updateSubmitAmendment').mockImplementation(updateSubmitAmendmentMock);
    jest.spyOn(createReferenceNumber, 'createReferenceNumber').mockImplementation(createReferenceNumberMock);

    getApplicationMock.mockResolvedValue(mockDeal);
    createReferenceNumberMock.mockResolvedValue(referenceNumber);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
      .build();

    updateSubmitAmendmentMock.mockResolvedValue(amendment);
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
      const response = await postWithSessionCookie({ confirmSubmitUkef }, sessionCookie);

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
      const response = await postWithSessionCookie({ confirmSubmitUkef }, sessionCookie);

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
      makeRequestWithHeaders: (headers: Headers) => post(headers).to(url),
      whitelistedRoles: [ROLES.CHECKER],
      successCode: HttpStatusCode.Found,
    });

    it(`should redirect to the ${PORTAL_AMENDMENT_PAGES.APPROVED_BY_UKEF} page if the amendment has been updated`, async () => {
      // Act
      const response = await postWithSessionCookie({ confirmSubmitUkef }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.APPROVED_BY_UKEF }));
    });

    it('should redirect to "/not-found" when deal not found', async () => {
      // Arrange
      getApplicationMock.mockResolvedValue(undefined);

      // Act
      const response = await postWithSessionCookie({ confirmSubmitUkef }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when reference number not found', async () => {
      // Arrange
      createReferenceNumberMock.mockResolvedValue(undefined);

      // Act
      const response = await postWithSessionCookie({ confirmSubmitUkef }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });
  });
});

function postWithSessionCookie(body: AnyObject, sessionCookie: string) {
  return post(body, { Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`] }).to(url);
}
