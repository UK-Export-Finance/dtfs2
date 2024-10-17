import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TestApiError, TfmDealCancellation } from '@ukef/dtfs2-common';
import { submitDealCancellation, SubmitDealCancellationRequest } from './submit-deal-cancellation.controller';

const submitDealCancellationMock = jest.fn() as jest.Mock<Promise<void>>;

jest.mock('../../services/deal-cancellation/deal-cancellation.service', () => ({
  DealCancellationService: {
    submitDealCancellation: (dealId: string, dealCancellation: TfmDealCancellation) => submitDealCancellationMock(dealId, dealCancellation),
  },
}));

const dealCancellation = {
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
    it('should return 500 when submitDealCancellationMock throws an unknown error', async () => {
      // Arrange
      submitDealCancellationMock.mockRejectedValueOnce(new Error('An error occurred'));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual({ status: HttpStatusCode.InternalServerError, message: 'Failed to submit deal cancellation' });
    });

    it('should return correct error status & message when submitDealCancellationMock throws an api error', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const errorMessage = 'An error occurred';
      submitDealCancellationMock.mockRejectedValueOnce(new TestApiError(errorStatus, errorMessage));

      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._getData()).toEqual({ status: errorStatus, message: `Failed to submit deal cancellation: ${errorMessage}` });
    });

    it('should call submitDealCancellationMock with the correct parameters', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
      // TODO: DTFS2-7298 - use values returned by api
      expect(submitDealCancellationMock).toHaveBeenCalledWith(mockDealId, dealCancellation);
    });

    it('should return 200', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });
  });
});
