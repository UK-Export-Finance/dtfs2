import {
  generateObject,
  generateKeywordQuery,
} from './generate-keyword-query';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/filters - generate-keyword-query', () => {
  describe('generateObject', () => {
    it('should return an object with given fieldName and keywordValue', () => {
      const mockFieldName = CONSTANTS.FIELD_NAMES.DEAL_TYPE;
      const mockKeywordValue = 'test';

      const result = generateObject(
        mockFieldName,
        mockKeywordValue,
      );

      const expected = {
        [mockFieldName]: {
          $regex: mockKeywordValue, $options: 'i',
        },
      };

      expect(result).toEqual(expected);
    });
  });

  describe('generateKeywordQuery', () => {
    it('should return an array of objects with given fieldNames and keywordValue', () => {
      const mockFieldNames = [
        CONSTANTS.FIELD_NAMES.DEAL_TYPE,
        CONSTANTS.FIELD_NAMES.DEAL.EXPORTER_COMPANY_NAME,
      ];

      const mockKeywordValue = 'test';

      const result = generateKeywordQuery(
        mockFieldNames,
        mockKeywordValue,
      );

      const expected = [
        generateObject(
          mockFieldNames[0],
          mockKeywordValue,
        ),
        generateObject(
          mockFieldNames[1],
          mockKeywordValue,
        ),
      ];

      expect(result).toEqual(expected);
    });
  });
});
