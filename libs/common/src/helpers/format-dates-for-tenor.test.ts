import { format, fromUnixTime } from 'date-fns';
import { formatDatesForTenor } from './format-dates-for-tenor';
import { MOCK_FACILITY } from '../test-helpers';
import { getEpochMs, convertUnixTimestampWithoutMilliseconds } from './date';

describe('formatDatesForTenor', () => {
  describe('invalid conditions', () => {
    it('should return an empty object if coverEndDate is not provided', () => {
      const result = formatDatesForTenor(MOCK_FACILITY);

      expect(result).toEqual({});
    });

    it('should return an empty object if facilitySnapshot is missing facility type', () => {
      const facilitySnapshot = {
        ...MOCK_FACILITY,
        ukefFacilityType: undefined,
        type: undefined,
      };

      // @ts-ignore - facilitySnapshot is missing required properties as js files use this function
      const result = formatDatesForTenor(facilitySnapshot, 1234567890);

      expect(result).toEqual({});
    });

    it('should return an empty object if facilitySnapshot is missing facility type', () => {
      const facilitySnapshot = {
        ...MOCK_FACILITY,
        coverStartDate: undefined,
        requestedCoverStartDate: undefined,
      };

      // @ts-ignore - facilitySnapshot is missing required properties as js files use this function
      const result = formatDatesForTenor(facilitySnapshot, 1234567890);

      expect(result).toEqual({});
    });
  });

  describe('valid conditions', () => {
    it('should return formatted dates for valid facilitySnapshot and coverEndDate', () => {
      const timestamp = getEpochMs();

      const result = formatDatesForTenor(MOCK_FACILITY, timestamp);

      const coverStartDateFormatted = format(new Date(MOCK_FACILITY.coverStartDate), 'yyyy-MM-dd');
      const coverEndDateFormatted = format(fromUnixTime(convertUnixTimestampWithoutMilliseconds(timestamp)), 'yyyy-MM-dd');

      const expected = {
        facilityType: MOCK_FACILITY.type,
        coverStartDateFormatted,
        coverEndDateFormatted,
      };

      expect(result).toEqual(expected);
    });
  });
});
