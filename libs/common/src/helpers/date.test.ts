import { formatInTimeZone } from 'date-fns-tz';
import {
  now,
  getNowAsUtcISOString,
  getMonthName,
  getISO8601,
  getUnixTimestampSeconds,
  addYear,
  getEpochMs,
  getLongDateFormat,
  convertUnixTimestampWithoutMilliseconds,
  getLongTimeDateFormat,
} from './date';

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

    it('should return a zeroed timestamp if zeroTimeStamp is true', () => {
      const result = getNowAsUtcISOString(true);

      const expected = `${formatInTimeZone(new Date().setSeconds(0, 0), '+00:00', 'yyyy-MM-dd')}T${formatInTimeZone(
        new Date().setSeconds(0, 0),
        '+00:00',
        'HH:mm:ss.SSS xxxxxx',
      )}`;

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
      const date = now().getDate().toString().padStart(2, '0');

      // Assert
      expect(result).toContain(`${year}-${month}-${date}`);
      expect(result).toContain('T');
      expect(result).toContain('Z');
    });

    it('should return the current date and time in ISO 8601 format', () => {
      // Act
      const result = getISO8601();
      const year = now().getFullYear();
      const month = (now().getMonth() + 1).toString().padStart(2, '0');
      const date = now().getDate().toString().padStart(2, '0');

      // Assert
      expect(result).toContain(`${year}-${month}-${date}`);
      expect(result).toContain('T');
      expect(result).toContain('Z');
    });

    it('should return the provided date in ISO 8601 format', () => {
      // Arrange
      const date = new Date('2023-01-01T00:00:00Z');
      const expected = date.toISOString();

      // Act
      const result = getISO8601(date);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should handle leap year dates correctly', () => {
      // Arrange
      const date = new Date('2020-02-29T00:00:00Z');
      const expected = date.toISOString();

      // Act
      const result = getISO8601(date);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should handle dates before 1970 correctly', () => {
      // Arrange
      const date = new Date('1969-12-31T23:59:59Z');
      const expected = date.toISOString();

      // Act
      const result = getISO8601(date);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should handle future dates correctly', () => {
      // Arrange
      const date = new Date('2100-01-01T00:00:00Z');
      const expected = date.toISOString();

      // Act
      const result = getISO8601(date);

      // Assert
      expect(result).toEqual(expected);
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

  describe('addYear', () => {
    const yearsToAdd = [
      {
        year: 0,
      },
      {
        year: 1,
      },
      {
        year: 2,
      },
      {
        year: 10,
      },
      {
        year: 100,
      },
      {
        year: 1000,
      },
      {
        year: 3000,
      },
      {
        year: 10000,
      },
    ];

    it.each(yearsToAdd)('should add $year year(s) to the provided date object', ({ year }) => {
      // Arrange
      const pastDate = new Date('1989-09-20');
      const expectedYear = pastDate.getFullYear() + year;
      // JavaScript month are 0 indexed
      const expectedMonth = 8;
      const expectedDate = 20;

      // Act
      const result = addYear(year, pastDate);

      // Assert
      expect(result.getFullYear()).toBe(expectedYear);
      expect(result.getMonth()).toBe(expectedMonth);
      expect(result.getDate()).toBe(expectedDate);
    });

    it.each(yearsToAdd)('should add $year year(s) with no date argument', ({ year }) => {
      // Arrange
      const todayDate = now();
      const expectedYear = todayDate.getFullYear() + year;
      // JavaScript month are 0 indexed
      const expectedMonth = todayDate.getMonth();
      const expectedDate = todayDate.getDate();

      // Act
      const result = addYear(year, todayDate);

      // Assert
      expect(result.getFullYear()).toBe(expectedYear);
      expect(result.getMonth()).toBe(expectedMonth);
      expect(result.getDate()).toBe(expectedDate);
    });
  });

  describe('getEpochMs', () => {
    it('should return EPOCH with milliseconds for now with an argument', () => {
      // Arrange
      const date = new Date();
      const epoch = date.valueOf();

      // Act
      const result = getEpochMs(date);

      // Assert
      expect(result).toBe(epoch);
    });

    it('should return EPOCH with milliseconds for now with no argument', () => {
      // Arrange
      const epoch = new Date().valueOf();

      // Act
      const result = getEpochMs();

      // Assert
      expect(result).toBe(epoch);
    });

    it('should return EPOCH with milliseconds for 20/09/1989', () => {
      // Arrange
      const date = new Date('1989-09-20');
      const epoch = date.valueOf();

      // Act
      const result = getEpochMs(date);

      // Assert
      expect(result).toBe(epoch);
    });

    it('should return EPOCH with milliseconds for 01/01/1970', () => {
      // Arrange
      const date = new Date('1970-01-01');

      // Act
      const result = getEpochMs(date);

      // Assert
      expect(result).toBe(0);
    });

    it('should return EPOCH with milliseconds for a future date', () => {
      // Arrange
      const date = new Date('2100-01-01');
      const epoch = date.valueOf();

      // Act
      const result = getEpochMs(date);

      // Assert
      expect(result).toBe(epoch);
    });

    it('should return EPOCH with milliseconds for a leap year date', () => {
      // Arrange
      const date = new Date('2020-02-29');
      const epoch = date.valueOf();

      // Act
      const result = getEpochMs(date);

      // Assert
      expect(result).toBe(epoch);
    });
  });

  describe('getLongDateFormat', () => {
    it('should return long date format for given date', () => {
      // Arrange
      const date = new Date('1989-09-20');

      // Act
      const result = getLongDateFormat(date);

      // Assert
      expect(result).toBe('20 September 1989');
    });

    it('should return long date format for now', () => {
      // Arrange
      const date = now();
      const month = getMonthName(date.getMonth() + 1);
      const longDate = `${date.getDate()} ${month} ${date.getFullYear()}`;

      // Act
      const result = getLongDateFormat();

      // Assert
      expect(result).toContain(longDate);
    });
  });

  describe('convertUnixTimestampWithoutMilliseconds', () => {
    it('should convert a Unix timestamp to a date without milliseconds', () => {
      // Arrange
      const unixTimestamp = 1633036800; // Represents 2021-10-01T00:00:00Z

      // Act
      const result = convertUnixTimestampWithoutMilliseconds(unixTimestamp);

      // Assert
      expect(result).toBe(unixTimestamp);
    });

    it('should handle Unix timestamps with milliseconds', () => {
      // Arrange
      const unixTimestamp = 1633036800123; // Represents 2021-10-01T00:00:00.123Z

      // Act
      const result = convertUnixTimestampWithoutMilliseconds(unixTimestamp);

      // Assert
      expect(result).toBe(1633036800);
    });
  });

  describe('getLongTimeDateFormat', () => {
    it('should give long date format with timestamp for provided epoch as 0', () => {
      // Arrange
      const epoch = 0;

      // Act
      const result = getLongTimeDateFormat(epoch);

      // Assert
      expect(result).toEqual('01:00am on Thursday 01 January 1970');
    });

    it('should give long date format with timestamp for provided epoch with ms', () => {
      // Arrange
      const epoch = 1756996452406;

      // Act
      const result = getLongTimeDateFormat(epoch);

      // Assert
      expect(result).toEqual('03:34pm on Thursday 04 September 2025');
    });

    it('should give long date format with timestamp with no supplied argument', () => {
      // Act
      const result = getLongTimeDateFormat();

      // Assert
      expect(result).toContain(' on ');
    });
  });
});
