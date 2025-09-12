const { formattedNumber } = require('@ukef/dtfs2-common');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');

describe('mapGuaranteeFeePayableToUkef', () => {
  it('should return formatted number', () => {
    const mock = '10.1234';
    const result = mapGuaranteeFeePayableToUkef(mock);

    const expected = `${formattedNumber(mock, 4, 4)}%`;
    expect(result).toEqual(expected);
  });
});
