const { dbHelpers } = require('../../../src/graphql/resolvers/helpers');

const queryWithOperator = {
  operator: 'ne',
  field: 'mockField',
  value: ['value'],
};

describe('/graphql database helper', () => {
  it('converts graphql query into valid db query', () => {
    const result = dbHelpers.createDbQuery(
      queryWithOperator.operator,
      queryWithOperator.field,
      queryWithOperator.value,
    );

    const expected = {
      [`$${queryWithOperator.operator}`]: [
        {
          [queryWithOperator.field]: queryWithOperator.value[0],
        },
      ],
    };

    expect(result).toEqual(expected);
  });
});
