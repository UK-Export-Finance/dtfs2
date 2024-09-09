import { ObjectId } from 'mongodb';
import httpMocks from 'node-mocks-http';
import api from '../api';
import { updateDealCancellation, UpdateDealCancellationRequest } from './deal-cancellation.controller';

jest.mock('../api');

describe('controllers - deal cancellation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockDealId = new ObjectId();

  describe('PUT - updateDealCancellation', () => {
    const requestBody = {
      reason: 'deal cancellation reason',
      bankRequestDate: 1794418807,
      effectiveFrom: 1794418808,
    };

    it('should call api.updateDealCancellation', async () => {
      jest.mocked(api.updateDealCancellation).mockResolvedValue({});

      // Arrange
      const { req, res } = httpMocks.createMocks<UpdateDealCancellationRequest>({
        params: { dealId: mockDealId.toString() },
        body: requestBody,
      });
      const auditDetails = { id: new ObjectId(), userType: 'tfm' };

      // Act
      await updateDealCancellation(req, res);

      // Assert
      expect(api.updateDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.updateDealCancellation).toHaveBeenCalledWith(mockDealId, requestBody, auditDetails);
    });
  });
});
