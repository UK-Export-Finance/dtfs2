import formDataMatchesOriginalData, {
  getFieldsFromOriginalData,
} from './formDataMatchesOriginalData';

describe('formDataMatchesOriginalData', () => {
  describe('getFieldsFromOriginalData', () => {
    it('should return only properties that are in the provided object', () => {
      const obj = {
        fieldA: 'test',
        fieldB: 'testing',
        fieldC: '',
        fieldD: '',
      };

      const originalData = {
        fieldA: 'test',
        fieldB: 'testing',
        fieldC: 'some value',
        fieldD: 'd value',
        fieldE: 'something',
        fieldF: 'tesing',
      };

      const result = getFieldsFromOriginalData(obj, originalData);
      const expected = {
        fieldA: 'test',
        fieldB: 'testing',
        fieldC: 'some value',
        fieldD: 'd value',
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
