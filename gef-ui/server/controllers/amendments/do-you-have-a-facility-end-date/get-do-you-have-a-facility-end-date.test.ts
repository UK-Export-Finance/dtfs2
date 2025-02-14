// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_LOGIN_STATUS, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getDoYouHaveAFacilityEndDate, GetDoYouHaveAFacilityEndDateRequest } from './get-do-you-have-a-facility-end-date';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { DoYouHaveAFacilityEndDateViewModel } from '../../../types/view-models/amendments/do-you-have-a-facility-end-date-view-model';
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
  createMocks<GetDoYouHaveAFacilityEndDateRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('getDoYouHaveAFacilityEndDate', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withAmendmentGetControllerTests({
    makeRequest: getDoYouHaveAFacilityEndDate,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it('should render the correct template if the facility and amendment are valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getDoYouHaveAFacilityEndDate(req, res);

    // Assert
    const expectedRenderData: DoYouHaveAFacilityEndDateViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, amendment),
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/do-you-have-a-facility-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should render the correct template with isUsingFacilityEndDate if it is true', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const isUsingFacilityEndDate = true;

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .withIsUsingFacilityEndDate(isUsingFacilityEndDate)
      .build();

    getAmendmentMock.mockResolvedValue(amendment);

    // Act
    await getDoYouHaveAFacilityEndDate(req, res);

    // Assert
    const expectedRenderData: DoYouHaveAFacilityEndDateViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, amendment),
      isUsingFacilityEndDate: String(isUsingFacilityEndDate),
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/do-you-have-a-facility-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should render the correct template with isUsingFacilityEndDate if it is false', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const isUsingFacilityEndDate = false;

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .withIsUsingFacilityEndDate(isUsingFacilityEndDate)
      .build();

    getAmendmentMock.mockResolvedValue(amendment);

    // Act
    await getDoYouHaveAFacilityEndDate(req, res);

    // Assert
    const expectedRenderData: DoYouHaveAFacilityEndDateViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, amendment),
      isUsingFacilityEndDate: String(isUsingFacilityEndDate),
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/do-you-have-a-facility-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should not call console.error if the facility and amendment are valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getDoYouHaveAFacilityEndDate(req, res);

    // Assert
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
    await getDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s is not changing the cover end date', amendmentId);
  });
});
