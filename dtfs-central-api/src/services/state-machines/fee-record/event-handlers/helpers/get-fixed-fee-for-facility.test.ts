import { when } from 'jest-when';
import { addDays, addMonths, startOfMonth, subMonths } from 'date-fns';
import { ReportPeriod, CalculateFixedFeeParams } from '@ukef/dtfs2-common';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';
import { calculateFixedFee } from './calculate-fixed-fee';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { calculateUkefShareOfUtilisation } from '../../../../../helpers';
import { aFacility, aReportPeriod, aTfmFacility, aTfmFacilityAmendment } from '../../../../../../test-helpers';
import { NotFoundError } from '../../../../../errors';
import * as helpers from '../../../../../helpers';

jest.mock('./calculate-fixed-fee');
jest.mock('../../../../../helpers/amendments/get-effective-cover-end-date-amendment');

console.error = jest.fn();

describe('getFixedFeeForFacility', () => {
  const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');

  const TODAY = new Date();

  const getReportPeriodForDate = (date: Date): ReportPeriod => ({
    start: { month: date.getMonth() + 1, year: date.getFullYear() },
    end: { month: date.getMonth() + 1, year: date.getFullYear() },
  });

  beforeEach(() => {
    jest.mocked(helpers.getEffectiveCoverEndDateAmendment).mockReturnValue(null);
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
          coverStartDate: TODAY,
          coverEndDate: null,
        },
      });

    jest.mocked(helpers.getEffectiveCoverEndDateAmendment).mockReturnValue(null);

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
          coverEndDate: TODAY,
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

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, aFacility().coverPercentage);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      ukefShareOfUtilisation,
      reportPeriod,
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

    jest.mocked(helpers.getEffectiveCoverEndDateAmendment).mockReturnValue(null);

    // Act
    await getFixedFeeForFacility(facilityId, utilisation, reportPeriod);

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, aFacility().coverPercentage);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      ukefShareOfUtilisation,
      reportPeriod,
      coverEndDate,
      interestPercentage,
      dayCountBasis,
    });
  });

  it('should fetch any completed amendments to cover end date effective at the end of the report period', async () => {
    // Arrange
    const facilityId = '12345678';

    const reportPeriod = { start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } };

    const tfmFacility = {
      ...aTfmFacility(),
      facilitySnapshot: {
        ...aFacility(),
        ukefFacilityId: facilityId,
      },
      amendments: [aTfmFacilityAmendment()],
    };
    when(findOneByUkefFacilityIdSpy).calledWith(facilityId).mockResolvedValue(tfmFacility);

    const getAmendmentSpy = jest.spyOn(helpers, 'getEffectiveCoverEndDateAmendment').mockReturnValue(addDays(TODAY, 365));

    // Act
    await getFixedFeeForFacility(facilityId, 10000, reportPeriod);

    // Assert
    expect(getAmendmentSpy).toHaveBeenCalledWith(tfmFacility, new Date('2024-02-29T23:59:59.999Z'));
  });

  it('calculates the fixed fee using the current effective completed cover end date amendment', async () => {
    // Arrange
    const facilityId = '12345678';

    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverStartDate = subMonths(TODAY, 1);
    const coverEndDate = addDays(TODAY, 365);
    const amendedCoverEndDate = addDays(startOfMonth(TODAY), 730); // report period starts at start of month

    const facility = {
      ...aTfmFacility(),
      facilitySnapshot: {
        ...aFacility(),
        ukefFacilityId: facilityId,
        interestPercentage,
        dayCountBasis,
        coverStartDate,
        coverEndDate,
      },
      amendments: [aTfmFacilityAmendment()],
    };

    when(findOneByUkefFacilityIdSpy).calledWith(facilityId).mockResolvedValue(facility);

    jest.mocked(helpers.getEffectiveCoverEndDateAmendment).mockReturnValue(amendedCoverEndDate);

    // Act
    await getFixedFeeForFacility(facilityId, utilisation, reportPeriod);

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, facility.facilitySnapshot.coverPercentage);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      ukefShareOfUtilisation,
      reportPeriod,
      coverEndDate: amendedCoverEndDate,
      interestPercentage,
      dayCountBasis,
    });
  });
});
