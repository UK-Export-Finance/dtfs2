const mapDealTfm = require('./mapDealTfm');
const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');
const mapDealProduct = require('./mapDealProduct');

describe('mapDealTfm', () => {
  it('should return mapped object', () => {
    const mockDeal = {
      dealSnapshot: {},
      tfm: {
        exporterCreditRating: 'Good (BB-)',
        supplyContractValueInGBP: '7287.56740999854',
        facilities: [
          {
            _id: '1',
            facilityType: 'bond',
            productCode: 'BSS',
          },
          {
            _id: '2',
            facilityType: 'bond',
            productCode: 'BSS',
          },
        ],
      },
    };

    const result = mapDealTfm(mockDeal);

    const expected = {
      ...mockDeal.tfm,
      supplyContractValueInGBP: mapSupplyContractValueInGBP(mockDeal.tfm.supplyContractValueInGBP),
      product: mapDealProduct(mockDeal.tfm),
    };

    expect(result).toEqual(expected);
  });
});
