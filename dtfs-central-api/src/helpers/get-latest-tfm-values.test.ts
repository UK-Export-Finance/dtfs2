import { getLatestTfmFacilityValues } from './get-latest-tfm-values';
import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { aTfmFacility, aFacility } from '../../test-helpers';
import { convertTimestampToDate } from './convert-timestamp-to-date';
// import { getLatestCompletedAmendmentCoverEndDate } from './amendments';

jest.mock('../repositories/tfm-facilities-repo');

describe('getLatestTfmFacilityValues', () => {
  const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');
  const facilityId = '123';
  const TODAY = new Date();

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when a tfm facility with the supplied facility id cannot be found', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(null);
    });

    it('should throw a NotFoundError', async () => {
      await expect(getLatestTfmFacilityValues(facilityId)).rejects.toThrow(
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
          coverEndDate: TODAY,
          coverStartDate: null,
        },
      });
    });

    it('should throw a NotFoundError', async () => {
      // Act / Assert
      await expect(getLatestTfmFacilityValues(facilityId)).rejects.toThrow(
        new NotFoundError(`Failed to find a cover start date for the tfm facility with ukef facility id '${facilityId}`),
      );
    });
  });

  describe('when the found tfm facility does not contain a defined facility snapshot or amendment cover end date', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage: 5,
          dayCountBasis: 365,
          coverEndDate: null,
          coverStartDate: TODAY,
        },
      });
    });

    it('should throw a NotFoundError', async () => {
      // Act / Assert
      await expect(getLatestTfmFacilityValues(facilityId)).rejects.toThrow(
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
          coverEndDate: TODAY,
          coverStartDate: TODAY,
          coverPercentage: 5,
        },
      });
    });

    it('should return a populated object', async () => {
      const result = await getLatestTfmFacilityValues(facilityId);

      const expected = {
        coverEndDate: convertTimestampToDate(TODAY),
        coverStartDate: convertTimestampToDate(TODAY),
        dayCountBasis: 365,
        interestPercentage: 5,
        coverPercentage: 5,
      };

      expect(result).toEqual(expected);
    });
  });
});
