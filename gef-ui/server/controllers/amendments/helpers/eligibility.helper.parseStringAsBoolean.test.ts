import { parseStringAsBoolean } from './eligibility.helper.ts';

describe('parseStringAsBoolean', () => {
  const testCases = [
    {
      description: 'should return a true boolean when the string is "true"',
      value: 'true',
      expected: true,
    },
    {
      description: 'should return a false boolean when the string is "false"',
      value: 'false',
      expected: false,
    },
    {
      description: 'should return null when the string is empty',
      value: '',
      expected: null,
    },
    {
      description: 'should return null when the string is "asdf"',
      value: 'asdf',
      expected: null,
    },
    {
      description: 'should return null when the string is "True"',
      value: 'True',
      expected: null,
    },
    {
      description: 'should return null when the string is "False"',
      value: 'False',
      expected: null,
    },
    {
      description: 'should return null when the string is empty',
      value: '',
      expected: null,
    },
  ];

  it.each(testCases)('$description', ({ value, expected }) => {
    // Act
    const result = parseStringAsBoolean(value);

    // Assert
    expect(result).toEqual(expected);
  });
});
