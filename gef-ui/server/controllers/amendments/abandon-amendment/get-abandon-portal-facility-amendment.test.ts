import * as dtfsCommon from '@ukef/dtfs2-common';
import { DEAL_STATUS, PORTAL_LOGIN_STATUS, DEAL_SUBMISSION_TYPE, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { withAmendmentGetControllerTests } from '../../../../test-helpers/with-amendment-get-controller.tests.ts';

/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import { AbandonAmendmentViewModel } from '../../../types/view-models/amendments/abandon-amendment-view-model';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { getAbandonPortalFacilityAmendment, GetAbandonPortalFacilityAmendmentRequest } from './get-abandon-portal-facility-amendment';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const getHttpMocks = () =>
  createMocks<GetAbandonPortalFacilityAmendmentRequest>({
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

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };

describe('getAbandonPortalFacilityAmendment', () => {
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
    makeRequest: getAbandonPortalFacilityAmendment,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it(`should render the 'Confirm that you want to abandon' template if the facility is valid`, async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const previousPage = req.headers.referer ?? `/gef/application-details/${dealId}`;
    const applicationDetailsUrl = `/gef/application-details/${dealId}`;

    // Act
    await getAbandonPortalFacilityAmendment(req, res);

    // Assert
    const expectedRenderData: AbandonAmendmentViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage,
      applicationDetailsUrl,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/abandon.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should not call console.error if the facility and amendment are valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(console.error).not.toHaveBeenCalled();
  });
});
