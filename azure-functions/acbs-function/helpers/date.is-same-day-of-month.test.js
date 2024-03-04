const { format } = require('date-fns');
const { isSameDayOfMonth } = require('./date');
const { validDateFormats, invalidDateFormats } = require('./date.common.test');

describe('isSameDayOfMonth', () => {
  const mockDate1 = new Date(1709337600000); // Sat Mar 02 2024 00:00:00 GMT+0000
  const mockDate2 = new Date(1712041954000); // Tue Apr 02 2024 08:12:34 GMT+0100

  const invalidStringTestCases = invalidDateFormats.map((formatString) => ({
    description: `does not parse dates formatted as '${formatString}'`,
    date1: format(mockDate1, formatString),
    date2: format(mockDate2, formatString),
    expected: false,
  }));

  const firstDateInvalidStringTestCases = invalidDateFormats.map((formatString) => ({
    description: `returns false when first date is formatted as '${formatString}' and second is valid`,
    date1: format(mockDate1, formatString),
    date2: format(mockDate2, 'yyyy-MM-dd'),
    expected: false,
  }));

  const secondDateInvalidStringTestCases = invalidDateFormats.map((formatString) => ({
    description: `returns false when second date is formatted as '${formatString}' and first is valid`,
    date1: format(mockDate1, 'yyyy-MM-dd'),
    date2: format(mockDate2, formatString),
    expected: false,
  }));

  const validStringTestCases = validDateFormats.map((formatString) => ({
    description: `calculates correctly when formatted as '${formatString}'`,
    date1: format(mockDate1, formatString),
    date2: format(mockDate2, formatString),
    expected: true,
  }));

  const differentValidDatesTestCases = validDateFormats.map((formatString) => ({
    description: `calculates correctly when second date is formatted as '${formatString}' and first as 'yyyy-MM-dd'`,
    date1: format(mockDate1, 'yyyy-MM-dd'),
    date2: format(mockDate2, formatString),
    expected: true,
  }));

  const testData = [
    ...invalidStringTestCases,
    ...firstDateInvalidStringTestCases,
    ...secondDateInvalidStringTestCases,
    ...validStringTestCases,
    ...differentValidDatesTestCases,
    {
      description: 'calculates correctly when dates are Date objects',
      date1: mockDate1,
      date2: mockDate2,
      expected: true,
    },
    {
      description: 'calculates correctly when dates are epochs',
      date1: mockDate1.valueOf(),
      date2: mockDate2.valueOf(),
      expected: true,
    },
    {
      description: 'does not parse epochs stored as strings',
      date1: mockDate1.valueOf().toString(),
      date2: mockDate2.valueOf().toString(),
      expected: false,
    },
    {
      description: 'calculates correctly when same dates',
      date1: '2024-03-02',
      date2: '2024-03-02',
      expected: true,
    },
    {
      description: 'calculates correctly when different day of the month',
      date1: '2024-03-02',
      date2: '2024-03-01',
      expected: false,
    },
    {
      description: 'calculates correctly when 1st date is after 2nd date',
      date1: '2024-03-02',
      date2: '2024-01-02',
      expected: true,
    },
    {
      description: 'calculates correctly when 1st date is after 2nd date',
      date1: '2024-03-02',
      date2: '2024-01-03',
      expected: false,
    },
  ];

  it.each(testData)('$description ($date1 & $date2 to $expected)', ({ date1, date2, expected }) => {
    const result = isSameDayOfMonth(date1, date2);

    expect(result).toBe(expected);
  });
});
