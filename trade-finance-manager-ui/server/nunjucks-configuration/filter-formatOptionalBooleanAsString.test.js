import formatOptionalBooleanAsString from './filter-formatOptionalBooleanAsString';

describe('nunjuck filters - formatBooleanAsString', () => {
  const testCases = [
    { description: 'true', input: true, expectedOutput: 'Yes' },
    { description: 'false', input: false, expectedOutput: 'No' },
    { description: 'undefined', input: undefined, expectedOutput: '-' },
  ];

  it.each(testCases)(`should return $expectedOutput when input is $description`, ({ input, expectedOutput }) => {
    const result = formatOptionalBooleanAsString(input);
    expect(result).toEqual(expectedOutput);
  });
});
