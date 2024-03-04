const { format } = require('date-fns');
const { getMonthDifference } = require('./date');
const { validDateFormats, invalidDateFormats } = require('./date.common.test');

describe('getMonthsDifference', () => {
  const mockDate1 = new Date(1709337600000); // Sat Mar 02 2024 00:00:00 GMT+0000
  const mockDate2 = new Date(1712128354000); // Wed Apr 03 2024 08:12:34 GMT+0100

  const invalidStringTestCases = invalidDateFormats.map((formatString) => ({
    description: `does not parse dates formatted as '${formatString}'`,
    date1: format(mockDate1, formatString),
    date2: format(mockDate2, formatString),
    expected: NaN,
  }));

  const firstDateInvalidStringTestCases = invalidDateFormats.map((formatString) => ({
    description: `returns NaN when first date is formatted as '${formatString}' and second is valid`,
    date1: format(mockDate1, formatString),
    date2: format(mockDate2, 'yyyy-MM-dd'),
    expected: NaN,
  }));

  const secondDateInvalidStringTestCases = invalidDateFormats.map((formatString) => ({
    description: `returns NaN when second date is formatted as '${formatString}' and first is valid`,
    date1: format(mockDate1, 'yyyy-MM-dd'),
    date2: format(mockDate2, formatString),
    expected: NaN,
  }));

  const validStringTestCases = validDateFormats.map((formatString) => ({
    description: `calculates difference when formatted as '${formatString}'`,
    date1: format(mockDate1, formatString),
    date2: format(mockDate2, formatString),
    expected: 1,
  }));

  const differentValidDatesTestCases = validDateFormats.map((formatString) => ({
    description: `calculates difference when second date is formatted as '${formatString}' and first as 'yyyy-MM-dd'`,
    date1: format(mockDate1, 'yyyy-MM-dd'),
    date2: format(mockDate2, formatString),
    expected: 1,
  }));

  const testData = [
    ...invalidStringTestCases,
    ...firstDateInvalidStringTestCases,
    ...secondDateInvalidStringTestCases,
    ...validStringTestCases,
    ...differentValidDatesTestCases,
    {
      description: 'calculates difference when dates are Date objects',
      date1: mockDate1,
      date2: mockDate2,
      expected: 1,
    },
    {
      description: 'calculates difference when dates are epochs',
      date1: mockDate1.valueOf(),
      date2: mockDate2.valueOf(),
      expected: 1,
    },
    {
      description: 'does not parse epochs stored as strings',
      date1: mockDate1.valueOf().toString(),
      date2: mockDate2.valueOf().toString(),
      expected: NaN,
    },
    {
      description: 'calculates difference when same dates',
      date1: '2024-03-02',
      date2: '2024-03-02',
      expected: 0,
    },
    {
      description: 'calculates difference when 1st date is after 2nd date',
      date1: '2024-03-02',
      date2: '2024-01-01',
      expected: -2,
    },
    {
      description: 'calculates difference when 1st date is after 2nd date',
      date1: '2024-03-02',
      date2: '2024-01-02',
      expected: -2,
    },
    {
      description: 'calculates difference when 1st date is after 2nd date',
      date1: '2024-03-02',
      date2: '2024-01-03',
      expected: -1,
    },
  ];

  it.each(testData)('$description ($date1 & $date2 to $expected)', ({ date1, date2, expected }) => {
    const result = getMonthDifference(date1, date2);

    expect(result).toBe(expected);
  });
});
