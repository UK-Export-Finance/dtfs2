const { CURRENCY, formattedNumber } = require('@ukef/dtfs2-common');
const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

describe('mapSupplyContractValueInGBP', () => {
  it('should return formatted number as string', () => {
    const mockSupplyContractValueInGBP = '7287.56740999854';

    const result = mapSupplyContractValueInGBP(mockSupplyContractValueInGBP);

    const expected = `${CURRENCY.GBP} ${formattedNumber(mockSupplyContractValueInGBP)}`;

    expect(result).toEqual(expected);
  });

  it('should return null when there is no supplyContractValueInGBP', () => {
    const result = mapSupplyContractValueInGBP();

    expect(result).toEqual(null);
  });
});
