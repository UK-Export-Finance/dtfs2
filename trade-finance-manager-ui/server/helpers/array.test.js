import { sortArrayOfObjectsAlphabetically } from './array';

describe('helpers - array', () => {
  describe('sortArrayOfObjectsAlphabetically', () => {
    it('should return array of objects', () => {
      const arr = [{ firstName: 'Zorro' }, { firstName: 'Steven' }, { firstName: 'Alan' }, { firstName: 'James' }];

      const result = sortArrayOfObjectsAlphabetically(arr, 'firstName');

      const expected = [{ firstName: 'Alan' }, { firstName: 'James' }, { firstName: 'Steven' }, { firstName: 'Zorro' }];

      expect(result).toEqual(expected);
    });
  });
});
