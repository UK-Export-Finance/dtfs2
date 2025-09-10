// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_LOGIN_STATUS, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getCheckYourAnswers, GetCheckYourAnswersRequest } from './get-check-your-answers';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { createCheckYourAnswersViewModel } from './create-check-your-answers-view-model';
import { Deal } from '../../../types/deal';
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
  createMocks<GetCheckYourAnswersRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;

describe('getCheckYourAnswers', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withAmendmentGetControllerTests({
    makeRequest: getCheckYourAnswers,
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
    await getCheckYourAnswers(req, res);

    // Assert
    const expectedRenderData = createCheckYourAnswersViewModel({ amendment, deal: mockDeal, facility: MOCK_ISSUED_FACILITY.details });

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/check-your-answers.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });
});
