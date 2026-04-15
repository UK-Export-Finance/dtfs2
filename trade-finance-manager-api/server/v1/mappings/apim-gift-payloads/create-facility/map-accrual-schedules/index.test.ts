import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapDayBasisCode } from './map-day-basis-code';
import { mapFrequencyCode } from './map-frequency-code';
import { mapAccrualSchedules } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapAccrualSchedules', () => {
  it('should return an array with a mapped accrual schedule', () => {
    // Arrange
    const dayCountBasis = 360;
    const effectiveDate = '2024-01-01';
    const feeFrequency = 'Monthly';
    const guaranteeFeePayableToUkef = '7.0200%';
    const maturityDate = '2025-01-01';

    // Act
    const result = mapAccrualSchedules({
      dayCountBasis,
      effectiveDate,
      feeFrequency,
      guaranteeFeePayableToUkef,
      maturityDate,
    });

    // Assert
    const expected = [
      {
        accrualScheduleTypeCode: DEFAULTS.ACCRUAL_SCHEDULE.TYPE_CODE,
        accrualEffectiveDate: effectiveDate,
        accrualMaturityDate: maturityDate,
        accrualFrequencyCode: mapFrequencyCode(feeFrequency),
        accrualDayBasisCode: mapDayBasisCode(dayCountBasis),
        firstCycleAccrualEndDate: maturityDate,
        baseRate: DEFAULTS.ACCRUAL_SCHEDULE.BASE_RATE,
        spreadRate: 7.02,
        additionalRate: DEFAULTS.ACCRUAL_SCHEDULE.ADDITIONAL_RATE,
      },
    ];
    expect(result).toEqual(expected);
  });
});
