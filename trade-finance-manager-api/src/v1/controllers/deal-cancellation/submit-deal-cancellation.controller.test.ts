import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AnyObject, TestApiError } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { submitDealCancellation, SubmitDealCancellationRequest } from './submit-deal-cancellation.controller';

const submitDealCancellationMock = jest.fn() as jest.Mock<Promise<void>>;

jest.mock('../../services/deal-cancellation/deal-cancellation.service', () => ({
  DealCancellationService: {
    submitDealCancellation: (params: AnyObject) => submitDealCancellationMock(params),
  },
}));

const cancellation = {
  reason: 'test reason',
  bankRequestDate: 1794418807,
  effectiveFrom: 1794418808,
};

const mockDealId = new ObjectId();
const mockUserId = new ObjectId();

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST - submitDealCancellation', () => {
    it('should return 500 when submitDealCancellation throws an unknown error', async () => {
      // Arrange
      submitDealCancellationMock.mockRejectedValueOnce(new Error('An error occurred'));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: cancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ status: HttpStatusCode.InternalServerError, message: 'Failed to submit deal cancellation' });
    });

    it('should return correct error status & message when submitDealCancellation throws an api error', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const errorMessage = 'An error occurred';
      submitDealCancellationMock.mockRejectedValueOnce(new TestApiError(errorStatus, errorMessage));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: cancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._getData()).toEqual({ status: errorStatus, message: `Failed to submit deal cancellation: ${errorMessage}` });
    });

    it('should call submitDealCancellation with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: cancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
      expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId: mockDealId, cancellation, auditDetails: generateTfmAuditDetails(mockUserId) });
    });

    it('should return 200', async () => {
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
    });
  });
});
