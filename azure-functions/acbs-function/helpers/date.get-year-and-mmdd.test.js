const { format } = require('date-fns');
const { validDateFormats } = require('../test-helpers/date-formats');
const { getYearAndMmdd } = require('./date');

describe('getYearAndMmdd', () => {
  beforeAll(() => {
    jest.useFakeTimers()
      .setSystemTime(1669852800000); // Thu Dec 01 2022 00:00:00 GMT+0000
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const date = new Date('2023-03-02');
  const invalidYearAndMMdd = {
    mmdd: 'Invalid date',
    year: 'Invalid date',
  };
  const currentYearAndMMdd = {
    mmdd: '12-01',
    year: '2022',
  };
  const maxDateYearAndMMdd = {
    mmdd: '09-13',
    year: '275760',
  };

  const validStringTestCases = validDateFormats.map((formatString) => ({
    description: `returns correct values when formatted as '${formatString}'`,
    mockValue: format(date, formatString),
    expected: { mmdd: '03-02', year: '2023' },
  }));

  const testData = [
    ...validStringTestCases,
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-10-32',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-11-31',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2024-02-30',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should not parse if day of month too big',
      mockValue: '2023-02-29',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should not parse if month too big',
      mockValue: '2023-13-12',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should parse the js maximum date',
      mockValue: '275760-09-13',
      expected: maxDateYearAndMMdd,
    },
    {
      description: 'should not parse a date after the js maximum date',
      mockValue: '275760-09-14',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should parse js maximum epoch',
      mockValue: 8640000000000000,
      expected: maxDateYearAndMMdd,
    },
    {
      description: 'should not parse a number bigger than maximum date',
      mockValue: 8640000000000001,
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should parse the js maximum epoch stored as a string',
      mockValue: '8640000000000000',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should not parse a number bigger than maximum epoch stored as a string',
      mockValue: '8640000000000001',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should parse 0 as current date',
      mockValue: 0,
      expected: currentYearAndMMdd,
    },
    {
      description: 'should not parse negative integer stored as string as epoch',
      mockValue: '-1708955777575',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should not parse positive float stored as a string',
      mockValue: '170895577.7575',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should not parse an epoch followed by non-numeric characters',
      mockValue: '1708955777575##',
      expected: invalidYearAndMMdd,
    },
    {
      description: 'should parse empty string to current date',
      mockValue: '',
      expected: currentYearAndMMdd,
    },
    {
      description: 'should not parse only letters',
      mockValue: 'test',
      expected: invalidYearAndMMdd,
    },
  ];

  it.each(testData)('$description ($mockValue to $expected)', ({ mockValue, expected }) => {
    const result = getYearAndMmdd(mockValue);

    expect(result).toEqual(expected);
  });
});
