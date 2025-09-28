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
import { MOCK_ISSUED_FACILITY } from '../../server/utils/mocks/mock-facilities';
import { MOCK_PIM_TEAM } from '../../server/utils/mocks/mock-tfm-teams.ts';
import { getAmendmentsUrl } from '../../server/controllers/amendments/helpers/navigation.helper';
import * as getAmendmentReferenceNumber from '../../server/controllers/amendments/helpers/get-amendment-reference-number.helper';

const originalEnv = { ...process.env };

const { post } = createApi(app);


jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

console.error = jest.fn();
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getTfmTeamMock = jest.fn();
const updateSubmitAmendmentMock = jest.fn();
const getAmendmentReferenceNumberMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const facilityValue = 20000;

const effectiveDateWithoutMs = Number(new Date()) / 1000;
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;
const referenceNumber = `${mockFacilityDetails.ukefFacilityId}-001`;

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, submissionCount: 0, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.SUBMIT_AMENDMENT_TO_UKEF}`;
const confirmSubmitUkef = true;

describe(`POST ${url}`, () => {
  let sessionCookie: string;
  let amendment: PortalFacilityAmendmentWithUkefId;
  let submittedAmendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([ROLES.CHECKER]));
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);
    jest.spyOn(api, 'getTfmTeam').mockImplementation(getTfmTeamMock);
    jest.spyOn(api, 'updateSubmitAmendment').mockImplementation(updateSubmitAmendmentMock);
    jest.spyOn(getAmendmentReferenceNumber, 'getAmendmentReferenceNumber').mockImplementation(getAmendmentReferenceNumberMock);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentReferenceNumberMock.mockResolvedValue(referenceNumber);

    const criteria = [
      {
        id: 1,
        text: 'Criterion 1',
        answer: null,
      },
      {
        id: 2,
        text: 'Criterion 2',
        textList: ['bullet 1', 'bullet 2'],
        answer: null,
      },
      {
        id: 3,
        text: 'Criterion 3',
        answer: null,
      },
    ];

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withCriteria(criteria)
      .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
      .withChangeCoverEndDate(true)
      .withCoverEndDate(coverEndDate)
      .withIsUsingFacilityEndDate(true)
      .withFacilityEndDate(facilityEndDate)
      .withChangeFacilityValue(true)
      .withFacilityValue(facilityValue)
      .withEffectiveDate(effectiveDateWithoutMs)
      .build();

    submittedAmendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withCriteria(criteria)
      .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
      .withChangeCoverEndDate(true)
      .withCoverEndDate(coverEndDate)
      .withIsUsingFacilityEndDate(true)
      .withFacilityEndDate(facilityEndDate)
      .withChangeFacilityValue(true)
      .withFacilityValue(facilityValue)
      .withEffectiveDate(effectiveDateWithoutMs)
      .build();

    getAmendmentMock.mockResolvedValue(amendment);
    getTfmTeamMock.mockResolvedValue(MOCK_PIM_TEAM);
    updateSubmitAmendmentMock.mockResolvedValue(submittedAmendment);
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

    it('should redirect to "/not-found" when facility not found', async () => {
      // Arrange
      getFacilityMock.mockResolvedValue({ details: undefined });

      // Act
      const response = await postWithSessionCookie({ confirmSubmitUkef }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to "/not-found" when amendment not found', async () => {
      // Arrange
      getAmendmentMock.mockResolvedValue(undefined);

      // Act
      const response = await postWithSessionCookie({ confirmSubmitUkef }, sessionCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });

    it('should redirect to /not-found when reference number not found', async () => {
      // Arrange
      getAmendmentReferenceNumberMock.mockResolvedValue(undefined);

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
