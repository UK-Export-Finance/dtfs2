const {
  formattedNumber,
} = require('./number');

describe('utils - number', () => {
  describe('formattedNumber', () => {
    it('should return native toLocaleString() result with default 2 minimumFractionDigits', () => {
      const number = 123456789123.12;
      const result = formattedNumber(number);
      const expected = number.toLocaleString('en', { minimumFractionDigits: 2 });
      expect(result).toEqual(expected);
    });

    it('should return native toLocaleString() result with given minimumFractionDigits param', () => {
      const number = 123456789123.12;
      const result = formattedNumber(number, 4);
      const expected = number.toLocaleString('en', { minimumFractionDigits: 4 });
      expect(result).toEqual(expected);
    });
  });
});
