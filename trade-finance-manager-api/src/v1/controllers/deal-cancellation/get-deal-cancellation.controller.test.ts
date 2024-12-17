import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TFM_DEAL_CANCELLATION_STATUS, TestApiError, TfmDealCancellationWithStatus } from '@ukef/dtfs2-common';
import api from '../../api';
import { getDealCancellation, GetDealCancellationRequest } from './get-deal-cancellation.controller';

jest.mock('../../api');

const mockDealId = new ObjectId();

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - getDealCancellation', () => {
    it('should call api.getDealCancellation with the dealId', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<GetDealCancellationRequest>({
        params: { dealId: mockDealId },
      });

      // Act
      await getDealCancellation(req, res);

      // Assert
      expect(api.getDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.getDealCancellation).toHaveBeenCalledWith(mockDealId);
    });

    it('should return the deal cancellation', async () => {
      // Arrange
      const mockTfmDealCancellation: TfmDealCancellationWithStatus = {
        status: TFM_DEAL_CANCELLATION_STATUS.DRAFT,
        reason: 'Test Reason',
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: new Date().valueOf(),
      };

      jest.mocked(api.getDealCancellation).mockResolvedValue(mockTfmDealCancellation);
      const { req, res } = httpMocks.createMocks<GetDealCancellationRequest>({
        params: { dealId: mockDealId },
      });

      // Act
      await getDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockTfmDealCancellation);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = 418;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.getDealCancellation).mockRejectedValue(new TestApiError({ status: testErrorStatus, message: testApiErrorMessage }));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetDealCancellationRequest>({
        params: { dealId: mockDealId },
      });

      // Act
      await getDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to get deal cancellation: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.getDealCancellation).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<GetDealCancellationRequest>({
        params: { dealId: mockDealId },
      });

      // Act
      await getDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to get deal cancellation', status: 500 });
    });
  });
});
