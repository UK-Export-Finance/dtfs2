import { formatInTimeZone } from 'date-fns-tz';
import { getNowAsUtcISOString, getMonthName } from './date';

describe('date helpers', () => {
  describe('getNowAsUtcISOString', () => {
    it('should return the current time as a UtcISOString', () => {
      const result = getNowAsUtcISOString();

      const expected = `${formatInTimeZone(new Date(), '+00:00', 'yyyy-MM-dd')}T${formatInTimeZone(new Date(), '+00:00', 'HH:mm:ss.SSS xxxxxx')}`;

      expect(result).toEqual(expected);
    });
  });

  describe('getMonthName', () => {
    it.each([
      { monthNumber: 1, expectedMonthName: 'January' },
      { monthNumber: 2, expectedMonthName: 'February' },
      { monthNumber: 3, expectedMonthName: 'March' },
      { monthNumber: 4, expectedMonthName: 'April' },
      { monthNumber: 5, expectedMonthName: 'May' },
      { monthNumber: 6, expectedMonthName: 'June' },
      { monthNumber: 7, expectedMonthName: 'July' },
      { monthNumber: 8, expectedMonthName: 'August' },
      { monthNumber: 9, expectedMonthName: 'September' },
      { monthNumber: 10, expectedMonthName: 'October' },
      { monthNumber: 11, expectedMonthName: 'November' },
      { monthNumber: 12, expectedMonthName: 'December' },
    ])("should return month name '$expectedMonthName' from month number '$monthNumber'", ({ monthNumber, expectedMonthName }) => {
      // Act
      const monthName = getMonthName(monthNumber);

      // Assert
      expect(monthName).toEqual(expectedMonthName);
    });
  });
});
