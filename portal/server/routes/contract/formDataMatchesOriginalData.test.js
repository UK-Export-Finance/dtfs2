import formDataMatchesOriginalData, {
  stripEmptyValuesFromObject,
} from './formDataMatchesOriginalData';

describe('formDataMatchesOriginalData', () => {
  describe('stripEmptyValuesFromObject', () => {
    it('should remove empty values from an object that are not in second (originalData) object', () => {
      const obj = {
        someField: 'test',
        anotherField: 'testing',
        emptyField: '',
        anotherEmptyField: '',
      };

      const originalData = {
        someField: 'test',
        anotherField: 'testing',
        emptyField: '',
      };

      const result = stripEmptyValuesFromObject(obj, originalData);
      const expected = {
        someField: 'test',
        anotherField: 'testing',
        emptyField: '',
      };
      expect(result).toEqual(expected);
    });
  });

  describe('when formData and originalData objects are different', () => {
    it('should return false', () => {
      const formData = {
        someField: 'test',
        anotherField: 'testing',
      };

      const originalData = {
        someField: 'test1',
        anotherField: 'testing',
      };

      const result = formDataMatchesOriginalData(formData, originalData);
      expect(result).toEqual(false);
    });
  });

  describe('when formData and originalData objects match', () => {
    it('should return false', () => {
      const formData = {
        someField: 'test',
        anotherField: 'testing',
      };

      const originalData = {
        someField: 'test',
        anotherField: 'testing',
      };

      const result = formDataMatchesOriginalData(formData, originalData);
      expect(result).toEqual(true);
    });
  });
});
