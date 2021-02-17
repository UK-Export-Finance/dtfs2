const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const { formattedNumber } = require('../../../../utils/number');

describe('mapGuaranteeFeePayableToUkef', () => {
  it('should return formatted guaranteeFeePayableByBank', () => {
    const mock = '10.8000';
    const result = mapGuaranteeFeePayableToUkef(mock);

    const expected = `${formattedNumber(mock)}%`;
    expect(result).toEqual(expected);
  });
});
