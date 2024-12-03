/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();

import { aPortalSessionUser, CURRENCY, Facility, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
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
      user: aPortalSessionUser(),
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockFacility = {
  currency: {
    id: CURRENCY.GBP,
  },
} as Facility;

describe('getFacilityValue', () => {
  beforeEach(() => {
    getApplicationMock.mockResolvedValue({ exporter: { companyName } } as Deal);
    getFacilityMock.mockResolvedValue({ details: mockFacility });
  });

  it('should render the facility value template if the api request succeeds', async () => {
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

    expect(res._getRenderView()).toEqual('partials/amendments/facility-value.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
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
