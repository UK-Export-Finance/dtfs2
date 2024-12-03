const { format } = require('date-fns');
const { formatDate, validDateFormats } = require('./date');

describe('formatDate', () => {
  const date = new Date();

  const validStringTestCases = validDateFormats.map((formatString) => ({
    description: `should parse the date correctly when input is formatted as '${formatString}'`,
    mockValue: format(date, formatString),
    expected: format(date, 'yyyy-MM-dd'),
  }));

  const testData = [
    ...validStringTestCases,
    {
      description: 'should parse null as legacy implimentation',
      mockValue: null,
      expected: '1970-01-01',
    },
    {
      description: 'should parse undefined as legacy implimentation',
      mockValue: undefined,
      expected: 'Invalid date',
    },
    {
      description: 'should parse `0` as epoch',
      mockValue: '0',
      expected: '1970-01-01',
    },
    {
      description: 'should parse 0 as epoch',
      mockValue: 0,
      expected: '1970-01-01',
    },
    {
      description: 'should parse iso date with zulu time',
      mockValue: '2024-03-14T00:00:00Z',
      expected: '2024-03-14',
    },
    {
      description: 'should parse iso date with timezone',
      mockValue: '2024-03-14T00:00:00+00:00',
      expected: '2024-03-14',
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-10-32',
      expected: 'Invalid date',
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-11-31',
      expected: 'Invalid date',
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2024-02-30',
      expected: 'Invalid date',
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-02-29',
      expected: 'Invalid date',
    },
    {
      description: 'should not parse if month too big',
      mockValue: '2023-13-12',
      expected: 'Invalid date',
    },
    {
      description: 'should parse negative integer stored as string as epoch',
      mockValue: '-1708955777575',
      expected: '1915-11-06',
    },
    {
      description: 'should not parse positive float stored as a string',
      mockValue: '170895577.7575',
      expected: 'Invalid date',
    },
    {
      description: 'should not parse an epoch followed by non-numeric characters',
      mockValue: '1708955777575##',
      expected: 'Invalid date',
    },
    {
      description: 'should not parse empty string',
      mockValue: '',
      expected: 'Invalid date',
    },
    {
      description: 'should not parse only letters',
      mockValue: 'test',
      expected: 'Invalid date',
    },
  ];

  it.each(testData)('$description ($mockValue to $expected)', ({ mockValue, expected }) => {
    const result = formatDate(mockValue);

    expect(result).toEqual(expected);
  });
});
