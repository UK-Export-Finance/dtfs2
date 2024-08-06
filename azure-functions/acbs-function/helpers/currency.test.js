const { to2Decimals } = require('./currency');

describe('currency helper', () => {
  describe('to2Decimals', () => {
    it('given a number with more than three decimal places returns a number to two decimal places', () => {
      const number = 123.456;
      const result = to2Decimals(number);
      expect(result).toEqual(123.46);
    });

    it('given a number with less than three decimal places returns a number to two decimal places', () => {
      const number = 123.4;
      const result = to2Decimals(number);
      expect(result).toEqual(123.4);
    });

    it('given a number as a string it returns a number to two decimal places', () => {
      const number = '123.456';
      const result = to2Decimals(number);
      expect(result).toEqual(123.46);
    });

    it('given a string that is not a number it returns NaN', () => {
      const number = 'not a number';
      const result = to2Decimals(number);
      expect(result).toEqual(NaN);
    });

    it('given undefined it returns NaN', () => {
      const number = undefined;
      const result = to2Decimals(number);
      expect(result).toEqual(NaN);
    });

    it('given null it returns 0', () => {
      const number = null;
      const result = to2Decimals(number);
      expect(result).toEqual(0);
    });
  });
});
