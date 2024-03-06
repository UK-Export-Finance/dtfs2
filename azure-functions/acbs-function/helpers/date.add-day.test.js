const { format } = require('date-fns');
const { addDay } = require('./date');
const { validDateFormats } = require('../test-helpers/date-formats');

describe('addDay', () => {
  const testDay = new Date('2024-05-12');
  const testDayPlusOneFormatted = '2024-05-13';

  const validTestData = validDateFormats.map((formatString) => ({
    description: `parses date formatted as ${formatString} and adds days correctly`,
    formatString,
    date: format(testDay, formatString),
    daysToAdd: 1,
    expected: testDayPlusOneFormatted,
  }));

  const testData = [
    ...validTestData,
    {
      description: 'parses Date object',
      date: testDay,
      daysToAdd: 1,
      expected: testDayPlusOneFormatted,
    },
    {
      description: 'parses epoch stored as number',
      date: testDay.valueOf(),
      daysToAdd: 1,
      expected: testDayPlusOneFormatted,
    },
    {
      description: 'parses epoch as a string',
      date: testDay.valueOf().toString(),
      daysToAdd: 1,
      expected: testDayPlusOneFormatted,
    },
    {
      description: 'adds 31 days and returns the next month',
      date: '2024-12-01',
      daysToAdd: 31,
      expected: '2025-01-01',
    },
    {
      description: 'handles leap years',
      date: '2024-02-28',
      daysToAdd: 1,
      expected: '2024-02-29',
    },
    {
      description: 'accepts days to add as string',
      date: format(testDay, 'yyyy-MM-dd'),
      daysToAdd: '1',
      expected: testDayPlusOneFormatted,
    },
    {
      description: 'adds 0 days if days to add is string with no numbers',
      date: format(testDay, 'yyyy-MM-dd'),
      daysToAdd: 'x',
      expected: format(testDay, 'yyyy-MM-dd'),
    },
    {
      description: 'adds 0 days if days to add is empty object',
      date: format(testDay, 'yyyy-MM-dd'),
      daysToAdd: {},
      expected: format(testDay, 'yyyy-MM-dd'),
    },
    {
      description: 'adds 0 days if days to add is invalid string containing numbers',
      date: format(testDay, 'yyyy-MM-dd'),
      daysToAdd: '12x1',
      expected: format(testDay, 'yyyy-MM-dd'),
    },
  ];

  it.each(testData)('$description ($date plus $daysToAdd day(s) gives $expected)', ({ date, daysToAdd, expected }) => {
    const result = addDay(date, daysToAdd);

    expect(result).toEqual(expected);
  });
});
