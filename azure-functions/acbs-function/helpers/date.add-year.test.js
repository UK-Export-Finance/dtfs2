const { format } = require('date-fns');
const { addYear, validDateFormats } = require('./date');

describe('addYear', () => {
  const testDate = new Date('2024-05-12');
  const testDatePlusOneYearFormatted = '2025-05-12';

  const validTestData = validDateFormats.map((formatString) => ({
    description: `parses date formatted as ${formatString} and adds years correctly`,
    formatString,
    date: format(testDate, formatString),
    yearsToAdd: 1,
    expected: testDatePlusOneYearFormatted,
  }));

  const testData = [
    ...validTestData,
    {
      description: 'parses Date object',
      date: testDate,
      yearsToAdd: 1,
      expected: testDatePlusOneYearFormatted,
    },
    {
      description: 'parses epoch stored as number',
      date: testDate.valueOf(),
      yearsToAdd: 1,
      expected: testDatePlusOneYearFormatted,
    },
    {
      description: 'parses epoch stored as a string',
      date: testDate.valueOf().toString(),
      yearsToAdd: 1,
      expected: testDatePlusOneYearFormatted,
    },
    {
      description: 'does not parse `Invalid date`',
      date: 'Invalid date',
      yearsToAdd: 1,
      expected: 'Invalid date',
    },
    {
      description: 'rounds down date if going from 29th Feb to a non-leap year',
      date: '2024-02-29',
      yearsToAdd: 1,
      expected: '2025-02-28',
    },
    {
      description: 'accepts years to add stored as string',
      date: format(testDate, 'yyyy-MM-dd'),
      yearsToAdd: '1',
      expected: testDatePlusOneYearFormatted,
    },
  ];

  it.each(testData)('$description ($date plus $yearsToAdd year(s) gives $expected)', ({ date, yearsToAdd, expected }) => {
    const result = addYear(date, yearsToAdd);

    expect(result).toEqual(expected);
  });
});
