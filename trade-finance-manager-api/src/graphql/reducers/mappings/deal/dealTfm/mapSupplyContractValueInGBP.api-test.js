const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');
const { formattedNumber } = require('../../../../../utils/number');

describe('mapSupplyContractValueInGBP', () => {
  it('should return formatted number as string', () => {
    const mockSupplyContractValueInGBP = '7287.56740999854';

    const result = mapSupplyContractValueInGBP(mockSupplyContractValueInGBP);

    const expected = `GBP ${formattedNumber(mockSupplyContractValueInGBP)}`;

    expect(result).toEqual(expected);
  });
});
