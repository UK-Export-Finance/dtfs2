/* eslint-disable import/first */
const getApplicationMock = jest.fn();

import { aPortalSessionUser, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { createMocks } from 'node-mocks-http';
import { getFacilityValue, GetFacilityValueRequest } from './get-facility-value';
import { Deal } from '../../../types/deal';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
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

describe('getFacilityValue', () => {
  beforeEach(() => {
    getApplicationMock.mockResolvedValue({ exporter: { companyName } } as Deal);
  });

  it('should render the facility value template if the api request succeeds', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getFacilityValue(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/amendments/facility-value.njk');
    expect(res._getRenderData()).toEqual({
      exporterName: companyName,
      facilityValue: 0,
      previousPage: `/case/${dealId}/facility/${facilityId}/amendments/${amendmentId}/bank-review-date`,
    });
  });

  it('should render `problem with service` if the api throws an error', async () => {
    // Arrange
    getApplicationMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getFacilityValue(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});
