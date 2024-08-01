import { ObjectId } from 'mongodb';
import { when } from 'jest-when';
import { addDays, addMonths, differenceInDays, startOfMonth, subMonths } from 'date-fns';
import { Facility, ReportPeriod, TfmFacility } from '@ukef/dtfs2-common';
import { calculateFixedFee } from './calculate-fixed-fee';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { aFacility, aReportPeriod, aTfmFacility, aTfmFacilityAmendment } from '../../../../../../test-helpers/test-data';
import { NotFoundError } from '../../../../../errors';

console.error = jest.fn();

describe('calculateFixedFeeAdjustment', () => {
  const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');

  const facilityId = '12345678';
  const tfmFacilityId = new ObjectId();

  const utilisation = 100000;
  const interestPercentage = 5;
  const dayCountBasis = 365;

  /**
   * Date Details
   *
   * For the general test case, we want to set the report period
   * start date to the start of this month, the cover end date to
   * 365 days into the future and the cover start date to one month
   * in the past. By doing this, we ensure that in the general case
   * the calculation step where we use the value "days left in cover
   * period" divided by `dayCountBasis` will always be 1, so it can
   * be ignored.
   */
  const today = new Date();
  const reportPeriodDate = startOfMonth(today);
  const coverEndDate = addDays(reportPeriodDate, 365);
  const coverStartDate = startOfMonth(subMonths(reportPeriodDate, 1));
  const numberOfDaysRemainingInCoverPeriod = 365;

  const reportPeriodStartMonth = reportPeriodDate.getMonth() + 1; // one-indexed
  const reportPeriodStartYear = reportPeriodDate.getFullYear();
  const reportPeriod: ReportPeriod = {
    start: { month: reportPeriodStartMonth, year: reportPeriodStartYear },
    end: { month: reportPeriodStartMonth, year: reportPeriodStartYear },
  };

  const roundTo2Dp = (value: number): number => Number(value.toFixed(2));
  const getExpectedFixedFee = (): number => roundTo2Dp((utilisation * 0.9 * interestPercentage) / 100);

  beforeEach(() => {
    findOneByUkefFacilityIdSpy.mockRejectedValue(new Error('Some error'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const aValidFacilitySnapshot = (): Facility => ({
    ...aFacility(),
    ukefFacilityId: facilityId,
    coverEndDate,
    coverStartDate,
    dayCountBasis,
    interestPercentage,
  });

  const aValidTfmFacility = (): TfmFacility => ({
    ...aTfmFacility(),
    _id: tfmFacilityId,
    facilitySnapshot: aValidFacilitySnapshot(),
  });

  it('throws a NotFoundError if a tfm facility with the supplied facility id cannot be found', async () => {
    // Arrange
    when(findOneByUkefFacilityIdSpy).calledWith(facilityId).mockResolvedValue(null);

    // Act / Assert
    await expect(calculateFixedFee(0, facilityId, aReportPeriod())).rejects.toThrow(
      new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`),
    );
  });

  it('throws a NotFoundError when the found tfm facility does not contain a defined facility snapshot or amendment cover end date', async () => {
    // Arrange
    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aValidTfmFacility(),
        amendments: [],
        facilitySnapshot: {
          ...aValidFacilitySnapshot(),
          coverEndDate: null,
        },
      });

    // Act / Assert
    await expect(calculateFixedFee(utilisation, facilityId, reportPeriod)).rejects.toThrow(
      new NotFoundError(`Failed to find a cover end date for the tfm facility with ukef facility id '${facilityId}`),
    );
  });

  it('throws a NotFoundError when the found tfm facility does not contain a defined facility snapshot cover start date', async () => {
    // Arrange
    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aValidTfmFacility(),
        facilitySnapshot: {
          ...aValidFacilitySnapshot(),
          coverStartDate: null,
        },
      });

    // Act / Assert
    await expect(calculateFixedFee(utilisation, facilityId, reportPeriod)).rejects.toThrow(
      new NotFoundError(`Failed to find a cover start date for the tfm facility with ukef facility id '${facilityId}`),
    );
  });

  it('calculates the fixed fee using the facility snapshot cover start date if the report period start month starts before the cover start date', async () => {
    // Arrange
    const coverStartDateAfterReportPeriod = addMonths(reportPeriodDate, 1);

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aValidTfmFacility(),
        facilitySnapshot: {
          ...aValidFacilitySnapshot(),
          coverStartDate: coverStartDateAfterReportPeriod,
        },
      });

    const numberOfDaysRemainingInCoverPeriodWithNewCoverStartDate = differenceInDays(coverEndDate, coverStartDateAfterReportPeriod);
    const expectedResult = (getExpectedFixedFee() * numberOfDaysRemainingInCoverPeriodWithNewCoverStartDate) / numberOfDaysRemainingInCoverPeriod;

    // Act
    const result = await calculateFixedFee(utilisation, facilityId, reportPeriod);

    // Assert
    expect(result).toBe(Number(expectedResult.toFixed(2)));
  });

  it('calculates the fixed fee using the facility snapshot cover end date if there are no amendments which update the cover end date', async () => {
    // Arrange
    const newCoverEndDate = addDays(coverEndDate, 365); // another 365 days => multiply the expected fixed fee by 2

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aValidTfmFacility(),
        facilitySnapshot: {
          ...aValidFacilitySnapshot(),
          coverEndDate: newCoverEndDate,
        },
        amendments: [],
      });

    const expectedResult = getExpectedFixedFee() * 2;

    // Act
    const result = await calculateFixedFee(utilisation, facilityId, reportPeriod);

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('calculates the fixed fee using the latest completed amendment amended cover end date', async () => {
    // Arrange
    const amendedCoverEndDate = addDays(coverEndDate, 365); // another 365 days => multiply the expected fixed fee by 2

    when(findOneByUkefFacilityIdSpy)
      .calledWith(facilityId)
      .mockResolvedValue({
        ...aValidTfmFacility(),
        facilitySnapshot: {
          ...aValidFacilitySnapshot(),
          coverEndDate,
        },
        amendments: [
          { ...aTfmFacilityAmendment(), status: 'Completed', coverEndDate: coverEndDate.getTime(), updatedAt: new Date('2023').getTime() },
          { ...aTfmFacilityAmendment(), status: 'Completed', coverEndDate: amendedCoverEndDate.getTime(), updatedAt: new Date('2024').getTime() }, // most recent `updatedAt` value
        ],
      });

    const expectedResult = getExpectedFixedFee() * 2;

    // Act
    const result = await calculateFixedFee(utilisation, facilityId, reportPeriod);

    // Assert
    expect(result).toEqual(expectedResult);
  });
});
