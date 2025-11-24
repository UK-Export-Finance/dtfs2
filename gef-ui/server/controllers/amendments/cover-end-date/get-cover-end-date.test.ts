import * as dtfsCommon from '@ukef/dtfs2-common';
import { DEAL_STATUS, PORTAL_LOGIN_STATUS, DEAL_SUBMISSION_TYPE, ROLES, PortalFacilityAmendmentWithUkefId, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';

/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import { getCoverEndDate, GetCoverEndDateRequest } from './get-cover-end-date';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';
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
  createMocks<GetCoverEndDateRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };

describe('getCoverEndDate', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withStatus(PORTAL_AMENDMENT_STATUS.DRAFT)
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
    makeRequest: getCoverEndDate,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it('should render the cover end date template if the facility is valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getCoverEndDate(req, res);

    // Assert
    const canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;
    const previousPage = getPreviousPage(PORTAL_AMENDMENT_PAGES.COVER_END_DATE, amendment);

    const expectedRenderData: CoverEndDateViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      canMakerCancelAmendment,
      previousPage,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/cover-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
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
    await getCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s not changing cover end date', amendmentId);
  });
});
