import { BssEwcsDeal, TfmDeal } from '@ukef/dtfs2-common';
import { getEwcsSupplierType } from '.';

describe('getEwcsSupplierType', () => {
  it('should return the supplier type for a given deal', () => {
    // Arrange
    const mockDeal = {
      dealSnapshot: {
        submissionDetails: {
          'supplier-type': 'Mock Supplier Type',
        },
      },
    } as unknown as TfmDeal;

    // Act
    const result = getEwcsSupplierType(mockDeal);

    // Assert
    const ewcsDeal = mockDeal.dealSnapshot as BssEwcsDeal;

    const expected = String(ewcsDeal.submissionDetails['supplier-type']);

    expect(result).toEqual(expected);
  });
});
