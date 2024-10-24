import { addDays, addMonths, startOfMonth } from 'date-fns';
import { ReportPeriod, CalculateFixedFeeParams } from '@ukef/dtfs2-common';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';
import { calculateFixedFee } from './calculate-fixed-fee';
import { calculateUkefShareOfUtilisation } from '../../../../../helpers';
import { tfmFacilityReturnedValues } from '../../../../../../test-helpers';
import * as helpers from '../../../../../helpers';

jest.mock('./calculate-fixed-fee');
jest.mock('../../../../../helpers/amendments/get-effective-cover-end-date-amendment');

console.error = jest.fn();

describe('getFixedFeeForFacility', () => {
  const TODAY = new Date();

  const getReportPeriodForDate = (date: Date): ReportPeriod => ({
    start: { month: date.getMonth() + 1, year: date.getFullYear() },
    end: { month: date.getMonth() + 1, year: date.getFullYear() },
  });

  beforeEach(() => {
    jest.mocked(helpers.getEffectiveCoverEndDateAmendment).mockReturnValue(null);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calculates the fixed fee using the facility snapshot cover start date if the report period start month starts before the cover start date', () => {
    // Arrange
    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverStartDateAfterReportPeriod = addMonths(TODAY, 1);
    const coverEndDate = addDays(coverStartDateAfterReportPeriod, 365);

    const tfmFacilityValues = {
      ...tfmFacilityReturnedValues,
      coverEndDate,
    };

    // Act
    getFixedFeeForFacility(utilisation, reportPeriod, tfmFacilityValues);

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, tfmFacilityValues.coverPercentage);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      ukefShareOfUtilisation,
      reportPeriod,
      coverEndDate,
      interestPercentage,
      dayCountBasis,
    });
  });

  it('calculates the fixed fee using the facility snapshot cover end date if there are no amendments which update the cover end date', () => {
    // Arrange
    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverEndDate = addDays(startOfMonth(TODAY), 730);

    const tfmFacilityValues = {
      ...tfmFacilityReturnedValues,
      coverEndDate,
    };

    jest.mocked(helpers.getEffectiveCoverEndDateAmendment).mockReturnValue(null);

    // Act
    getFixedFeeForFacility(utilisation, reportPeriod, tfmFacilityValues);

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, tfmFacilityValues.coverPercentage);

    // Assert
    expect(calculateFixedFee).toHaveBeenCalledWith<[CalculateFixedFeeParams]>({
      ukefShareOfUtilisation,
      reportPeriod,
      coverEndDate,
      interestPercentage,
      dayCountBasis,
    });
  });

  it('calculates the fixed fee using the current effective completed cover end date amendment', () => {
    // Arrange
    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = getReportPeriodForDate(TODAY);

    const amendedCoverEndDate = addDays(startOfMonth(TODAY), 730); // report period starts at start of month

    const tfmFacilityValues = {
      ...tfmFacilityReturnedValues,
      coverEndDate: amendedCoverEndDate,
    };

    // Act
    getFixedFeeForFacility(utilisation, reportPeriod, tfmFacilityValues);

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, tfmFacilityValues.coverPercentage);

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
