import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapDayBasisCode } from './map-day-basis-code';
import { mapFrequencyCode } from './map-frequency-code';
import { mapSpreadRate } from './map-spread-rate';
import { mapAccrualSchedules } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapAccrualSchedules', () => {
  it('should return an array with a mapped accrual schedule', () => {
    // Arrange
    const dayCountBasis = 360;
    const expiryDate = '2026-12-31';
    const feeFrequency = 'Monthly';
    const feeType = 'At maturity';
    const guaranteeFeePayableToUkef = '7.0200%';

    // Act
    const result = mapAccrualSchedules({
      dayCountBasis,
      expiryDate,
      feeFrequency,
      feeType,
      guaranteeFeePayableToUkef,
    });

    // Assert
    const expected = [
      {
        accrualScheduleTypeCode: DEFAULTS.ACCRUAL_SCHEDULE.TYPE_CODE,
        accrualFrequencyCode: mapFrequencyCode(feeFrequency, feeType),
        accrualDayBasisCode: mapDayBasisCode(dayCountBasis),
        additionalRate: DEFAULTS.ACCRUAL_SCHEDULE.ADDITIONAL_RATE,
        baseRate: DEFAULTS.ACCRUAL_SCHEDULE.BASE_RATE,
        firstCycleAccrualEndDate: expiryDate,
        spreadRate: mapSpreadRate(guaranteeFeePayableToUkef),
      },
    ];

    expect(result).toEqual(expected);
  });
});
