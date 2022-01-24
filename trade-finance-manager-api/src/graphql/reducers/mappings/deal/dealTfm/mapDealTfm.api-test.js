const mapDealTfm = require('./mapDealTfm');
const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

describe('mapDealTfm', () => {
  it('should return mapped object', () => {
    const mockDeal = {
      dealSnapshot: {},
      tfm: {
        product: 'BSS & EWCS',
        exporterCreditRating: 'Good (BB-)',
        supplyContractValueInGBP: '7287.56740999854',
        facilities: [
          {
            _id: '1',
            type: 'Bond',
            productCode: 'BSS',
          },
          {
            _id: '2',
            type: 'Bond',
            productCode: 'BSS',
          },
        ],
      },
    };

    const result = mapDealTfm(mockDeal);

    const expected = {
      ...mockDeal.tfm,
      supplyContractValueInGBP: mapSupplyContractValueInGBP(mockDeal.tfm.supplyContractValueInGBP),
    };

    expect(result).toEqual(expected);
  });
});
