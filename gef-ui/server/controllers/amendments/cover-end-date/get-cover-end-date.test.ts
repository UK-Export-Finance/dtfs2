/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, Facility, PORTAL_LOGIN_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getCoverEndDate, GetCoverEndDateRequest } from './get-cover-end-date';
import { Deal } from '../../../types/deal';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const companyName = 'test company';

const getHttpMocks = () =>
  createMocks<GetCoverEndDateRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { exporter: { companyName }, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as Deal;

const mockFacility = {
  hasBeenIssued: true,
} as Facility;

describe('getCoverEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue({ details: mockFacility });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should render the cover end date template if the facility is valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getCoverEndDate(req, res);

    // Assert
    const expectedRenderData: CoverEndDateViewModel = {
      exporterName: companyName,
      cancelUrl: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/cancel`,
      previousPage: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/what-needs-to-change`,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/cover-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await getCoverEndDate(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await getCoverEndDate(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
  });

  it('should redirect if the facility cannot be amended', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: { ...mockFacility, hasBeenIssued: false } });

    // Act
    await getCoverEndDate(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    getApplicationMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    getFacilityMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getCoverEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});
