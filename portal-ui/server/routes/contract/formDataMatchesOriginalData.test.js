import {
  formDataMatchesOriginalData,
  isObjectWithChildValues,
  stripEmptyValues,
  getFieldsWithEmptyValues,
  getFieldsFromOriginalData,
} from './formDataMatchesOriginalData';

describe('formDataMatchesOriginalData', () => {
  describe('isObjectWithChildValues', () => {
    it('should return false when an empty object is passed', () => {
      const result = isObjectWithChildValues({});
      expect(result).toEqual(false);
    });

    it('should return true when a populated object is passed', () => {
      const result = isObjectWithChildValues({
        something: 'test',
        hello: 'world',
      });
      expect(result).toEqual(true);
    });
  });

  describe('stripEmptyValues', () => {
    it('should return object with no empty values', () => {
      const mockFields = {
        fieldA: 'test',
        fieldB: 'testing',
        fieldC: 'some value',
        fieldX: 'test',
        fieldY: {
          someField: 'a',
          anotherField: 'b',
        },
      };

      const obj = {
        ...mockFields,
        fieldD: '',
        fieldE: '',
      };

      const originalData = mockFields;

      const result = stripEmptyValues(obj, originalData);
      expect(result).toEqual({
        fieldA: 'test',
        fieldB: 'testing',
        fieldC: 'some value',
        fieldX: 'test',
        fieldY: {
          someField: 'a',
          anotherField: 'b',
        },
      });
    });
  });

  describe('getFieldsWithEmptyValues', () => {
    it('should return object with only fields that have empty values', () => {
      const obj = {
        fieldA: 'test',
        fieldB: 'testing',
        fieldC: 'some value',
        fieldD: '',
        fieldE: '',
      };

      const result = getFieldsWithEmptyValues(obj);
      expect(result).toEqual({
        fieldD: '',
        fieldE: '',
      });
    });
  });

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
        fieldF: 'testing',
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
    it('should return true', () => {
      const formData = {
        someField: 'test',
        anotherField: 'testing',
        testObj: { test: true },
      };

      const originalData = {
        someField: 'test',
        anotherField: 'testing',
        testObj: { test: true },
      };

      const result = formDataMatchesOriginalData(formData, originalData);
      expect(result).toEqual(true);
    });
  });
});
