import { getSpecificTfmFacilityValues } from './get-specific-tfm-facility-values';
import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { aTfmFacility, aFacility } from '../../test-helpers';
import { convertTimestampToDate } from './convert-timestamp-to-date';

jest.mock('../repositories/tfm-facilities-repo');

describe('getSpecificTfmFacilityValues', () => {
  const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');
  const facilityId = '123';
  const today = new Date();

  const mockFacility = {
    ...aTfmFacility(),
    facilitySnapshot: {
      ...aFacility(),
      ukefFacilityId: facilityId,
      interestPercentage: 5,
      dayCountBasis: 365,
      coverEndDate: today,
      coverStartDate: today,
      coverPercentage: 5,
    },
  };

  const reportPeriod = {
    start: { month: today.getMonth() + 1, year: today.getFullYear() },
    end: { month: today.getMonth() + 1, year: today.getFullYear() },
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when a tfm facility with the supplied facility id cannot be found', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(null);
    });

    it('should throw a NotFoundError', async () => {
      await expect(getSpecificTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(new NotFoundError(`TFM facility ${facilityId} could not be found`));
    });
  });

  describe('when the found tfm facility does not contain a cover start date', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage: 5,
          dayCountBasis: 365,
          coverEndDate: today,
          coverStartDate: null,
        },
      });
    });

    it('should throw a NotFoundError', async () => {
      // Act / Assert
      await expect(getSpecificTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
        new NotFoundError(`Failed to find a cover start date for the tfm facility with ukef facility id '${facilityId}`),
      );
    });
  });

  describe('when the found tfm facility does not contain a cover end date', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage: 5,
          dayCountBasis: 365,
          coverEndDate: null,
          coverStartDate: today,
        },
      });
    });

    it('should throw a NotFoundError', async () => {
      // Act / Assert
      await expect(getSpecificTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
        new NotFoundError(`Failed to find a cover end date for the tfm facility with ukef facility id '${facilityId}`),
      );
    });
  });

  describe('when the tfm facility is found', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(mockFacility);
    });

    it('should return a populated object', async () => {
      const result = await getSpecificTfmFacilityValues(facilityId, reportPeriod);

      const expected = {
        coverEndDate: convertTimestampToDate(today),
        coverStartDate: convertTimestampToDate(today),
        dayCountBasis: 365,
        interestPercentage: 5,
        coverPercentage: 5,
        value: mockFacility.facilitySnapshot.value,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the report period is not provided', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(mockFacility);
    });

    it("should return a populated object with the facility's cover end date", async () => {
      const result = await getSpecificTfmFacilityValues(facilityId);

      const expected = {
        coverEndDate: convertTimestampToDate(today),
        coverStartDate: convertTimestampToDate(today),
        dayCountBasis: 365,
        interestPercentage: 5,
        coverPercentage: 5,
        value: mockFacility.facilitySnapshot.value,
      };

      expect(result).toEqual(expected);
    });
  });
});
