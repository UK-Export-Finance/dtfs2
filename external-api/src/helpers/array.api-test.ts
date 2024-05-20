/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { sortArrayAlphabetically } from './array';

describe('utils - array', () => {
  describe('sortArrayAlphabetically', () => {
    it('should return sorted array', () => {
      const mockArray = [{ mockField: 'x' }, { mockField: 'y' }, { mockField: 'z' }, { mockField: 'e' }, { mockField: 'b' }, { mockField: 'a' }];

      const result = sortArrayAlphabetically(mockArray, 'mockField');

      expect(result).toEqual([{ mockField: 'a' }, { mockField: 'b' }, { mockField: 'e' }, { mockField: 'x' }, { mockField: 'y' }, { mockField: 'z' }]);
    });
  });
});
