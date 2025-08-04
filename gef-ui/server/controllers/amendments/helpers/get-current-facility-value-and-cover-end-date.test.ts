import * as dtfsCommon from '@ukef/dtfs2-common';
import { getUnixTime } from 'date-fns';
import api from '../../../services/api';
import { getCurrentFacilityValueAndCoverEndDate } from './get-current-facility-value-and-cover-end-date';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';

const getLatestAmendmentFacilityValueAndCoverEndDateMock = jest.fn();
console.error = jest.fn();

const facilityId = '6597dffeb5ef5ff4267e5045';
const userToken = 'test-token';
const facility = MOCK_ISSUED_FACILITY.details;

const currentValueAndCoverEndDate = {
  coverEndDate: 1735689600,
  value: 1000000,
};

describe('getCurrentFacilityValueAndCoverEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(api, 'getLatestAmendmentFacilityValueAndCoverEndDate').mockImplementation(getLatestAmendmentFacilityValueAndCoverEndDateMock);

    getLatestAmendmentFacilityValueAndCoverEndDateMock.mockResolvedValue(currentValueAndCoverEndDate);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when getLatestAmendmentFacilityValueAndCoverEndDate returns a value for the cover end date and value', () => {
    it('should return the current cover end date and value from the latest amendment', async () => {
      const result = await getCurrentFacilityValueAndCoverEndDate(facilityId, facility, userToken);

      const expected = {
        currentCoverEndDate: getUnixTime(new Date(currentValueAndCoverEndDate.coverEndDate)),
        currentValue: currentValueAndCoverEndDate.value,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when getLatestAmendmentFacilityValueAndCoverEndDate returns a value but not a coverEndDate', () => {
    it('should return the current cover end date from the facility and value from the latest amendment', async () => {
      const noCoverEndDate = { ...currentValueAndCoverEndDate, coverEndDate: null };
      getLatestAmendmentFacilityValueAndCoverEndDateMock.mockResolvedValue(noCoverEndDate);

      const result = await getCurrentFacilityValueAndCoverEndDate(facilityId, facility, userToken);

      const expected = {
        currentCoverEndDate: getUnixTime(new Date(facility.coverEndDate!)),
        currentValue: noCoverEndDate.value,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when getLatestAmendmentFacilityValueAndCoverEndDate returns a value for the cover end date and value', () => {
    it('should return the current cover end date from the latest amendment and value from the facility', async () => {
      const noValue = { ...currentValueAndCoverEndDate, value: null };
      getLatestAmendmentFacilityValueAndCoverEndDateMock.mockResolvedValue(noValue);

      const result = await getCurrentFacilityValueAndCoverEndDate(facilityId, facility, userToken);

      const expected = {
        currentCoverEndDate: getUnixTime(new Date(currentValueAndCoverEndDate.coverEndDate)),
        currentValue: facility.value,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when getLatestAmendmentFacilityValueAndCoverEndDate returns null for both coverEndDate and value', () => {
    it('should return the current cover end date and value from the facility', async () => {
      const noReturn = { coverEndDate: null, value: null };
      getLatestAmendmentFacilityValueAndCoverEndDateMock.mockResolvedValue(noReturn);

      const result = await getCurrentFacilityValueAndCoverEndDate(facilityId, facility, userToken);

      const expected = {
        currentCoverEndDate: getUnixTime(new Date(facility.coverEndDate!)),
        currentValue: facility.value,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when both coverEndDate and value are null in the facility and latest amendment', () => {
    it('should return null for both current cover end date and value', async () => {
      const noCoverEndDateAndValue = { coverEndDate: null, value: null };
      getLatestAmendmentFacilityValueAndCoverEndDateMock.mockResolvedValue(noCoverEndDateAndValue);

      const result = await getCurrentFacilityValueAndCoverEndDate(facilityId, { ...facility, coverEndDate: null, value: null }, userToken);

      const expected = {
        currentCoverEndDate: null,
        currentValue: null,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when an error occurs while fetching the latest amendment values', () => {
    it('should throw an error and call console.error', async () => {
      const mockError = new Error('API error');
      getLatestAmendmentFacilityValueAndCoverEndDateMock.mockRejectedValue(mockError);

      await expect(getCurrentFacilityValueAndCoverEndDate(facilityId, facility, userToken)).rejects.toThrow(mockError);
      expect(console.error).toHaveBeenCalledWith('Error getting current facility value and cover end date: %o', mockError);
    });
  });
});
