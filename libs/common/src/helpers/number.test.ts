import { isNotValidNumber } from './number';

describe('helpers/number', () => {
  describe('isNotValidNumber', () => {
    it('should return true if value is null', () => {
      expect(isNotValidNumber(null)).toBe(true);
    });

    it('should return true if value is undefined', () => {
      expect(isNotValidNumber(undefined)).toBe(true);
    });

    it('should return true if value is NaN', () => {
      expect(isNotValidNumber(NaN)).toBe(true);
    });

    it('should return true if value is not a number', () => {
      // @ts-ignore - testing if value is not a number
      expect(isNotValidNumber('string')).toBe(true);
    });

    it('should return false if value is a valid number', () => {
      expect(isNotValidNumber(123)).toBe(false);
    });
  });
});
