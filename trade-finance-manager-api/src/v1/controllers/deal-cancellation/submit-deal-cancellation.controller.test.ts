import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { submitDealCancellation, SubmitDealCancellationRequest } from './submit-deal-cancellation.controller';
import { sendDealCancellationEmail } from '../../services/deal-cancellation/send-deal-cancellation-email';

jest.mock('../../api');
jest.mock('../../services/deal-cancellation/send-deal-cancellation-email');

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
    it('should call send tfm email', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks<SubmitDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellation,
        user: { _id: mockUserId },
      });

      // Act
      await submitDealCancellation(req, res);

      // Assert
      expect(sendDealCancellationEmail).toHaveBeenCalledTimes(1);
      // TODO: DTFS2-7298 - use values returned by api
      expect(sendDealCancellationEmail).toHaveBeenCalledWith('00123144', dealCancellation, ['00123145', '00123146']);
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
