const { format } = require('date-fns');
const {
  isDate,
  isEpoch,
} = require('./date');

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

    expect(result).toBe(expected);
  });
});

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
      description: 'should return false when input is a string written in scientific notation',
      mockValue: '5e5',
      expected: false,
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
      description: 'should return false when input is more than the Date object maximum value',
      mockValue: 8640000000000001,
      expected: false,
    },
    {
      description: 'should return false when input is more than Date object maximum value stored as string',
      mockValue: '8640000000000001',
      expected: false,
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

  it.each(testData)('$description', ({ mockValue, expected }) => {
    const result = isEpoch(mockValue);

    expect(result).toBe(expected);
  });
});
