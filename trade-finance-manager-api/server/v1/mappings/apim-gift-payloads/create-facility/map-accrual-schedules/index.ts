import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimAccrualSchedule } from '../../types';
import { mapDayBasisCode } from './map-day-basis-code';
import { mapFrequencyCode } from './map-frequency-code';
import { mapSpreadRate } from './map-spread-rate';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapAccrualSchedulesParams = {
  dayCountBasis: number;
  feeFrequency: string;
  feeType: string;
  guaranteeFeePayableToUkef: string | null;
};

/**
 * Maps the facility "accrual schedules"
 * @param params - The parameters required to map the accrual schedules, including:
 * @param {number} params.dayCountBasis - The facility's day count basis, used to map to GIFT day basis code.
 * @param {string} params.feeFrequency - The facility's fee frequency, used to map to GIFT accrual frequency code.
 * @param {string} params.feeType - The facility's fee type, used to determine special handling for "At maturity" option.
 * @param {string | null} params.guaranteeFeePayableToUkef - The guarantee fee payable to UKEF, used as the spread rate in the accrual schedule.
 * @returns {ApimAccrualSchedule[]} - Mapped accrual schedules for the APIM GIFT payload.
 */
export const mapAccrualSchedules = ({ dayCountBasis, feeFrequency, feeType, guaranteeFeePayableToUkef }: MapAccrualSchedulesParams): ApimAccrualSchedule[] => {
  const accrualSchedules = [
    {
      accrualScheduleTypeCode: DEFAULTS.ACCRUAL_SCHEDULE.TYPE_CODE,
      accrualFrequencyCode: mapFrequencyCode(feeFrequency, feeType),
      accrualDayBasisCode: mapDayBasisCode(dayCountBasis),
      baseRate: DEFAULTS.ACCRUAL_SCHEDULE.BASE_RATE,
      spreadRate: mapSpreadRate(guaranteeFeePayableToUkef),
      additionalRate: DEFAULTS.ACCRUAL_SCHEDULE.ADDITIONAL_RATE,
    },
  ];

  return accrualSchedules;
};
