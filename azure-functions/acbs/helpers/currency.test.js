const { to2Decimals } = require('./currency');

describe('currency helper', () => {
  describe('to2Decimals', () => {
    it('rounds down when the third decimal place is less than 5', () => {
      const number = 123.454;
      const result = to2Decimals(number);
      expect(result).toEqual(123.45);
    });

    it('rounds down when the third decimal place is 5 or more', () => {
      const number = 123.455;
      const result = to2Decimals(number);
      expect(result).toEqual(123.45);
    });

    it('returns a number to two decimal places when given a number with more than three decimal places ', () => {
      const number = 123.456;
      const result = to2Decimals(number);
      expect(result).toEqual(123.46);
    });

    it('returns a number to two decimal places when given a number with less than three decimal places ', () => {
      const number = 123.4;
      const result = to2Decimals(number);
      expect(result).toEqual(123.4);
    });

    it('returns a number to two decimal places when given a number as a string ', () => {
      const number = '123.456';
      const result = to2Decimals(number);
      expect(result).toEqual(123.46);
    });

    it('returns a number to two decimal places when given a number as a string with multiple commas ', () => {
      const number = '123,456,789.456';
      const result = to2Decimals(number);
      expect(result).toEqual(123456789.46);
    });

    it('returns NaN when given a string that is not a number', () => {
      const number = 'not a number';
      const result = to2Decimals(number);
      expect(result).toEqual(NaN);
    });

    it('returns NaN when given undefined', () => {
      const number = undefined;
      const result = to2Decimals(number);
      expect(result).toEqual(NaN);
    });

    it('returns NaN when given an object', () => {
      const number = {};
      const result = to2Decimals(number);
      expect(result).toEqual(NaN);
    });

    it('returns 0 when given an array', () => {
      const number = [];
      const result = to2Decimals(number);
      expect(result).toEqual(0);
    });

    it('returns 0 given null', () => {
      const number = null;
      const result = to2Decimals(number);
      expect(result).toEqual(0);
    });
  });
});
