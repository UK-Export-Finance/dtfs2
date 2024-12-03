import { isSameDay } from 'date-fns';
import { assertValidIsoMonth, getBusinessDayOfMonth, getIsoMonth } from './date';

describe('date', () => {
  describe('getBusinessDayOfMonth', () => {
    it.each([
      { businessDay: 0, testCase: 'less than 1' },
      { businessDay: 1.5, testCase: 'not an integer' },
      { businessDay: '1', testCase: 'not a number' },
    ])('throws when businessDay is $testCase', ({ businessDay }) => {
      // Arrange
      const dateInMonth = new Date('2023-01-01');
      const holidays = [];

      // Act / Assert
      expect(() => getBusinessDayOfMonth(dateInMonth, holidays, businessDay)).toThrow(
        new Error(`businessDay must be a positive integer. Found ${businessDay}`),
      );
    });

    describe('when there are no holidays', () => {
      const holidays = [];

      describe('when the first of the month is not a weekend date', () => {
        const dateInMonth = new Date('2023-11-15');

        it.each([
          { businessDay: 1, expected: new Date('2023-11-01') },
          { businessDay: 2, expected: new Date('2023-11-02') },
          { businessDay: 3, expected: new Date('2023-11-03') },
          //                                         '2023-11-04' - Saturday
          //                                         '2023-11-05' - Sunday
          { businessDay: 4, expected: new Date('2023-11-06') },
          { businessDay: 5, expected: new Date('2023-11-07') },
          { businessDay: 6, expected: new Date('2023-11-08') },
          { businessDay: 7, expected: new Date('2023-11-09') },
          { businessDay: 8, expected: new Date('2023-11-10') },
          //                                         '2023-11-11' - Saturday
          //                                         '2023-11-12' - Sunday
          { businessDay: 9, expected: new Date('2023-11-13') },
        ])(`returns $expected when dateInMonth is ${dateInMonth.toISOString()} and businessDay is $businessDay`, ({ businessDay, expected }) => {
          // Act
          const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

          // Assert
          expect(isSameDay(result, expected)).toEqual(true);
        });
      });

      describe('when the first of the month is a weekend date', () => {
        const dateInMonth = new Date('2023-10-15');

        it.each([
          //                                               '2023-10-01' - Sunday
          { businessDay: 1, expected: new Date('2023-10-02') },
          { businessDay: 2, expected: new Date('2023-10-03') },
        ])(`returns $expected when dateInMonth is ${dateInMonth.toISOString()} and businessDay is $businessDay`, ({ businessDay, expected }) => {
          // Act
          const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

          // Assert
          expect(isSameDay(result, expected)).toEqual(true);
        });
      });
    });

    describe('when there are holidays', () => {
      it('takes into account consecutive holidays', () => {
        // Arrange
        const dateInMonth = new Date('2023-08-15');
        const holidays = [
          new Date('2023-08-02'), // Wednesday
          new Date('2023-08-03'), // Thursday
        ];
        const businessDay = 2; // would expect '2023-08-02' without holidays
        const expected = new Date('2023-08-04');

        // Act
        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        // Assert
        expect(isSameDay(result, expected)).toEqual(true);
      });

      it('takes into account both holidays and weekend dates', () => {
        // Arrange
        const dateInMonth = new Date('2023-11-15');
        const holidays = [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ];
        const businessDay = 3; // would expect '2023-11-03' without holidays
        const expected = new Date('2023-11-07');

        // Act
        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        // Assert
        expect(isSameDay(result, expected)).toEqual(true);
      });
    });
  });

  describe('getIsoMonth', () => {
    it.each(['2023-13', 202311, undefined, null, ['2023-11'], { date: '2023-11' }])('throws when provided with %p instead of an instance of Date', (value) => {
      expect(() => getIsoMonth(value)).toThrowError("Expected an instance of 'Date'");
    });

    it.each([
      { dateInMonth: new Date(2023, 7), expectedIsoMonth: '2023-08' },
      { dateInMonth: new Date('1980-02-28'), expectedIsoMonth: '1980-02' },
    ])("returns ISO month '$expectedIsoMonth' when provided with Date $dateInMonth", ({ dateInMonth, expectedIsoMonth }) => {
      expect(getIsoMonth(dateInMonth)).toEqual(expectedIsoMonth);
    });
  });

  describe('assertValidIsoMonth', () => {
    it.each(['2023-11-01', '2023-13', '202-11', 'invalid', '', 202311, undefined, null, ['2023-11'], { date: '2023-11' }])(
      'throws when provided non-ISO month string value %p',
      (value) => {
        expect(() => assertValidIsoMonth(value)).toThrowError('Invalid ISO mont');
      },
    );

    it('returns when provided with a valid ISO month string', () => {
      expect(() => assertValidIsoMonth('2023-11')).not.toThrow();
    });
  });
});
