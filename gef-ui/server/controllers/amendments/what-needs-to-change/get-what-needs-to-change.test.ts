// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getTfmTeamMock = jest.fn();

import { createMocks } from 'node-mocks-http';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_LOGIN_STATUS, PortalFacilityAmendmentWithUkefId, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { MOCK_PIM_TEAM } from '../../../utils/mocks/mock-tfm-teams.js';
import { getAmendmentsUrl } from '../helpers/navigation.helper.ts';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { getWhatNeedsToChange, GetWhatNeedsToChangeRequest } from './get-what-needs-to-change.ts';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';
import { Deal } from '../../../types/deal.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { withAmendmentGetControllerTests } from '../../../../test-helpers/with-amendment-get-controller.tests.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
  getTfmTeam: getTfmTeamMock,
}));

console.error = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';
const teamId = String(dtfsCommon.TEAM_IDS.PIM);
const companyName = 'company name ltd';
const userToken = 'userToken';

const getHttpMocks = () =>
  createMocks<GetWhatNeedsToChangeRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { exporter: { companyName }, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as Deal;

describe('getWhatNeedsToChange', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    getTfmTeamMock.mockResolvedValue(MOCK_PIM_TEAM);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withAmendmentGetControllerTests({
    makeRequest: getWhatNeedsToChange,
    getHttpMocks,
    getFacilityMock,
    getApplicationMock,
    getAmendmentMock,
    dealId,
    facilityId,
    amendmentId,
  });

  it('should render the "What do you need to change?" template the with correct data when changeFacilityValue and changeFacilityEndDate are undefined', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValueOnce(amendment);

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    const previousPage = `/gef/application-details/${dealId}`;
    const expectedRenderData: WhatNeedsToChangeViewModel = {
      exporterName: companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      amendmentFormEmail: 'test@ukexportfinance.gov.uk',
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/what-needs-to-change.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should render the "What do you need to change?" template the with correct data when changeFacilityValue and changeFacilityEndDate have existing values', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const amendmentWithChangeValues = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeFacilityValue(true)
      .withChangeCoverEndDate(false)
      .build();

    getAmendmentMock.mockResolvedValueOnce(amendmentWithChangeValues);

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    const expectedRenderData: WhatNeedsToChangeViewModel = {
      exporterName: companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage: `/gef/application-details/${dealId}`,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      amendmentFormEmail: 'test@ukexportfinance.gov.uk',
      changeFacilityValue: true,
      changeCoverEndDate: false,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/what-needs-to-change.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should call getTfmTeam with the correct teamId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(getTfmTeamMock).toHaveBeenCalledTimes(1);
    expect(getTfmTeamMock).toHaveBeenCalledWith({ teamId, userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });
});
