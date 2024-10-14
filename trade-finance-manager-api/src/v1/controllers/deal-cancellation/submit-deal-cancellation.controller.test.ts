import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { submitDealCancellation, SubmitDealCancellationRequest } from './submit-deal-cancellation.controller';

jest.mock('../../api');

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

  describe('PUT - updateDealCancellation', () => {
    it('should return 200', () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      submitDealCancellation(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });
  });
});
