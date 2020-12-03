const { dbHelpers } = require('../../../src/graphql/resolvers/helpers');

const queryWithOperator = {
  value: 'value',
  operator: 'ne',
};

describe('/graphql database helper', () => {
  it('converts graphql query into valid db query', () => {
    expect(dbHelpers.createDbQuery(queryWithOperator.operator, queryWithOperator.value)).toEqual({
      [`$${queryWithOperator.operator}`]: queryWithOperator.value,
    });
  });
});
