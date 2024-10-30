import { addDays, addMonths, startOfMonth } from 'date-fns';
import { ReportPeriod, CalculateFixedFeeParams } from '@ukef/dtfs2-common';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';
import { calculateFixedFee } from './calculate-fixed-fee';
import { calculateUkefShareOfUtilisation } from '../../../../../helpers';

jest.mock('./calculate-fixed-fee');

console.error = jest.fn();

describe('getFixedFeeForFacility', () => {
  const TODAY = new Date();

  const getReportPeriodForDate = (date: Date): ReportPeriod => ({
    start: { month: date.getMonth() + 1, year: date.getFullYear() },
    end: { month: date.getMonth() + 1, year: date.getFullYear() },
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calculates the fixed fee using the facility snapshot cover start date if the report period start month starts before the cover start date', () => {
    // Arrange
    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;
    const coverPercentage = 80;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverStartDateAfterReportPeriod = addMonths(TODAY, 1);
    const coverEndDate = addDays(coverStartDateAfterReportPeriod, 365);

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    // Act
    getFixedFeeForFacility(reportPeriod, coverEndDate, interestPercentage, dayCountBasis, ukefShareOfUtilisation);

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
    const coverPercentage = 80;

    const reportPeriod = getReportPeriodForDate(TODAY);
    const coverEndDate = addDays(startOfMonth(TODAY), 730);

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    // Act
    getFixedFeeForFacility(reportPeriod, coverEndDate, interestPercentage, dayCountBasis, ukefShareOfUtilisation);

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
    const coverPercentage = 80;

    const reportPeriod = getReportPeriodForDate(TODAY);

    const amendedCoverEndDate = addDays(startOfMonth(TODAY), 730); // report period starts at start of month

    const ukefShareOfUtilisation = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    // Act
    getFixedFeeForFacility(reportPeriod, amendedCoverEndDate, interestPercentage, dayCountBasis, ukefShareOfUtilisation);

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
