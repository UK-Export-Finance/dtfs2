import { roundNumber } from './round-number';

describe('roundNumber', () => {
  describe('round up', () => {
    it('should round a number up when passed 1', () => {
      const result = roundNumber(1234.56, 1);

      expect(result).toEqual(1234.6);
    });

    it('should round a number up when passed 2', () => {
      const result = roundNumber(123456789.996, 2);

      expect(result).toEqual(123456790);
    });

    it('should round a number up when no second argument is passed', () => {
      const result = roundNumber(123456789.996);

      expect(result).toEqual(123456790);
    });
  });

  describe('round down', () => {
    it('should round a number down when passed 1', () => {
      const result = roundNumber(1234.01, 1);

      expect(result).toEqual(1234);
    });

    it('should round a number down when passed 2', () => {
      const result = roundNumber(123456.001, 2);

      expect(result).toEqual(123456);
    });

    it('should round a number down when no second argument is passed', () => {
      const result = roundNumber(123456.001);

      expect(result).toEqual(123456);
    });
  });
});
