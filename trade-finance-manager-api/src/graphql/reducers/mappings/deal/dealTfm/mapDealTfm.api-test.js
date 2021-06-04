const mapDealTfm = require('./mapDealTfm');
const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');
const mapDealProduct = require('./mapDealProduct');

describe('mapDealTfm', () => {
  it('should return mapped object', () => {
    const mockDeal = {
      dealSnapshot: {
        facilities: [],
      },
      tfm: {
        exporterCreditRating: 'Good (BB-)',
        supplyContractValueInGBP: '7287.56740999854',
      },
    };

    const result = mapDealTfm(mockDeal);

    const expected = {
      ...mockDeal.tfm,
      supplyContractValueInGBP: mapSupplyContractValueInGBP(mockDeal.tfm.supplyContractValueInGBP),
      product: mapDealProduct(mockDeal.dealSnapshot),
    };

    expect(result).toEqual(expected);
  });
});
