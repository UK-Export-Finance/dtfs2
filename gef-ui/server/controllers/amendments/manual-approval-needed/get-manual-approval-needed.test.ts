// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getTfmTeamMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_LOGIN_STATUS, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { MOCK_PIM } from '../../../utils/mocks/mock-tfm-teams.js';
import { getManualApprovalNeeded, GetManualApprovalNeededRequest } from './get-manual-approval-needed.ts';
import { Deal } from '../../../types/deal';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { ManualApprovalNeededViewModel } from '../../../types/view-models/amendments/ManualApprovalNeededViewModel.ts';
import { withAmendmentGetControllerTests } from '../../../../test-helpers/with-amendment-get-controller.tests.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
  getTfmTeam: getTfmTeamMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';
const returnLink = '/dashboard/deals';
const teamId = String(dtfsCommon.TEAM_IDS.PIM);
const userToken = 'testToken';

const getHttpMocks = () =>
  createMocks<GetManualApprovalNeededRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;

describe('getManualApprovalNeeded', () => {
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
      .withCriteria([
        { id: 1, text: 'Criterion 1', answer: true },
        { id: 2, text: 'Criterion 2', answer: false },
      ])
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    getTfmTeamMock.mockResolvedValue(MOCK_PIM);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withAmendmentGetControllerTests({
    makeRequest: getManualApprovalNeeded,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it('should render the manual approval needed template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getManualApprovalNeeded(req, res);

    // Assert
    const expectedRenderData: ManualApprovalNeededViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.MANUAL_APPROVAL_NEEDED, amendment),
      amendmentFormEmail: 'test@ukexportfinance.gov.uk',
      returnLink,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/manual-approval-needed.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should redirect to the eligibility page if the responses to the criteria are all true', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withCriteria([
          { id: 1, text: 'Criterion 1', answer: true },
          { id: 2, text: 'Criterion 2', answer: true },
        ])
        .build(),
    );

    // Act
    await getManualApprovalNeeded(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY }));
  });

  it('should call getTfmTeam with the correct teamId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getManualApprovalNeeded(req, res);

    // Assert
    expect(getTfmTeamMock).toHaveBeenCalledTimes(1);
    expect(getTfmTeamMock).toHaveBeenCalledWith({ teamId, userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });
});
