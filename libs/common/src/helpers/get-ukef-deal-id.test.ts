import { ObjectId } from 'mongodb';
import { BssEwcsDeal, GefDeal } from '../types';
import { getUkefDealId } from './get-ukef-deal-id';
import { DEAL_TYPE } from '../constants';

describe('getUkefDealId', () => {
  it('returns ukefDealId on a GEF deal', () => {
    // Arrange
    const ukefDealId = 'ukefDealId';

    const deal: GefDeal = {
      _id: new ObjectId(),
      dealType: DEAL_TYPE.GEF,
      ukefDealId,
    };

    // Act
    const result = getUkefDealId(deal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });

  it('returns ukefDealId on a BSS/EWCS deal', () => {
    // Arrange
    const ukefDealId = 'ukefDealId';

    const deal: BssEwcsDeal = {
      _id: new ObjectId(),
      dealType: DEAL_TYPE.BSS_EWCS,
      details: {
        ukefDealId,
      },
    };

    // Act
    const result = getUkefDealId(deal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });
});
