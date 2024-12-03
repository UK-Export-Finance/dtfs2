/* eslint-disable import/first */
const getApplicationMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { aPortalSessionUser, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { getWhatNeedsToChange, GetWhatNeedsToChangeRequest } from './what-needs-to-change.ts';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';
const exporterName = 'test company name';

const getHttpMocks = (status?: string) =>
  httpMocks.createMocks<GetWhatNeedsToChangeRequest>({
    params: {
      dealId,
      facilityId,
      amendmentId,
    },
    query: {
      status,
    },
    session: {
      user: aPortalSessionUser(),
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

describe('getWhatNeedsToChange', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the "What do you need to change?" page the with correct data', async () => {
    // Arrange
    const mockStatus = 'mock status';
    const { req: mockReq, res: mockRes } = getHttpMocks(mockStatus);
    getApplicationMock.mockResolvedValueOnce({ exporter: { companyName: exporterName } });

    // Act
    await getWhatNeedsToChange(mockReq, mockRes);

    // Assert
    expect(mockRes._getRenderView()).toEqual('partials/amendments/what-needs-to-change.njk');
    expect(mockRes._getRenderData()).toEqual({
      exporterName,
      previousPage: `/application-details/${dealId}`,
    });
  });

  it('renders problem with the service page when an error is thrown', async () => {
    // Arrange
    const { req: mockReq, res: mockRes } = getHttpMocks();

    getApplicationMock.mockRejectedValueOnce(new Error('An error occurred'));

    // Act
    await getWhatNeedsToChange(mockReq, mockRes);

    // Assert
    expect(mockRes._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});
