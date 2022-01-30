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
            _id: '61f6b18502ffda01b1e8f07f',
            type: 'Bond',
            productCode: 'BSS',
          },
          {
            _id: '61f6b18502ffda01b1e8f07g',
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
