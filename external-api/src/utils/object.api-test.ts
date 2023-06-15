import { objectIsEmpty } from './object.util';

describe('utils - object', () => {
  describe('objectIsEmpty', () => {
    it('should return true when object is empty', async () => {
      const result = objectIsEmpty({});

      expect(result).toEqual(true);
    });

    it('should return true when there is no object', async () => {
      const result = objectIsEmpty({});

      expect(result).toEqual(true);
    });

    it('should return false when object has values', async () => {
      const result = objectIsEmpty({
        test: true,
      });

      expect(result).toEqual(false);
    });
  });
});
