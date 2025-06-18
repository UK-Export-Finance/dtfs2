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
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { EligibilityViewModel } from '../../../types/view-models/amendments/eligibility-view-model.ts';
import { getEligibility, GetEligibilityRequest } from './get-eligibility.ts';
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
  createMocks<GetEligibilityRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };
const criteria = [
  { id: 1, text: 'test criteria 1', answer: true },
  { id: 2, text: 'test criteria 2', answer: false },
];

describe('getEligibility', () => {
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
      .withCriteria(criteria)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withAmendmentGetControllerTests({
    makeRequest: getEligibility,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it('should render the correct template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getEligibility(req, res);

    // Assert
    const previousPage = getPreviousPage(PORTAL_AMENDMENT_PAGES.ELIGIBILITY, amendment);
    const expectedRenderData: EligibilityViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      canMakerCancelAmendment: amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT,
      criteria,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/eligibility.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });
});
