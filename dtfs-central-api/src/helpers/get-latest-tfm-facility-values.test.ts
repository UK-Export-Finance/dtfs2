import { getLatestTfmFacilityValues } from './get-latest-tfm-facility-values';
import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { aTfmFacility, aFacility } from '../../test-helpers';
import { convertTimestampToDate } from './convert-timestamp-to-date';

jest.mock('../repositories/tfm-facilities-repo');

describe('getLatestTfmFacilityValues', () => {
  const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');
  const facilityId = '123';
  const today = new Date();

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
      await expect(getLatestTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
        new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`),
      );
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
      await expect(getLatestTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
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
      await expect(getLatestTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
        new NotFoundError(`Failed to find a cover end date for the tfm facility with ukef facility id '${facilityId}`),
      );
    });
  });

  describe('when the tfm facility is found', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue({
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
      });
    });

    it('should return a populated object', async () => {
      const result = await getLatestTfmFacilityValues(facilityId, reportPeriod);

      const expected = {
        coverEndDate: convertTimestampToDate(today),
        coverStartDate: convertTimestampToDate(today),
        dayCountBasis: 365,
        interestPercentage: 5,
        coverPercentage: 5,
      };

      expect(result).toEqual(expected);
    });
  });
});
