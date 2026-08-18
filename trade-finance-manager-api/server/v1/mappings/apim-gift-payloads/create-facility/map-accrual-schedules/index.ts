import type { Currency } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimAccrualSchedule } from '../../types';
import { mapDayBasisCode } from './map-day-basis-code';
import { mapFrequencyCode } from './map-frequency-code';
import { mapSpreadRate } from './map-spread-rate';
import { mapEwcsIndexRateCode } from './map-ewcs-index-rate-code';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapAccrualSchedulesParams = {
  dayCountBasis: number;
  currency: Currency;
  expiryDate: string;
  feeFrequency: string;
  feeType: string;
  guaranteeFeePayableToUkef: string | null;
  isEwcsFacility: boolean;
};

/**
 * Maps the facility "accrual schedules"
 * @param params - The parameters required to map the accrual schedules, including:
 * @param {Currency} params.currency - The facility currency code, used for EWCS index rate mapping.
 * @param {number} params.dayCountBasis - The facility's day count basis, used to map to GIFT day basis code.
 * @param {string} params.expiryDate - The facility guarantee expiry date.
 * @param {string} params.feeFrequency - The facility's fee frequency, used to map to GIFT accrual frequency code.
 * @param {string} params.feeType - The facility's fee type, used to determine special handling for "At maturity" option.
 * @param {string | null} params.guaranteeFeePayableToUkef - The guarantee fee payable to UKEF, used as the spread rate in the accrual schedule
 * @param {boolean} params.isEwcsFacility - Flag indicating if the facility is an EWCS facility.
 * @returns {ApimAccrualSchedule[]} - Mapped accrual schedules for the APIM GIFT payload.
 */
export const mapAccrualSchedules = ({
  currency,
  dayCountBasis,
  expiryDate,
  feeFrequency,
  feeType,
  guaranteeFeePayableToUkef,
  isEwcsFacility,
}: MapAccrualSchedulesParams): ApimAccrualSchedule[] => {
  const frequencyCode = mapFrequencyCode(feeFrequency, feeType);

  const accrualSchedules: ApimAccrualSchedule[] = [
    {
      accrualScheduleTypeCode: DEFAULTS.ACCRUAL_SCHEDULE.TYPE_CODE,
      accrualFrequencyCode: frequencyCode,
      accrualDayBasisCode: mapDayBasisCode(dayCountBasis),
      additionalRate: DEFAULTS.ACCRUAL_SCHEDULE.ADDITIONAL_RATE,
      baseRate: DEFAULTS.ACCRUAL_SCHEDULE.BASE_RATE,
      firstCycleAccrualEndDate: expiryDate,
      spreadRate: mapSpreadRate(guaranteeFeePayableToUkef),
    },
  ];

  if (isEwcsFacility) {
    accrualSchedules[0].indexRateCode = mapEwcsIndexRateCode({ currency, frequencyCode });
  }

  return accrualSchedules;
};
