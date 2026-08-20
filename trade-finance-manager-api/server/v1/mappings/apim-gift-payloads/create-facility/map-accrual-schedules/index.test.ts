import { CURRENCY } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
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

  describe('when isEwcsFacility is true', () => {
    it('should return an array with an accrual schedule containing indexRateCode', () => {
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

      const expected = mapEwcsIndexRateCode({ currency, frequencyCode });

      expect(result[0].indexRateCode).toEqual(expected);
    });
  });
});
