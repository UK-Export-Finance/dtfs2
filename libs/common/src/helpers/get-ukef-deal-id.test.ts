import { BssEwcsDeal, GefDeal } from '@ukef/types';
import { DEAL_TYPE } from '@ukef/constants';
import { getUkefDealId } from './get-ukef-deal-id';

describe('getUkefDealId', () => {
  it('should return ukefDealId on a BSS/EWCS deal', () => {
    // Arrange
    const ukefDealId = 'mockBssEwcsDealId';

    const mockDeal = {
      dealType: DEAL_TYPE.BSS_EWCS,
      details: {
        ukefDealId,
      },
    } as BssEwcsDeal;

    // Act
    const result = getUkefDealId(mockDeal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });

  it('should return ukefDealId on a GEF deal', () => {
    // Arrange
    const ukefDealId = 'mockGefDealId';

    const mockDeal = {
      dealType: DEAL_TYPE.GEF,
      ukefDealId,
    } as GefDeal;

    // Act
    const result = getUkefDealId(mockDeal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });
});
