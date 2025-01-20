import { formatInTimeZone } from 'date-fns-tz';
import { now, getNowAsUtcISOString, getMonthName, getISO8601, getUnixTimestampSeconds } from './date';

describe('date helpers', () => {
  describe('getNowAsUtcISOString', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

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
      const result = getMonthName(monthNumber);

      // Assert
      expect(result).toEqual(expectedMonthName);
    });
  });

  describe('now', () => {
    it('should return now', () => {
      // Act
      const response = now();

      // Assert
      expect(response).not.toBeNull();
    });

    it('should have imperative date functions', () => {
      // Act
      const response = now();

      // Assert
      expect(response.getDate()).toBeDefined();
      expect(response.getMonth()).toBeDefined();
      expect(response.getFullYear()).toBeDefined();
    });
  });

  describe('getISO8601', () => {
    it('should return the current date and time in ISO 8601 format', () => {
      // Act
      const result = getISO8601();
      const year = now().getFullYear();
      const month = (now().getMonth() + 1).toString().padStart(2, '0');
      const date = now().getDate();

      // Assert
      expect(result).toContain(`${year}-${month}-${date}`);
      expect(result).toContain('T');
      expect(result).toContain('Z');
    });
  });

  describe('getUnixTimestampSeconds', () => {
    it('should return the Unix timestamp in seconds for a given date', () => {
      // Arrange
      const date = new Date('2023-01-01T00:00:00Z');

      // Act
      const result = getUnixTimestampSeconds(date);
      const expected = Math.floor(date.getTime() / 1000);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
