const {
  parse,
  getTime,
  startOfDay,
  endOfDay,
} = require('date-fns');
const {
  TIMESTAMP_FIELDS,
  isTimestampField,
  DATE_INPUT_FORMAT,
  dayStartAndEndTimestamps,
} = require('./tfm-get-deals-date-helpers');

describe('tfm get deals controller - date helpers', () => {
  describe('DATE_INPUT_FORMAT', () => {
    it('should be defined', () => {
      expect(DATE_INPUT_FORMAT).toEqual('dd-MM-yyyy');
    });
  });

  describe('TIMESTAMP_FIELDS', () => {
    it('should be defined', () => {
      const expected = [
        'dealSnapshot.eligibility.lastUpdated',
        'dealSnapshot.details.submissionDate',
        'dealSnapshot.facilitiesUpdated',
        'tfm.lastUpdated',
      ];

      expect(TIMESTAMP_FIELDS).toEqual(expected);
    });
  });

  describe('isTimestampField', () => {
    it('should return true when the provided field name is in TIMESTAMP_FIELDS', () => {
      const result = isTimestampField('dealSnapshot.eligibility.lastUpdated');
      expect(result).toEqual(true);
    });

    it('should return false when the provided field name is NOT in TIMESTAMP_FIELDS', () => {
      const result = isTimestampField('some-invalid-field');
      expect(result).toEqual(false);
    });
  });

  describe('dayStartAndEndTimestamps', () => {
    it('should return start and end of day timestamps from a provided date string', () => {
      const mockDate = '31-10-2021';

      const result = dayStartAndEndTimestamps(mockDate);

      const generateTimeStamp = (dateStr, timeOfDay) => {
        let timestamp;

        const day = parse(dateStr, DATE_INPUT_FORMAT, new Date());

        if (timeOfDay === 'start') {
          const dayStart = startOfDay(new Date(day));
          timestamp = getTime(dayStart);

          return timestamp;
        }

        if (timeOfDay === 'end') {
          const dayEnd = endOfDay(new Date(day));
          timestamp = getTime(dayEnd);

          return timestamp;
        }

        return timestamp;
      };

      const expectedDayStartTimestamp = generateTimeStamp(mockDate, 'start');
      const expectedDayEndTimestamp = generateTimeStamp(mockDate, 'end');

      const expected = {
        dayStartTimestamp: expectedDayStartTimestamp,
        dayEndTimestamp: expectedDayEndTimestamp,
      };

      expect(result).toEqual(expected);
    });
  });
});
