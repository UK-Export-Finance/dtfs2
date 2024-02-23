import { getDateFromMonthAndYear, isEqualMonthAndYear } from './date';
import { MonthAndYear } from '../types/date';

describe('helpers - date', () => {
  describe('isEqualMonthAndYear', () => {
    it('returns false if the months do not match', () => {
      // Arrange
      const monthAndYear1: MonthAndYear = { month: 1, year: 2023 };
      const monthAndYear2: MonthAndYear = { month: 2, year: 2023 };

      // Act
      const result = isEqualMonthAndYear(monthAndYear1, monthAndYear2);

      // Assert
      expect(result).toBe(false);
    });

    it('returns false if the years do not match', () => {
      // Arrange
      const monthAndYear1: MonthAndYear = { month: 1, year: 2023 };
      const monthAndYear2: MonthAndYear = { month: 1, year: 2024 };

      // Act
      const result = isEqualMonthAndYear(monthAndYear1, monthAndYear2);

      // Assert
      expect(result).toBe(false);
    });

    it('returns true if the month and year of both objects is equal', () => {
      // Arrange
      const monthAndYear1: MonthAndYear = { month: 1, year: 2023 };
      const monthAndYear2: MonthAndYear = { month: 1, year: 2023 };

      // Act
      const result = isEqualMonthAndYear(monthAndYear1, monthAndYear2);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('getDateFromMonthAndYear', () => {
    const year = 2024;
    const oneIndexedMonthsAndExpectedDates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((oneIndexedMonth) => ({
      oneIndexedMonth,
      expectedDate: new Date(year, oneIndexedMonth - 1),
    }));

    it.each(oneIndexedMonthsAndExpectedDates)('returns the correct date for month $oneIndexedMonth', ({ oneIndexedMonth, expectedDate }) => {
      // Arrange
      const monthAndYear: MonthAndYear = {
        month: oneIndexedMonth,
        year,
      };

      // Act
      const date = getDateFromMonthAndYear(monthAndYear);

      // Assert
      expect(date).toEqual(expectedDate);
    });
  });
});
