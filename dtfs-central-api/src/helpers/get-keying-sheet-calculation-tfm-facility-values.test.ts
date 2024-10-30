import { getKeyingSheetCalculationTfmFacilityValues } from './get-keying-sheet-calculation-tfm-facility-values';
import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { aTfmFacility, aFacility, aCompletedTfmFacilityAmendment } from '../../test-helpers';
import { convertTimestampToDate } from './convert-timestamp-to-date';

jest.mock('../repositories/tfm-facilities-repo');

describe('getKeyingSheetCalculationTfmFacilityValues', () => {
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
      await expect(getKeyingSheetCalculationTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
        new NotFoundError(`TFM facility with ukefFacilityId '${facilityId}' could not be found`),
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
      await expect(getKeyingSheetCalculationTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
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
      await expect(getKeyingSheetCalculationTfmFacilityValues(facilityId, reportPeriod)).rejects.toThrow(
        new NotFoundError(`Failed to find a cover end date for the tfm facility with ukef facility id '${facilityId}`),
      );
    });
  });

  describe('when the report period is provided', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(mockFacility);
    });

    it('should return a populated object', async () => {
      const result = await getKeyingSheetCalculationTfmFacilityValues(facilityId, reportPeriod);

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
      const result = await getKeyingSheetCalculationTfmFacilityValues(facilityId);

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

  describe('when the facility contains a completed amendment', () => {
    const dateAfterReportPeriodEnd = new Date('2024-03-01');

    const mockFacilityWithAmendment = {
      ...mockFacility,
      amendments: [
        {
          ...aCompletedTfmFacilityAmendment(),
          value: 350000,
          effectiveDate: dateAfterReportPeriodEnd.getTime(),
          // 365 days after report period end
          coverEndDate: new Date('2025-03-01').getTime(),
        },
      ],
    };
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(mockFacilityWithAmendment);
    });

    it("should return a populated object with the amendment's cover end date", async () => {
      const result = await getKeyingSheetCalculationTfmFacilityValues(facilityId, reportPeriod);

      const expected = {
        coverEndDate: convertTimestampToDate(mockFacilityWithAmendment.amendments[0].coverEndDate),
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
