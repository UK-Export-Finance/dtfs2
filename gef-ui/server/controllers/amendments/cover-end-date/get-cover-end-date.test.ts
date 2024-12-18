import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, PORTAL_LOGIN_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';

import { getCoverEndDate, GetCoverEndDateRequest } from './get-cover-end-date';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_UNISSUED_FACILITY, MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';

const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
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

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

const { req, res } = getHttpMocks();

describe('getCoverEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct dealId and userToken', async () => {
    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should render the cover end date template if the facility is valid', async () => {
    // Act
    await getCoverEndDate(req, res);

    // Assert
    const expectedRenderData: CoverEndDateViewModel = {
      exporterName: MOCK_BASIC_DEAL.exporter.companyName,
      cancelUrl: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/cancel`,
      previousPage: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/what-needs-to-change`,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/cover-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should redirect if the facility is not found', async () => {
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await getCoverEndDate(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
  });

  it('should redirect if the deal is not found', async () => {
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
  });

  it('should redirect if the facility cannot be amended', async () => {
    getFacilityMock.mockResolvedValue(MOCK_UNISSUED_FACILITY);

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    getApplicationMock.mockRejectedValue(new Error('test error'));

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    getFacilityMock.mockRejectedValue(new Error('test error'));

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});
