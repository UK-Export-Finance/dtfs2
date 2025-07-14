import { isNumeric, roundNumber } from './number';

describe('number', () => {
  describe('isNumeric', () => {
    it('should return true when is a number', () => {
      expect(isNumeric(0.123456789)).toEqual(true);
    });

    it('should return false when NOT a number', () => {
      expect(isNumeric('12')).toEqual(false);
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
});
