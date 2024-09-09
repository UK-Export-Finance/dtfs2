import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import api from '../api';
import { updateDealCancellation, UpdateDealCancellationRequest } from './deal-cancellation.controller';

jest.mock('../api');

const dealCancellationUpdate = {
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
    it('should call api.updateDealCancellation with the correct parameters', async () => {
      jest.mocked(api.updateDealCancellation).mockResolvedValue({});

      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId },
        body: dealCancellationUpdate,
        user: { _id: mockUserId },
      });
      const auditDetails = { id: mockUserId, userType: 'tfm' };

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(api.updateDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.updateDealCancellation).toHaveBeenCalledWith({ dealId: mockDealId, dealCancellationUpdate, auditDetails });
    });
  });
});
