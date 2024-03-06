const { format } = require('date-fns');
const { addYear } = require('./date');
const { validDateFormats } = require('../test-helpers/date-formats');

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
      description: 'parses epoch as a string',
      date: testDate.valueOf().toString(),
      yearsToAdd: 1,
      expected: testDatePlusOneYearFormatted,
    },
    {
      description: 'rounds down date if going from 29th Feb to a non-leap year',
      date: '2024-02-29',
      yearsToAdd: 1,
      expected: '2025-02-28',
    },
    {
      description: 'accepts years to add as string',
      date: format(testDate, 'yyyy-MM-dd'),
      yearsToAdd: '1',
      expected: testDatePlusOneYearFormatted,
    },
    {
      description: 'adds 0 years if years to add is string with no numbers',
      date: format(testDate, 'yyyy-MM-dd'),
      yearsToAdd: 'x',
      expected: format(testDate, 'yyyy-MM-dd'),
    },
    {
      description: 'adds 0 years if years to add is empty object',
      date: format(testDate, 'yyyy-MM-dd'),
      yearsToAdd: {},
      expected: format(testDate, 'yyyy-MM-dd'),
    },
    {
      description: 'adds 0 years if years to add is invalid string containing numbers',
      date: format(testDate, 'yyyy-MM-dd'),
      yearsToAdd: '12x1',
      expected: format(testDate, 'yyyy-MM-dd'),
    },
  ];

  it.each(testData)('$description ($date plus $yearsToAdd year(s) gives $expected)', ({ date, yearsToAdd, expected }) => {
    const result = addYear(date, yearsToAdd);

    expect(result).toEqual(expected);
  });
});
