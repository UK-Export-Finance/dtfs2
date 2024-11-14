import { DEAL_TYPE, getUkefDealId, TfmDeal, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { aTfmFacility } from '../../../test-helpers';
import { DealCancellationService } from './deal-cancellation.service';

const dealType = DEAL_TYPE.GEF;
const ukefDealId = 'ukefDealId';

describe('DealCancellationService', () => {
  describe('getTfmDealCancellationResponse', () => {
    it('returns the deal and facility ids', () => {
      // Arrange
      const cancelledDeal = { dealSnapshot: { dealType, ukefDealId } } as TfmDeal;
      const riskExpiredFacilityUkefIds = ['facilityId1', 'facilityId2'];

      const mockRepositoryResponse = {
        cancelledDeal,
        riskExpiredFacilities: riskExpiredFacilityUkefIds.map((ukefFacilityId) => ({
          ...aTfmFacility(),
          facilitySnapshot: { ...aTfmFacility().facilitySnapshot, ukefFacilityId },
        })),
      };

      // Act
      const response = DealCancellationService.getTfmDealCancellationResponse(mockRepositoryResponse);

      // Assert
      const expected: TfmDealCancellationResponse = { cancelledDealUkefId: getUkefDealId(cancelledDeal.dealSnapshot) as string, riskExpiredFacilityUkefIds };
      expect(response).toEqual(expected);
    });
  });
});
