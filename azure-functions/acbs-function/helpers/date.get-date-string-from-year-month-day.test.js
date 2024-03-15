const { getDateStringFromYearMonthDay } = require('./date');

describe('getDateStringFromYearMonthDay', () => {
  const testData = [
    {
      description: 'returns date when inputs are valid strings with leading zeroes',
      year: '2024',
      month: '02',
      day: '02',
      expected: '2024-02-02',
    },
    {
      description: 'returns date when inputs are valid strings without leading zeroes',
      year: '2024',
      month: '2',
      day: '2',
      expected: '2024-02-02',
    },
    {
      description: 'returns date when inputs are valid numbers',
      year: 2024,
      month: 2,
      day: 12,
      expected: '2024-02-12',
    },
    {
      description: 'returns date when year is given as two digits',
      year: 24,
      month: 2,
      day: 12,
      expected: '2024-02-12',
    },
    {
      description: 'does not parse if the day is too large for the month',
      year: 2024,
      month: 2,
      day: 30,
      expected: 'Invalid date',
    },
    {
      description: 'does not parse a month is bigger than 12',
      year: 2024,
      month: 13,
      day: 1,
      expected: 'Invalid date',
    },
    {
      description: 'parses the js maximum date correctly',
      year: 275760,
      month: 9,
      day: 13,
      expected: '275760-09-13',
    },
    {
      description: 'does not parse a date bigger than js maximum date',
      year: 275760,
      month: 9,
      day: 14,
      expected: 'Invalid date',
    },
    {
      description: 'does not parse if the day is undefined',
      year: 2024,
      month: 2,
      day: undefined,
      expected: 'Invalid date',
    },
    {
      description: 'does not parse if the month is undefined',
      year: 2024,
      month: undefined,
      day: 12,
      expected: 'Invalid date',
    },
    {
      description: 'does not parse if the year is undefined',
      year: undefined,
      month: 2,
      day: 12,
      expected: 'Invalid date',
    },
    {
      description: 'does not parse if the month is 0',
      year: 2024,
      month: 0,
      day: 12,
      expected: 'Invalid date',
    },
    {
      description: 'does not parse if the day is 0',
      year: 2024,
      month: 2,
      day: 0,
      expected: 'Invalid date',
    },
  ];

  it.each(testData)('$description ($year, $month, $day returns $expected)', ({ year, month, day, expected }) => {
    const result = getDateStringFromYearMonthDay(year, month, day);

    expect(result).toBe(expected);
  });
});
