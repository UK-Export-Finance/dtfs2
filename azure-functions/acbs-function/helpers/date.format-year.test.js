const { formatYear } = require('./date');

describe('formatYear', () => {
  const testData = [
    {
      description: 'should return the input as a string when 4 digit number',
      mockValue: 2024,
      expected: '2024',
    },
    {
      description: 'should return the input when 4 digit number stored as a string',
      mockValue: '2024',
      expected: '2024',
    },
    {
      description: 'should return the input when 2 digit number stored as a string',
      mockValue: '24',
      expected: '2024',
    },
    {
      description: 'should return the input as a string when 2 digit number',
      mockValue: 24,
      expected: '2024',
    },
    {
      description: 'should return `2999` when input is 999',
      mockValue: 999,
      expected: '2999',
    },
    {
      description: 'should return `1000` when input is 1000',
      mockValue: 1000,
      expected: '1000',
    },
    {
      description: 'should return `0` when input is -2000',
      mockValue: -2000,
      expected: '0',
    },
    {
      description: 'should return `2000` when input is 0',
      mockValue: 0,
      expected: '2000',
    },
    {
      description: 'should return `2000` when input is -0',
      mockValue: -0,
      expected: '2000',
    },
    {
      description: 'should return `NaN` when input is ``',
      mockValue: '',
      expected: 'NaN',
    },
    {
      description: 'should return undefined when input is undefined',
      mockValue: undefined,
      expected: undefined,
    },
    {
      description: 'should return `NaN` when input is null',
      mockValue: null,
      expected: 'NaN',
    },
    {
      description: 'should return NaN when input is NaN',
      mockValue: NaN,
      expected: NaN,
    },
  ];

  it.each(testData)('$description', ({ mockValue, expected }) => {
    const result = formatYear(mockValue);

    expect(result).toEqual(expected);
  });
});
