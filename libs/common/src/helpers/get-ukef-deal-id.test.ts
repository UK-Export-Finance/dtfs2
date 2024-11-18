import { BssEwcsDeal, GefDeal } from '../types';
import { getUkefDealId } from './get-ukef-deal-id';
import { DEAL_TYPE } from '../constants';

describe('getUkefDealId', () => {
  it('returns ukefDealId on a GEF deal', () => {
    // Arrange
    const ukefDealId = 'ukefDealId';

    const deal = {
      dealType: DEAL_TYPE.GEF,
      ukefDealId,
    } as GefDeal;

    // Act
    const result = getUkefDealId(deal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });

  it('returns ukefDealId on a BSS/EWCS deal', () => {
    // Arrange
    const ukefDealId = 'ukefDealId';

    const deal = {
      dealType: DEAL_TYPE.BSS_EWCS,
      details: {
        ukefDealId,
      },
    } as BssEwcsDeal;

    // Act
    const result = getUkefDealId(deal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });
});
