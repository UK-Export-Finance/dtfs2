import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, PORTAL_LOGIN_STATUS, DEAL_SUBMISSION_TYPE, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { getPreviousAmendmentPageUrl } from './get-previous-page-url';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { withAmendmentGetControllerTests } from '../../../../test-helpers/with-amendment-get-controller.tests.ts';

/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import { CancelAmendmentViewModel } from '../../../types/view-models/amendments/cancel-amendment-view-model';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { getCancelPortalFacilityAmendment, GetCancelPortalFacilityAmendmentRequest } from './cancel-portal-facility-amendment';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const getHttpMocks = () =>
  createMocks<GetCancelPortalFacilityAmendmentRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    headers: {
      referer: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.COVER_END_DATE}`,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('getCancelPortalFacilityAmendment', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
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
    makeRequest: getCancelPortalFacilityAmendment,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it(`should render the 'Are you sure you want to cancel the request?' template if the facility is valid`, async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getCancelPortalFacilityAmendment(req, res);

    // Assert
    const expectedRenderData: CancelAmendmentViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage: getPreviousAmendmentPageUrl(req.headers.referer, dealId, facilityId, amendmentId),
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/cancel.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should not call console.error if the facility and amendment are valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(console.error).not.toHaveBeenCalled();
  });
});
