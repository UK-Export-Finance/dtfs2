import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimAccrualSchedule } from '../../types';
import { mapDayBasisCode } from './map-day-basis-code';
import { mapFrequencyCode } from './map-frequency-code';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapAccrualSchedulesParams = {
  dayCountBasis: number;
  effectiveDate: string;
  feeFrequency: string;
  guaranteeFeePayableToUkef: string;
  maturityDate: string;
};

/**
 * Maps the facility "accrual schedules"
 * @param params - The parameters required to map the accrual schedules, including:
 * @pram {number} params.dayCountBasis - The facility's day count basis, used to map to GIFT day basis code.
 * @param {string} params.effectiveDate - The facility's effective date, used as the accrual effective date.
 * @param {string} params.feeFrequency - The facility's fee frequency, used to map to GIFT accrual frequency code.
 * @param {string} params.guaranteeFeePayableToUkef - The guarantee fee payable to UKEF, used as the spread rate in the accrual schedule.
 * @param {string} params.maturityDate - The facility's maturity date, used as the accrual maturity date and first cycle accrual end date.
 * @returns {ApimAccrualSchedule[]} - Mapped accrual schedules for the APIM GIFT payload.
 */
export const mapAccrualSchedules = ({
  dayCountBasis,
  effectiveDate,
  feeFrequency,
  guaranteeFeePayableToUkef,
  maturityDate,
}: MapAccrualSchedulesParams): ApimAccrualSchedule[] => {
  const accrualSchedules = [
    {
      accrualScheduleTypeCode: DEFAULTS.ACCRUAL_SCHEDULE.TYPE_CODE,
      accrualEffectiveDate: effectiveDate,
      accrualMaturityDate: maturityDate,
      accrualFrequencyCode: mapFrequencyCode(feeFrequency),
      accrualDayBasisCode: mapDayBasisCode(dayCountBasis),
      firstCycleAccrualEndDate: maturityDate,
      baseRate: DEFAULTS.ACCRUAL_SCHEDULE.BASE_RATE,
      spreadRate: Number(guaranteeFeePayableToUkef.replace('%', '')), // Remove percentage sign if present, as GIFT expects a numeric value
      additionalRate: DEFAULTS.ACCRUAL_SCHEDULE.ADDITIONAL_RATE,
    },
  ];

  return accrualSchedules;
};

// The "At maturity" option in DTFS is very rare, reportedly only on EWCS facilities to date.
// If "At maturity" option is chosen in DTFS, default Interest frequency to "Annual" and default date in GIFT to DTFS cover end date

// dtfs guaranteeFeePayableToUkef examples
// '10%'
// '7.0200%'
