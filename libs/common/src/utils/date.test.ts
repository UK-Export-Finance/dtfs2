import { getOneIndexedMonth, isValidIsoMonth, isValidIsoYear, toIsoMonthStamp, toMonthYearString } from './date';

describe('date utils', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getOneIndexedMonth', () => {
    it.each([
      { date: new Date(2023, 0), expectedOneIndexMonth: 1 },
      { date: new Date(2023, 1), expectedOneIndexMonth: 2 },
      { date: new Date(2023, 2), expectedOneIndexMonth: 3 },
      { date: new Date(2023, 3), expectedOneIndexMonth: 4 },
      { date: new Date(2023, 4), expectedOneIndexMonth: 5 },
      { date: new Date(2023, 5), expectedOneIndexMonth: 6 },
      { date: new Date(2023, 6), expectedOneIndexMonth: 7 },
      { date: new Date(2023, 7), expectedOneIndexMonth: 8 },
      { date: new Date(2023, 8), expectedOneIndexMonth: 9 },
      { date: new Date(2023, 9), expectedOneIndexMonth: 10 },
      { date: new Date(2023, 10), expectedOneIndexMonth: 11 },
      { date: new Date(2023, 11), expectedOneIndexMonth: 12 },
    ])('should return $expectedOneIndexMonth when the date is', ({ date, expectedOneIndexMonth }) => {
      expect(getOneIndexedMonth(date)).toEqual(expectedOneIndexMonth);
    });
  });

  describe('isValidIsoMonth', () => {
    it.each(['2023-11-01', '2023-13', '202-11', 'invalid', '', 202311, undefined, null, ['2023-11'], { date: '2023-11' }])(
      'returns false when the value is %p',
      (value) => {
        expect(isValidIsoMonth(value)).toEqual(false);
      },
    );

    it('returns true when a valid ISO month value is provided', () => {
      expect(isValidIsoMonth('2023-11')).toEqual(true);
    });
  });

  describe('toIsoMonthStamp', () => {
    it.each([
      { date: new Date(2024, 1), expectedIsoMonthStamp: '2024-02' },
      { date: new Date(2024, 1, 29), expectedIsoMonthStamp: '2024-02' },
      { date: new Date('2023-03'), expectedIsoMonthStamp: '2023-03' },
      { date: new Date('2023-03-31'), expectedIsoMonthStamp: '2023-03' },
    ])(`converts Date object '$date' to IsoMonthStamp '$expectedIsoMonthStamp'`, ({ date, expectedIsoMonthStamp }) => {
      expect(toIsoMonthStamp(date)).toEqual(expectedIsoMonthStamp);
    });
  });

  describe('isValidIsoYear', () => {
    it.each(['2023-11-01', '2023-11', '202', 'invalid', '', 2023, undefined, null, ['2023'], { date: '2023' }])(
      'returns false when the value is %p',
      (value) => {
        expect(isValidIsoYear(value)).toEqual(false);
      },
    );

    it('returns true when a valid ISO month value is provided', () => {
      expect(isValidIsoYear('2023')).toEqual(true);
    });
  });

  describe('toMonthYearString', () => {
    it.each([
      { date: { month: 1, year: 2024 }, expectedMonthYearString: 'January 2024' },
      { date: { month: 4, year: 2024 }, expectedMonthYearString: 'April 2024' },
      { date: { month: 11, year: 2024 }, expectedMonthYearString: 'November 2024' },
      { date: { month: 12, year: 2024 }, expectedMonthYearString: 'December 2024' },
    ])(`converts Date object '$date' to toMonthYearString '$expectedMonthYearString'`, ({ date, expectedMonthYearString }) => {
      expect(toMonthYearString(date)).toEqual(expectedMonthYearString);
    });
  });
});
