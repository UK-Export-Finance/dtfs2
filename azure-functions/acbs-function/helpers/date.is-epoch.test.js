const { isEpoch } = require('./date');

describe('isEpoch', () => {
  const testData = [
    {
      description: 'should return true when input is positive integer stored as a number',
      mockValue: 1708955777575,
      expected: true,
    },
    {
      description: 'should return true when input is positive integer stored as a string',
      mockValue: '1708955777575',
      expected: true,
    },
    {
      description: 'should return true with input 0',
      mockValue: 0,
      expected: true,
    },
    {
      description: 'should return true with input -0',
      mockValue: -0,
      expected: true,
    },
    {
      description: 'should return true with input `0`',
      mockValue: '0',
      expected: true,
    },
    {
      description: 'should return true with input negative integer stored as number',
      mockValue: -1708955777575,
      expected: true,
    },
    {
      description: 'should return true with input negative integer stored as string',
      mockValue: '-1708955777575',
      expected: true,
    },
    {
      description: 'should return false when input is positive float stored as a number',
      mockValue: 170895577.7575,
      expected: false,
    },
    {
      description: 'should return false when input is positive float stored as a string',
      mockValue: '170895577.7575',
      expected: false,
    },
    {
      description: 'should return false when input is < 1 written in scientific notation',
      mockValue: 5e-5,
      expected: false,
    },
    {
      description: 'should return true when input is > 1 and written in scientific notation',
      mockValue: 5e5,
      expected: true,
    },
    {
      description: 'should return true when input is the Date object maximum value',
      mockValue: 8640000000000000, // https://262.ecma-international.org/5.1/#sec-15.9.1.1
      expected: true,
    },
    {
      description: 'should return true when input is the Date object maximum value stored as string',
      mockValue: '8640000000000000', // https://262.ecma-international.org/5.1/#sec-15.9.1.1
      expected: true,
    },
    {
      description: 'should return false when the input contains any non-numeric characters',
      mockValue: '1708955777575#',
      expected: false,
    },
    {
      description: 'should return false when the input is ``',
      mockValue: '',
      expected: false,
    },
    {
      description: 'should return false when the input only letters',
      mockValue: 'test',
      expected: false,
    },
  ];

  it.each(testData)('$description ($mockValue)', ({ mockValue, expected }) => {
    const result = isEpoch(mockValue);

    expect(result).toEqual(expected);
  });
});
