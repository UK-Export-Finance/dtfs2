const {
  createDbQuery,
  createDbQueryKeywordDeals,
} = require('../../../../src/graphql/resolvers/helpers/db-helpers');

describe('/graphql resolvers - helpers - db-helpers', () => {
  describe('createDbQuery', () => {
    it('should return formatted db query object', () => {
      const mockOperator = 'and';
      const mockValue = 'a value';

      const result = createDbQuery(mockOperator, mockValue);

      const expectedOperatorString = `$${mockOperator}`;
      const expected = { [`${expectedOperatorString}`]: mockValue };

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
