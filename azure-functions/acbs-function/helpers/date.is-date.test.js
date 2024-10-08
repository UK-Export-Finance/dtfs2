const { format } = require('date-fns');
const { isDate } = require('./date');

describe('isDate', () => {
  const invalidDateFormats = [
    'dd-MM-yyyy',
    'dd/MM/yyyy',
    'dd MM yyyy',
    'dd-MM-yy',
    'dd/MM/yy',
    'dd MM yy',
    'yyMMdd',
    'yyyyMMdd',
    'yyyy/MM/dd',
    'yyyy MM dd',
    'yy-MM-dd',
    'yy/MM/dd',
    'yy MM dd',
    'yyMMdd',
    'yyyyMMdd',
    'yyyy',
    'yyyy-MM',
  ];

  const date = new Date();

  const testData = invalidDateFormats.map((formatString) => ({
    description: `should return false for a date in the format '${formatString}'`,
    mockString: format(date, formatString),
    expected: false,
  }));

  testData.push(
    {
      description: 'should return true for a date in the format `yyyy-MM-dd`',
      mockString: '2023-10-12',
      expected: true,
    },
    {
      description: 'should return false for a date in the format `yyyy-MM-dd` with day > 31',
      mockString: '2023-10-32',
      expected: false,
    },
    {
      description: 'should return false for a date in the format `yyyy-MM-dd` with month > 12',
      mockString: '2023-14-12',
      expected: false,
    },
    {
      description: 'should return false for `2024-02-30`',
      mockString: '2024-02-30',
      expected: false,
    },
    {
      description: 'should return false for `2023-02-29`',
      mockString: '2023-02-29',
      expected: false,
    },
    {
      description: 'should return false for `Invalid date`',
      mockString: 'Invalid date',
      expected: false,
    },
    {
      description: 'should return true for the maximum date with a four digit year',
      mockString: '9999-12-31',
      expected: true,
    },
    {
      description: 'should return false if the year is 5 digits',
      mockString: '10000-01-01',
      expected: false,
    },
  );

  it.each(testData)('$description', ({ mockString, expected }) => {
    const result = isDate(mockString);

    expect(result).toEqual(expected);
  });
});
