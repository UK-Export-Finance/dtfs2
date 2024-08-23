import { when } from 'jest-when';
import { addDays, addMonths, startOfMonth, subMonths } from 'date-fns';
import { ReportPeriod } from '@ukef/dtfs2-common';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';
import { calculateFixedFee, CalculateFixedFeeParams } from './calculate-fixed-fee';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { aFacility, aReportPeriod, aTfmFacility, aTfmFacilityAmendment } from '../../../../../../test-helpers';
import { NotFoundError } from '../../../../../errors';

jest.mock('./calculate-fixed-fee');

console.error = jest.fn();

describe('getFixedFeeForFacility', () => {
  const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');

  const TODAY = new Date();

  const getReportPeriodForDate = (date: Date): ReportPeriod => ({
    start: { month: date.getMonth() + 1, year: date.getFullYear() },
    end: { month: date.getMonth() + 1, year: date.getFullYear() },
  });

  beforeEach(() => {
    findOneByUkefFacilityIdSpy.mockRejectedValue(new Error('Some error'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws a NotFoundError if a tfm facility with the supplied facility id cannot be found', async () => {
    // Arrange
    const facilityId = '12345678';

    when(findOneByUkefFacilityIdSpy).calledWith(facilityId).mockResolvedValue(null);

    // Act / Assert
    await expect(getFixedFeeForFacility(facilityId, 0, aReportPeriod())).rejects.toThrow(
      new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`),
    );
  });

  it('throws a NotFoundError when the found tfm facility does not contain a defined facility snapshot or amendment cover end date', async () => {
    // Arrange
    const facilityId = '12345678';

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aTfmFacility(),
        amendments: [],
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage: 5,
          dayCountBasis: 365,
          coverStartDate: TODAY.getTime().toString(),
          coverEndDate: null,
        },
      });

    // Act / Assert
    await expect(getFixedFeeForFacility(facilityId, 0, aReportPeriod())).rejects.toThrow(
      new NotFoundError(`Failed to find a cover end date for the tfm facility with ukef facility id '${facilityId}`),
    );
  });

  it('throws a NotFoundError when the found tfm facility does not contain a defined facility snapshot cover start date', async () => {
    // Arrange
    const facilityId = '12345678';

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage: 5,
          dayCountBasis: 365,
          coverEndDate: TODAY.getTime().toString(),
          coverStartDate: null,
        },
      });

    // Act / Assert
    await expect(getFixedFeeForFacility(facilityId, 0, aReportPeriod())).rejects.toThrow(
      new NotFoundError(`Failed to find a cover start date for the tfm facility with ukef facility id '${facilityId}`),
    );
  });

  it('calculates the fixed fee using the facility snapshot cover start date if the report period start month starts before the cover start date', async () => {
    // Arrange
    const facilityId = '12345678';

    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverStartDateAfterReportPeriod = addMonths(TODAY, 1);
    const coverEndDate = addDays(coverStartDateAfterReportPeriod, 365);

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage,
          dayCountBasis,
          coverStartDate: coverStartDateAfterReportPeriod,
          coverEndDate,
        },
      });

    // Act
    await getFixedFeeForFacility(facilityId, utilisation, reportPeriod);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      utilisation,
      reportPeriod,
      coverStartDate: coverStartDateAfterReportPeriod,
      coverEndDate,
      interestPercentage,
      dayCountBasis,
    });
  });

  it('calculates the fixed fee using the facility snapshot cover end date if there are no amendments which update the cover end date', async () => {
    // Arrange
    const facilityId = '12345678';

    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverStartDate = subMonths(TODAY, 1);
    const coverEndDate = addDays(startOfMonth(TODAY), 730);

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage,
          dayCountBasis,
          coverStartDate,
          coverEndDate,
        },
        amendments: [],
      });

    // Act
    await getFixedFeeForFacility(facilityId, utilisation, reportPeriod);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      utilisation,
      reportPeriod,
      coverStartDate,
      coverEndDate,
      interestPercentage,
      dayCountBasis,
    });
  });

  it('calculates the fixed fee using the latest completed amendment amended cover end date', async () => {
    // Arrange
    const facilityId = '12345678';

    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverStartDate = subMonths(TODAY, 1);
    const coverEndDate = addDays(TODAY, 365);
    const amendedCoverEndDate = addDays(startOfMonth(TODAY), 730); // report period starts at start of month

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId: facilityId,
          interestPercentage,
          dayCountBasis,
          coverStartDate,
          coverEndDate,
        },
        amendments: [
          { ...aTfmFacilityAmendment(), status: 'Completed', coverEndDate: coverEndDate.getTime(), updatedAt: new Date('2023').getTime() },
          { ...aTfmFacilityAmendment(), status: 'Completed', coverEndDate: amendedCoverEndDate.getTime(), updatedAt: new Date('2024').getTime() }, // most recent `updatedAt` value
        ],
      });

    // Act
    await getFixedFeeForFacility(facilityId, utilisation, reportPeriod);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      utilisation,
      reportPeriod,
      coverStartDate,
      coverEndDate: amendedCoverEndDate,
      interestPercentage,
      dayCountBasis,
    });
  });
});
