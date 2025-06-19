import { formattedNumber } from './formatted-number';

describe('formattedNumber', () => {
  it('should return native toLocaleString() result with default 2 min & max fraction digits', () => {
    const number = 123456789123.12;

    const result = formattedNumber(number);

    const expected = number.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    expect(result).toEqual(expected);
  });

  it('should return native toLocaleString() result with given params', () => {
    const number = 123456789123.12;

    const result = formattedNumber(number, 4, 4);

    const expected = number.toLocaleString('en', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    expect(result).toEqual(expected);
  });

  it('should return unchanged value if a number is not given', () => {
    const notNumber = 'abcde';

    // @ts-ignore - testing behavior with non-number input as js files can call this function
    const result = formattedNumber(notNumber);

    expect(result).toEqual(notNumber);
  });
});
