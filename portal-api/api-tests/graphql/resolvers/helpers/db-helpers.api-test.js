const {
  formatFieldValue,
  createDbQuery,
  createDbQueryKeywordDeals,
} = require('../../../../src/graphql/resolvers/helpers/db-helpers');

describe('/graphql resolvers - helpers - db-helpers', () => {
  describe('formatFieldValue', () => {
    it('should return a string with `false` boolean value, as a boolean', () => {
      const mockValue = 'false';
      const result = formatFieldValue(mockValue);

      expect(result).toEqual(false);
    });

    it('should return a string with `true` boolean value, as a boolean', () => {
      const mockValue = 'true';
      const result = formatFieldValue(mockValue);

      expect(result).toEqual(true);
    });

    it('should return a string', () => {
      const mockValue = 'test';
      const result = formatFieldValue(mockValue);

      expect(result).toEqual(mockValue);
    });
  });

  describe('createDbQuery', () => {
    it('should return formatted db query object', () => {
      const mockOperator = 'and';
      const mockField = 'fieldName';
      const mockValue = ['first value', 'second value'];

      const result = createDbQuery(mockOperator, mockField, mockValue);

      const expectedOperatorString = `$${mockOperator}`;
      const expected = {
        [`${expectedOperatorString}`]: [
          { [mockField]: mockValue[0] },
          { [mockField]: mockValue[1] },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('createDbQueryKeywordDeals', () => {
    it('should return an object with multiple $or regex filters', () => {
      const mockKeyword = 'testing';

      const result = createDbQueryKeywordDeals(mockKeyword);

      const expected = {
        '$or': [
          { 'bankInternalRefName': { $regex: mockKeyword, $options: 'i' } },
          { 'status': { $regex: mockKeyword, $options: 'i' } },
          { 'dealType': { $regex: mockKeyword, $options: 'i' } },
          { 'submissionType': { $regex: mockKeyword, $options: 'i' } },
          { 'exporter.companyName': { $regex: mockKeyword, $options: 'i' } },
        ],
      };

      expect(result).toEqual(expected);
    });
  });
});
