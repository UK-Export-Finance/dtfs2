import { isSameDay } from 'date-fns';
import { getBusinessDayOfMonth } from './date';

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
          { businessDay: 1, expectedResult: new Date('2023-11-01') },
          { businessDay: 2, expectedResult: new Date('2023-11-02') },
          { businessDay: 3, expectedResult: new Date('2023-11-03') },
          //                                               '2023-11-04' - Saturday
          //                                               '2023-11-05' - Sunday
          { businessDay: 4, expectedResult: new Date('2023-11-06') },
          { businessDay: 5, expectedResult: new Date('2023-11-07') },
          { businessDay: 6, expectedResult: new Date('2023-11-08') },
          { businessDay: 7, expectedResult: new Date('2023-11-09') },
          { businessDay: 8, expectedResult: new Date('2023-11-10') },
          //                                               '2023-11-11' - Saturday
          //                                               '2023-11-12' - Sunday
          { businessDay: 9, expectedResult: new Date('2023-11-13') },
        ])(`returns $expectedResult when dateInMonth is ${dateInMonth.toISOString()} and businessDay is $businessDay`, ({ businessDay, expectedResult }) => {
          // Act
          const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

          // Assert
          expect(isSameDay(result, expectedResult)).toBe(true);
        });
      });

      describe('when the first of the month is a weekend date', () => {
        const dateInMonth = new Date('2023-10-15');

        it.each([
          //                                               '2023-10-01' - Sunday
          { businessDay: 1, expectedResult: new Date('2023-10-02') },
          { businessDay: 2, expectedResult: new Date('2023-10-03') },
        ])(`returns $expectedResult when dateInMonth is ${dateInMonth.toISOString()} and businessDay is $businessDay`, ({ businessDay, expectedResult }) => {
          // Act
          const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

          // Assert
          expect(isSameDay(result, expectedResult)).toBe(true);
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
        const expectedResult = new Date('2023-08-04');

        // Act
        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        // Assert
        expect(isSameDay(result, expectedResult)).toBe(true);
      });

      it('takes into account both holidays and weekend dates', () => {
        // Arrange
        const dateInMonth = new Date('2023-11-15');
        const holidays = [
          new Date('2023-11-03'), // Friday
          new Date('2023-11-06'), // Monday
        ];
        const businessDay = 3; // would expect '2023-11-03' without holidays
        const expectedResult = new Date('2023-11-07');

        // Act
        const result = getBusinessDayOfMonth(dateInMonth, holidays, businessDay);

        // Assert
        expect(isSameDay(result, expectedResult)).toBe(true);
      });
    });
  });
});
