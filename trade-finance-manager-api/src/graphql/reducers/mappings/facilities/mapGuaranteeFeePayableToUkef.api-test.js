const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const { formattedNumber } = require('../../../../utils/number');

describe('mapGuaranteeFeePayableToUkef', () => {
  it('should return formatted number', () => {
    const mock = '10.1234';
    const result = mapGuaranteeFeePayableToUkef(mock);

    const expected = `${formattedNumber(mock, 4, 4)}%`;
    expect(result).toEqual(expected);
  });
});
