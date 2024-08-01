const { isNumeric, isInteger, decimalsCount, stripDecimals, roundNumber, formattedNumber, sanitizeCurrency } = require('./number');

describe('utils - number', () => {
  describe('isNumeric', () => {
    it('should return true when is a number', () => {
      expect(isNumeric(0.123456789)).toEqual(true);
    });

    it('should return false when NOT a number', () => {
      expect(isNumeric('12')).toEqual(false);
    });
  });

  describe('isInteger', () => {
    it('should return true when is an integer', () => {
      expect(isInteger(123456789)).toEqual(true);
    });

    it('should return false when NOT an integer', () => {
      expect(isInteger(123.4)).toEqual(false);
      expect(isInteger(123.456789)).toEqual(false);
      expect(isInteger(1.234567)).toEqual(false);
    });
  });

  describe('decimalsCount', () => {
    it('should return amount of decimals', () => {
      expect(decimalsCount(12.1)).toEqual(1);
      expect(decimalsCount(12.12345678)).toEqual(8);
    });

    it('should return 0 when no decimals', () => {
      expect(decimalsCount(1)).toEqual(0);
      expect(decimalsCount(1000)).toEqual(0);
    });
  });

  describe('stripDecimals', () => {
    it('should return number without decimals', () => {
      expect(stripDecimals(12345678.1)).toEqual(12345678);
      expect(stripDecimals(12345678.910111234)).toEqual(12345678);
      expect(stripDecimals(12345678)).toEqual(12345678);
    });
  });

  describe('sanitize Currency', () => {
    it('should return sanitized currency', () => {
      expect(sanitizeCurrency(1234)).toEqual({
        sanitizedValue: '1234',
        isCurrency: true,
        decimalPlaces: true,
      });

      expect(sanitizeCurrency('1234')).toEqual({
        sanitizedValue: '1234',
        isCurrency: true,
        decimalPlaces: true,
      });

      expect(sanitizeCurrency('1,234.12')).toEqual({
        sanitizedValue: '1234.12',
        isCurrency: true,
        decimalPlaces: true,
      });

      expect(sanitizeCurrency('abc')).toEqual({
        sanitizedValue: 'abc',
        isCurrency: false,
        decimalPlaces: true,
      });

      expect(sanitizeCurrency('')).toEqual({
        sanitizedValue: '',
        isCurrency: false,
        decimalPlaces: true,
      });

      expect(sanitizeCurrency(null)).toEqual({
        sanitizedValue: '',
        isCurrency: false,
        decimalPlaces: true,
      });
    });
  });

  describe('roundNumber', () => {
    it('should round a number up with passed digits/decimals', () => {
      expect(roundNumber(1234.56, 1)).toEqual(1234.6);
      expect(roundNumber(123456789.996, 2)).toEqual(123456790);
      expect(roundNumber(123456789.996)).toEqual(123456790);
    });

    it('should round a number down', () => {
      expect(roundNumber(1234.01, 1)).toEqual(1234);
      expect(roundNumber(123456.001, 2)).toEqual(123456);
      expect(roundNumber(123456.001)).toEqual(123456);
    });
  });

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
