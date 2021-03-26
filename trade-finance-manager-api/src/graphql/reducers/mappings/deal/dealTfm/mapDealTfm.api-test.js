const mapDealTfm = require('./mapDealTfm');
const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

describe('mapDealTfm', () => {
  it('should return mapepd object', () => {
    const mockDealTfm = {
      exporterCreditRating: 'Good (BB-)',
      supplyContractValueInGBP: '7287.56740999854',
    };

    const result = mapDealTfm(mockDealTfm);

    const expected = {
      ...mockDealTfm,
      supplyContractValueInGBP: mapSupplyContractValueInGBP(mockDealTfm.supplyContractValueInGBP),
    };

    expect(result).toEqual(expected);
  });
});
