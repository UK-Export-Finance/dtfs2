const {
  isNumeric,
  isInteger,
} = require('../../src/utils/number');

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
});
