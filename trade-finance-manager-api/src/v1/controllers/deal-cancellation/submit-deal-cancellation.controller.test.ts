import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError } from '@ukef/dtfs2-common';
import api from '../../api';
import { submitDealCancellation, SubmitDealCancellationRequest } from './submit-deal-cancellation.controller';

jest.mock('../../api');

const mockDealId = new ObjectId();
const mockUserId = new ObjectId();
const cancellation = { reason: 'test reason', bankRequestDate: new Date().valueOf(), effectiveFrom: new Date().valueOf() };
const mockSubmitCancellationResponse = { cancelledDeal: { ukefDealId: new ObjectId() } };

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST - submitDealCancellation', () => {
    it('should call api.submitDealCancellation with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: cancellation,
        user: { _id: mockUserId },
      });
      const auditDetails = { id: mockUserId, userType: 'tfm' };

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(api.submitDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.submitDealCancellation).toHaveBeenCalledWith({ dealId: mockDealId, cancellation, auditDetails });
    });

    it('should return the deal submit cancellation response object on success', async () => {
      jest.mocked(api.submitDealCancellation).mockResolvedValue(mockSubmitCancellationResponse);

      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: cancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(mockSubmitCancellationResponse);
    });

    it('should return an error when there is an API error', async () => {
      const testErrorStatus = 418;
      const testApiErrorMessage = 'test api error message';
      jest.mocked(api.submitDealCancellation).mockRejectedValue(new TestApiError(testErrorStatus, testApiErrorMessage));

      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: cancellation,
        user: { _id: mockUserId },
      });
      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(testErrorStatus);
      expect(res._getData()).toEqual({ message: `Failed to submit deal cancellation: ${testApiErrorMessage}`, status: testErrorStatus });
    });

    it('should return an error when there is a general error', async () => {
      jest.mocked(api.submitDealCancellation).mockRejectedValue(new Error('Some error'));

      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: cancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ message: 'Failed to submit deal cancellation', status: 500 });
    });
  });
});
