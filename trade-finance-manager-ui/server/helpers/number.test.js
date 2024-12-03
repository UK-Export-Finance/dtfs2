import { increment } from './number';

describe('helpers - number', () => {
  describe('increment', () => {
    it('should return incremented number', () => {
      expect(increment(0)).toEqual(1);
      expect(increment(1)).toEqual(2);
      expect(increment(2)).toEqual(3);
    });
  });
});
