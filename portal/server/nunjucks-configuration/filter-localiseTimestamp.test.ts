import { DATE_IANA_TIMEZONES } from '@ukef/dtfs2-common';
import { filterLocaliseTimestamp } from './filter-localiseTimestamp';

const { LONDON } = DATE_IANA_TIMEZONES;

describe('nunjuck filters - dashIfEmpty', () => {
  describe('when timestamp is a valid number', () => {
    // 1707343200000 is Unix epoch for Wed Feb 07 2024 22:00:00 GMT+0000
    // Equivalent to Thu Feb 08 2024 09:00:00 GMT+1100 (Australia/Melbourne)
    const mockDate = new Date(1707343200000);
    const mockValue = mockDate.valueOf();

    it('should return the day of the month if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON);

      const expected = '07';
      expect(result).toEqual(expected);
    });

    it('should return the month if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON);

      const expected = '02';
      expect(result).toEqual(expected);
    });

    it('should return the year if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON);

      const expected = '2024';
      expect(result).toEqual(expected);
    });

    it('should return the correct date if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = '08/02/2024';
      expect(result).toEqual(expected);
    });
  });

  describe('when timestamp is a valid string', () => {
    // 1707343200000 is Unix epoch for Wed Feb 07 2024 22:00:00 GMT+0000
    // Equivalent to Thu Feb 08 2024 09:00:00 GMT+1100 (Australia/Melbourne)
    const mockDate = new Date(1707343200000);
    const mockValue = mockDate.valueOf().toString();

    it('should return the day of the month if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON);

      const expected = '07';
      expect(result).toEqual(expected);
    });

    it('should return the month if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON);

      const expected = '02';
      expect(result).toEqual(expected);
    });

    it('should return the year if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON);

      const expected = '2024';
      expect(result).toEqual(expected);
    });

    it('should return the correct date if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = '08/02/2024';
      expect(result).toEqual(expected);
    });
  });

  describe('when timestamp is an empty string', () => {
    const mockValue = '';

    it('should return an empty string if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON);

      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON);

      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON);

      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = '';
      expect(result).toEqual(expected);
    });
  });

  describe('when timestamp is an invalid string', () => {
    const mockValue = 'test';

    it('should return `Invalid date` if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON);

      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    });

    it('should return `Invalid date` if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON);

      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    });

    it('should return `Invalid date` if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON);

      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    });

    it('should return `Invalid date` if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    });
  });
});
