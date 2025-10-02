const { isString } = require('./date');

describe('isString', () => {
  const testData = [
    {
      description: 'should return false when input is a number',
      mockValue: 8640000000000000,
      expected: false,
    },
    {
      description: 'should return false when input is a number bigger than maximum date',
      mockValue: 8640000000000001,
      expected: false,
    },
    {
      description: 'should return false when input is a number less than maximum Date value stored as a string',
      mockValue: '8640000000000000',
      expected: false,
    },
    {
      description: 'should return false with input `0`',
      mockValue: '0',
      expected: false,
    },
    {
      description: 'should return false with input negative integer stored as string',
      mockValue: '-1708955777575',
      expected: false,
    },
    {
      description: 'should return true when input is positive float stored as a string',
      mockValue: '170895577.7575',
      expected: true,
    },
    {
      description: 'should return true when the input contains any non-numeric characters',
      mockValue: '1708955777575#',
      expected: true,
    },
    {
      description: 'should return true when the input is ``',
      mockValue: '',
      expected: true,
    },
    {
      description: 'should return true when the input only letters',
      mockValue: 'test',
      expected: true,
    },
  ];

  it.each(testData)('$description ($mockValue)', ({ mockValue, expected }) => {
    const result = isString(mockValue);

    expect(result).toEqual(expected);
  });
});
