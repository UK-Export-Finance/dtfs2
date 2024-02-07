import { set } from 'date-fns';
import { LONDON_TIMEZONE} from '../constants/date';
import { filterLocaliseTimestamp } from './filter-localiseTimestamp';

describe('nunjuck filters - dashIfEmpty', () => {
  describe('when timestamp is a valid number', () => {
    const mockDate = set(new Date(), {
      date: 7,
      month: 1, // Months are zero indexed
      year: 2024,
      hours: 22,
    });
    const mockValue = mockDate.valueOf();

    it('should return the day of the month if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON_TIMEZONE);
  
      const expected = '07';
      expect(result).toEqual(expected);
    });

    it('should return the month if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON_TIMEZONE);

      const expected = '02';
      expect(result).toEqual(expected);
    });

    it('should return the year if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON_TIMEZONE);

      const expected = '2024';
      expect(result).toEqual(expected);
    });

    it('should return the correct date if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = '08/02/2024';
      expect(result).toEqual(expected);
    })
  });

  describe('when timestamp is a valid string', () => {
    const mockDate = set(new Date(), {
      date: 7,
      month: 1, // Months are zero indexed
      year: 2024,
    });
    const mockValue = mockDate.valueOf().toString();

    it('should return the day of the month if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON_TIMEZONE);
  
      const expected = '07';
      expect(result).toEqual(expected);
    });

    it('should return the month if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON_TIMEZONE);

      const expected = '02';
      expect(result).toEqual(expected);
    });

    it('should return the year if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON_TIMEZONE);

      const expected = '2024';
      expect(result).toEqual(expected);
    });

    it('should return the correct date if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = '08/02/2024';
      expect(result).toEqual(expected);
    })
  });

  describe('when timestamp is an empty string', () => {
    const mockValue = '';

    it('should return an empty string if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON_TIMEZONE);
  
      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON_TIMEZONE);

      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON_TIMEZONE);

      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = '';
      expect(result).toEqual(expected);
    })
  });

  describe('when timestamp is an invalid string', () => {
    const mockValue = 'test';

    it('should return `Invalid date` if given format `dd` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd', LONDON_TIMEZONE);
  
      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    });

    it('should return `Invalid date` if given the format `MM` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'MM', LONDON_TIMEZONE);

      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    });

    it('should return `Invalid date` if given the format `yyyy` and timezone `Europe/London`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'yyyy', LONDON_TIMEZONE);

      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    });

    it('should return `Invalid date` if given the format `dd/MM/yyyy` and timezone `Australia/Melbourne`', () => {
      const result = filterLocaliseTimestamp(mockValue, 'dd/MM/yyyy', 'Australia/Melbourne');

      const expected = 'Invalid date';
      expect(result).toEqual(expected);
    })
  })
});
