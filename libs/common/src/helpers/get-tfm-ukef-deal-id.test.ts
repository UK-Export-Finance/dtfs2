import { TfmDeal } from '../types';
import { getTfmUkefDealId } from './get-tfm-ukef-deal-id';
import { DEAL_TYPE } from '../constants';

describe('getTfmUkefDealId', () => {
  it('returns ukefDealId on a TFM GEF deal', () => {
    // Arrange
    const ukefDealId = 'mockDealId';

    const mockDeal = {
      dealSnapshot: {
        dealType: DEAL_TYPE.GEF,
        ukefDealId,
      },
    } as TfmDeal;

    // Act
    const result = getTfmUkefDealId(mockDeal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });

  it('returns ukefDealId on a TFM BSS/EWCS deal', () => {
    // Arrange
    const ukefDealId = 'mockDealId';

    const mockDeal = {
      dealSnapshot: {
        details: {
          ukefDealId,
        },
      },
    } as TfmDeal;

    // Act
    const result = getTfmUkefDealId(mockDeal);

    // Assert
    expect(result).toEqual(ukefDealId);
  });
});
