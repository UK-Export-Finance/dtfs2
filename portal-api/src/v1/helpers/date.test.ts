import {
  getDateAsEpochMillisecondString,
  getStartOfDateFromDayMonthYearStrings,
  getStartOfDateFromDayMonthYearStringsReplicatingMoment,
  getLongFormattedDate,
  getStartOfDateFromEpochMillisecondString,
} from './date';

describe('getDateAsEpochMillisecondString', () => {
  it('returns GMT a date correctly', () => {
    const mockDate = new Date(1708010212227); // Thu Feb 15 2024 15:16:52 GMT+0000

    const result = getDateAsEpochMillisecondString(mockDate);

    expect(result).toEqual('1708010212227');
  });

  it('returns BST a date correctly', () => {
    const mockDate = new Date(2023, 7, 12); // Sat Aug 12 2023 00:00:00 GMT+0100

    const result = getDateAsEpochMillisecondString(mockDate);

    expect(result).toEqual('1691794800000');
  });
});

describe('getStartOfDateFromEpochMillisecondString', () => {
  it('returns GMT time correctly', () => {
    const mockTimeStamp = '1708010212227'; // Thu Feb 15 2024 15:16:52 GMT+0000

    const result = getStartOfDateFromEpochMillisecondString(mockTimeStamp);

    expect(result).toEqual(new Date(1707955200000));
  });

  it('returns BST time correctly', () => {
    const mockTimeStamp = '1721042293000'; // Mon Jul 15 2024 12:18:13 GMT+0100

    const result = getStartOfDateFromEpochMillisecondString(mockTimeStamp);

    expect(result).toEqual(new Date(1720998000000));
  });

  it('handles leap years correctly', () => {
    const mockTimeStamp = '1709209093000'; // Thu Feb 29 2024 12:18:13 GMT+0000

    const result = getStartOfDateFromEpochMillisecondString(mockTimeStamp);

    expect(result).toEqual(new Date(1709164800000));
  });
});

describe('getStartOfDateFromDayMonthYearStrings', () => {
  it('returns GMT time correctly', () => {
    const mockDay = '12';
    const mockMonth = '02';
    const mockYear = '2022';

    const result = getStartOfDateFromDayMonthYearStrings(mockDay, mockMonth, mockYear);

    const expectedEpoch = 1644624000000; // Sat Feb 12 2022 00:00:00 GMT+0000
    expect(result.valueOf()).toEqual(expectedEpoch);
  });

  it('returns BST time correctly', () => {
    const mockDay = '12';
    const mockMonth = '05';
    const mockYear = '2022';

    const result = getStartOfDateFromDayMonthYearStrings(mockDay, mockMonth, mockYear);

    const expectedEpoch = 1652310000000; // Thu May 12 2022 00:00:00 GMT+0100
    expect(result.valueOf()).toEqual(expectedEpoch);
  });

  it('handles leap years correctly', () => {
    const mockDay = '29';
    const mockMonth = '02';
    const mockYear = '2024';

    const result = getStartOfDateFromDayMonthYearStrings(mockDay, mockMonth, mockYear);

    const expectedEpoch = 1709164800000; // Thu Feb 29 2024 00:00:00 GMT+0000
    expect(result.valueOf()).toEqual(expectedEpoch);
  });
});

describe('getStartOfDateFromDayMonthYearStringsReplicatingMoment', () => {
  const mockDay = '12';
  const mockMonth = '11';
  const mockYear = '2022';

  describe('when currentDate is 8th March 2023', () => {
    beforeAll(() => {
      jest.useFakeTimers()
        .setSystemTime(new Date('2023-03-08'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    const testData = [
      {
        description: 'returns the correct value when given valid dates',
        day: mockDay,
        month: mockMonth,
        year: mockYear,
        expectedEpoch: 1668211200000, // Sat Nov 12 2022 00:00:00 GMT+0000 
      },
      {
        description: 'returns NaN when given an invalid month',
        day: mockDay,
        month: '##',
        year: mockYear,
        expectedEpoch: NaN,
      },
    ]

    it.each(testData)('$description', ({ day, month, year, expectedEpoch }) => {
      const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment(day, month, year);
  
      expect(result.valueOf()).toEqual(expectedEpoch);
    });
  
    describe('should maintain moment js behaviour for date construction', () => {
      const momentBehaviourTestData = [
        {
          description: 'should use todays date if invalid date',
          day: '##',
          month: mockMonth,
          year: mockYear,
          expectedEpoch: 1667865600000, // Tue Nov 08 2022 00:00:00 GMT+0000
        },
        {
          description: 'should use the current year if invalid year',
          day: mockDay,
          month: mockMonth,
          year: '##',
          expectedEpoch: 1699747200000, // Sun Nov 12 2023 00:00:00 GMT+0000
        },
        {
          description: 'should round wrap date if too large for the month',
          day: '31',
          month: '02',
          year: '2023',
          expectedEpoch: 1677801600000, // Fri Mar 03 2023 00:00:00 GMT+0000
        },
      ];

      it.each(momentBehaviourTestData)('$description', ({ day, month, year, expectedEpoch }) => {
        const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment(day, month, year);
    
        expect(result.valueOf()).toEqual(expectedEpoch);
      });
    });
  });

  describe('when currentDate is 29th February 2024', () => {
    beforeAll(() => {
      jest.useFakeTimers()
        .setSystemTime(new Date('2024-02-29'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns NaN when given an invalid month', () => {
      const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment(mockDay, '##', mockYear);
  
      expect(result.valueOf()).toEqual(NaN);
    });
  
    describe('should maintain moment js behaviour for date construction', () => {
      it('should use the 28th if invalid date', () => {
        const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment('##', mockMonth, mockYear);
  
        const expectedEpoch = 1669593600000; // Thu Dec 01 2022 00:00:00 GMT+0000
        expect(result.valueOf()).toEqual(expectedEpoch);
      });
  
      it('should use the current year if invalid year', () => {
        const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment(mockDay, mockMonth, '####');
  
        const expectedEpoch = 1731369600000; // Tue Nov 12 2024 00:00:00 GMT+0000
        expect(result.valueOf()).toEqual(expectedEpoch);
      });
    });
  });

  describe('when current date is 31st December', () => {
    beforeAll(() => {
      jest.useFakeTimers()
        .setSystemTime(new Date('2024-12-31'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns NaN when given an invalid month', () => {
      const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment(mockDay, '##', mockYear);
  
      expect(result.valueOf()).toEqual(NaN);
    });
  
    describe('should maintain moment js behaviour for date construction', () => {
      it('should use todays date if invalid date, and wrap to the next month', () => {
        const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment('##', mockMonth, mockYear);
  
        const expectedEpoch = 1669852800000; // Thu Dec 01 2022 00:00:00 GMT+0000
        expect(result.valueOf()).toEqual(expectedEpoch);
      });
  
      it('should use the current year if invalid year', () => {
        const result = getStartOfDateFromDayMonthYearStringsReplicatingMoment(mockDay, mockMonth, '####');
  
        const expectedEpoch = 1731369600000; // Tue Nov 12 2024 00:00:00 GMT+0000
        expect(result.valueOf()).toEqual(expectedEpoch);
      });
    });
  });
});

describe('getLongFormattedDate', () => {
  it('returns date formatted correctly', () => {
    const mockDate = new Date(1721042293000); // Mon Jul 15 2024 12:18:13 GMT+0100
    
    const result = getLongFormattedDate(mockDate);

    expect(result).toBe('15th July 2024');
  });
});
