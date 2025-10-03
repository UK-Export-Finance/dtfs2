const { format } = require('date-fns');
const { getYearAndMmdd, validDateFormats } = require('./date');

describe('getYearAndMmdd', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1669852800000); // Thu Dec 01 2022 00:00:00 GMT+0000
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const date = new Date('2023-03-02');
  const validDateYearAndMmdd = {
    mmdd: '03-02',
    year: '2023',
  };
  const invalidYearAndMmdd = {
    mmdd: 'Invalid date',
    year: 'Invalid date',
  };
  const currentYearAndMmdd = {
    mmdd: '12-01',
    year: '2022',
  };

  const validStringTestCases = validDateFormats.map((formatString) => ({
    description: `returns correct values when formatted as '${formatString}'`,
    mockValue: format(date, formatString),
    expected: validDateYearAndMmdd,
  }));

  const testData = [
    ...validStringTestCases,
    {
      description: 'should parse number as epoch',
      mockValue: 1677715200000,
      expected: validDateYearAndMmdd,
    },
    {
      description: 'should parse Date object',
      mockValue: date,
      expected: validDateYearAndMmdd,
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-10-32',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-11-31',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2024-02-30',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-02-29',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should not parse if month too big',
      mockValue: '2023-13-12',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should not parse a number bigger than maximum epoch stored as a string',
      mockValue: '8640000000000001',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should parse 0 as current date',
      mockValue: 0,
      expected: currentYearAndMmdd,
    },
    {
      description: 'should not parse positive float stored as a string',
      mockValue: '170895577.7575',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should not parse an epoch followed by non-numeric characters',
      mockValue: '1708955777575##',
      expected: invalidYearAndMmdd,
    },
    {
      description: 'should parse empty string to current date',
      mockValue: '',
      expected: currentYearAndMmdd,
    },
    {
      description: 'should not parse only letters',
      mockValue: 'test',
      expected: invalidYearAndMmdd,
    },
  ];

  it.each(testData)('$description ($mockValue to $expected)', ({ mockValue, expected }) => {
    const result = getYearAndMmdd(mockValue);

    expect(result).toEqual(expected);
  });
});
