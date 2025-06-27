// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  PORTAL_LOGIN_STATUS,
  ROLES,
  PortalFacilityAmendmentWithUkefId,
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { BankReviewDateViewModel } from '../../../types/view-models/amendments/bank-review-date-view-model.ts';
import { getBankReviewDate, GetBankReviewDateRequest } from './get-bank-review-date.ts';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { withAmendmentGetControllerTests } from '../../../../test-helpers/with-amendment-get-controller.tests.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const getHttpMocks = () =>
  createMocks<GetBankReviewDateRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('getBankReviewDate', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withStatus(PORTAL_AMENDMENT_STATUS.DRAFT)
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withIsUsingFacilityEndDate(false)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withAmendmentGetControllerTests({
    makeRequest: getBankReviewDate,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it('should render the correct template when the amendment does not have an existing bankReviewDate', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getBankReviewDate(req, res);

    // Assert
    const previousPage = getPreviousPage(PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE, amendment);

    const expectedRenderData: BankReviewDateViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      canMakerCancelAmendment: amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT,
      bankReviewDate: undefined,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/bank-review-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should render the correct template when the amendment has an existing bankReviewDate', async () => {
    // Arrange
    const bankReviewDate = new Date();

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withStatus(PORTAL_AMENDMENT_STATUS.DRAFT)
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withIsUsingFacilityEndDate(false)
      .withBankReviewDate(bankReviewDate)
      .build();

    getAmendmentMock.mockResolvedValue(amendment);

    const { req, res } = getHttpMocks();

    // Act
    await getBankReviewDate(req, res);

    // Assert
    const canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;

    const expectedRenderData: BankReviewDateViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE, amendment),
      bankReviewDate: {
        day: format(bankReviewDate, 'd'),
        month: format(bankReviewDate, 'M'),
        year: format(bankReviewDate, 'yyyy'),
      },
      canMakerCancelAmendment,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/bank-review-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect if the amendment is not changing the cover end date', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withChangeCoverEndDate(false)
        .build(),
    );

    // Act
    await getBankReviewDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s is not changing the cover end date', amendmentId);
  });

  it('should redirect if the amendment is using facility end date', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withIsUsingFacilityEndDate(true)
        .build(),
    );

    // Act
    await getBankReviewDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE}`,
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s is not using bank review date', amendmentId);
  });

  it('should redirect if isUsingFacilityEndDate is not set', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withChangeCoverEndDate(true)
        .build(),
    );

    // Act
    await getBankReviewDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE}`,
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s is not using bank review date', amendmentId);
  });
});
