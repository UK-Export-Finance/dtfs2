import { CURRENCY } from '@ukef/dtfs2-common';
import { ACCRUAL_SCHEDULE_TYPE_CODES, APIM_GIFT_INTEGRATION } from '../../constants';
import { mapDayBasisCode } from './map-day-basis-code';
import { mapFrequencyCode } from './map-frequency-code';
import { mapSpreadRate } from './map-spread-rate';
import { mapAccrualSchedules } from '.';
import { mapEwcsIndexRateCode } from './map-ewcs-index-rate-code';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapAccrualSchedules', () => {
  // Arrange
  const currency = CURRENCY.GBP;
  const dayCountBasis = 360;
  const expiryDate = '2026-12-31';
  const feeFrequency = 'Monthly';
  const feeType = 'At maturity';
  const guaranteeFeePayableToUkef = '7.0200%';

  const baseExpectedSchedule = {
    accrualScheduleTypeCode: ACCRUAL_SCHEDULE_TYPE_CODES.PREMIUM,
    accrualFrequencyCode: mapFrequencyCode(feeFrequency, feeType),
    accrualDayBasisCode: mapDayBasisCode(dayCountBasis),
    additionalRate: DEFAULTS.ACCRUAL_SCHEDULE.ADDITIONAL_RATE,
    baseRate: DEFAULTS.ACCRUAL_SCHEDULE.BASE_RATE,
    firstCycleAccrualEndDate: expiryDate,
    spreadRate: mapSpreadRate(guaranteeFeePayableToUkef),
  };

  it('should return an array with a mapped accrual schedule', () => {
    // Arrange
    const isEwcsFacility = false;

    // Act
    const result = mapAccrualSchedules({
      currency,
      dayCountBasis,
      expiryDate,
      feeFrequency,
      feeType,
      guaranteeFeePayableToUkef,
      isEwcsFacility,
    });

    // Assert
    const expected = [baseExpectedSchedule];

    expect(result).toEqual(expected);
  });

  describe('when isEwcsFacility is true', () => {
    it('should return an array with 2 accrual schedules containing indexRateCode', () => {
      // Arrange
      const isEwcsFacility = true;

      // Act
      const result = mapAccrualSchedules({
        currency,
        dayCountBasis,
        expiryDate,
        feeFrequency,
        feeType,
        guaranteeFeePayableToUkef,
        isEwcsFacility,
      });

      // Assert
      const frequencyCode = mapFrequencyCode(feeFrequency, feeType);

      const expectedIndexRateCode = mapEwcsIndexRateCode({ currency, frequencyCode });

      const expected = [
        baseExpectedSchedule,
        {
          ...baseExpectedSchedule,
          accrualScheduleTypeCode: ACCRUAL_SCHEDULE_TYPE_CODES.CONTRACTUAL_INTEREST_INDEXED_FLOATING_RATE,
          indexRateCode: expectedIndexRateCode,
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
