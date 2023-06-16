import { sortArrayAlphabetically } from './array.util';

describe('utils - array', () => {
  describe('sortArrayAlphabetically', () => {
    it('should return sorted array', async () => {
      const mockArray = [{ mockField: 'x' }, { mockField: 'y' }, { mockField: 'z' }, { mockField: 'e' }, { mockField: 'b' }, { mockField: 'a' }];

      const result = sortArrayAlphabetically(mockArray, 'mockField');

      expect(result).toEqual([{ mockField: 'a' }, { mockField: 'b' }, { mockField: 'e' }, { mockField: 'x' }, { mockField: 'y' }, { mockField: 'z' }]);
    });
  });
});
