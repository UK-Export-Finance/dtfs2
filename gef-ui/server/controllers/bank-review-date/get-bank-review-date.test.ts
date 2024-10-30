/* eslint-disable import/first */
const getFacilityMock = jest.fn();
const getApplicationMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { aPortalSessionUser, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { getBankReviewDate, GetBankReviewDateRequest } from './get-bank-review-date';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../services/api', () => ({
  getFacility: getFacilityMock,
  getApplication: getApplicationMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const previousPage = 'previousPage';

const getHttpMocks = (status?: string) =>
  httpMocks.createMocks<GetBankReviewDateRequest>({
    params: {
      dealId,
      facilityId,
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

describe('getBankReviewDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when deal is version 1 and isUsingFacilityEndDate is false', () => {
    beforeEach(() => {
      getApplicationMock.mockResolvedValueOnce({ version: 1 });
    });

    it('renders the bank review date page with correct data, when facility has no existing bank review date', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = getHttpMocks(mockStatus);

      getFacilityMock.mockResolvedValueOnce({ details: { isUsingFacilityEndDate: false, _id: facilityId, dealId } });

      // Act
      await getBankReviewDate({ req: mockReq, res: mockRes, previousPage });

      // Assert
      expect(mockRes._getRenderView()).toEqual('partials/bank-review-date.njk');
      expect(mockRes._getRenderData()).toEqual({
        dealId,
        facilityId,
        previousPage,
        status: mockStatus,
      });
    });

    it('renders the bank review date page with correct data, when facility has an existing bank review date', async () => {
      // Arrange
      const mockStatus = 'mock status';
      const { req: mockReq, res: mockRes } = getHttpMocks(mockStatus);

      getFacilityMock.mockResolvedValueOnce({
        details: { isUsingFacilityEndDate: false, _id: facilityId, dealId, bankReviewDate: '2024-09-09T10:14:08.621Z' },
      });

      // Act
      await getBankReviewDate({ req: mockReq, res: mockRes, previousPage });

      // Assert
      expect(mockRes._getRenderView()).toEqual('partials/bank-review-date.njk');
      expect(mockRes._getRenderData()).toEqual({
        dealId,
        facilityId,
        previousPage,
        status: mockStatus,
        bankReviewDate: {
          day: '9',
          month: '9',
          year: '2024',
        },
      });
    });
  });

  it('redirects to the previous page when dealVersion is 0', async () => {
    // Arrange
    const { req: mockReq, res: mockRes } = getHttpMocks();

    getApplicationMock.mockResolvedValueOnce({ version: 0 });
    getFacilityMock.mockResolvedValueOnce({ details: { isUsingFacilityEndDate: false } });

    // Act
    await getBankReviewDate({ req: mockReq, res: mockRes, previousPage });

    // Assert
    expect(mockRes._getRedirectUrl()).toEqual(previousPage);
  });

  it('redirects to the previous page when isUsingFacilityEndDate is null', async () => {
    // Arrange
    const { req: mockReq, res: mockRes } = getHttpMocks();

    getApplicationMock.mockResolvedValueOnce({ version: 1 });
    getFacilityMock.mockResolvedValueOnce({ details: { isUsingFacilityEndDate: null } });

    // Act
    await getBankReviewDate({ req: mockReq, res: mockRes, previousPage });

    // Assert
    expect(mockRes._getRedirectUrl()).toEqual(previousPage);
  });

  it('redirects to the previous page when isUsingFacilityEndDate is true', async () => {
    // Arrange
    const { req: mockReq, res: mockRes } = getHttpMocks();

    getApplicationMock.mockResolvedValueOnce({ version: 1 });
    getFacilityMock.mockResolvedValueOnce({ details: { isUsingFacilityEndDate: true } });

    // Act
    await getBankReviewDate({ req: mockReq, res: mockRes, previousPage });

    // Assert
    expect(mockRes._getRedirectUrl()).toEqual(previousPage);
  });

  it('renders problem with the service page when an error is thrown', async () => {
    // Arrange
    const { req: mockReq, res: mockRes } = getHttpMocks();

    getApplicationMock.mockRejectedValueOnce(new Error('An error occurred'));
    getFacilityMock.mockRejectedValueOnce(new Error('An error occurred'));

    // Act
    await getBankReviewDate({ req: mockReq, res: mockRes, previousPage });

    // Assert
    expect(mockRes._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});
