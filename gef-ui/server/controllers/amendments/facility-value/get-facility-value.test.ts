/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, CURRENCY, DEAL_STATUS, DEAL_SUBMISSION_TYPE, Facility, PORTAL_LOGIN_STATUS, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getFacilityValue, GetFacilityValueRequest } from './get-facility-value';
import { Deal } from '../../../types/deal';
import { FacilityValueViewModel } from '../../../types/view-models/amendments/facility-value-view-model';
import { getCurrencySymbol } from './getCurrencySymbol';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const companyName = 'company name ltd';

const getHttpMocks = () =>
  createMocks<GetFacilityValueRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { exporter: { companyName }, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as Deal;

const mockFacility = {
  currency: {
    id: CURRENCY.GBP,
  },
  hasBeenIssued: true,
} as Facility;

describe('getFacilityValue', () => {
  beforeEach(() => {
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue({ details: mockFacility });
  });

  it('should render the facility value template if the facility is valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getFacilityValue(req, res);

    // Assert
    const expectedRenderData: FacilityValueViewModel = {
      amendmentId,
      dealId,
      facilityId,
      exporterName: companyName,
      facilityValue: 0,
      previousPage: `/case/${dealId}/facility/${facilityId}/amendments/${amendmentId}/bank-review-date`,
      currencySymbol: getCurrencySymbol(mockFacility.currency.id),
    };

    expect(res._getStatusCode()).toEqual(200);
    expect(res._getRenderView()).toEqual('partials/amendments/facility-value.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should redirect to /not-found if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await getFacilityValue(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res.getHeaders().location).toEqual(`/not-found`);
  });

  it('should redirect to /not-found if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await getFacilityValue(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res.getHeaders().location).toEqual(`/not-found`);
  });

  it('should redirect to deal summary page if the facility cannot be amended', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: { ...mockFacility, hasBeenIssued: false } });

    // Act
    await getFacilityValue(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res.getHeaders().location).toEqual(`/case/${dealId}`);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    getApplicationMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getFacilityValue(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    getFacilityMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getFacilityValue(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});
