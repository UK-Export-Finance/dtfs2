import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftRepaymentProfile } from '../../types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapRepaymentProfilesParams = {
  amount: number;
  dueDate: string;
};

/**
 * Maps the repayment profiles for the APIM GIFT payload.
 * @param {MapRepaymentProfilesParams} params - Data required to build the APIM GIFT "repayment profiles" data.
 * @param {number} params.amount - The amount of the repayment profile facility - this should be the facility's UKEF exposure.
 * @param {string} params.dueDate - The due date of the repayment profile - this should be the facility exit date (from TFM "facilityGuaranteeDates").
 * @returns {ApimGiftRepaymentProfile[]} Mapped repayment profiles array for the APIM GIFT payload.
 */
export const mapRepaymentProfiles = ({ amount, dueDate }: MapRepaymentProfilesParams): ApimGiftRepaymentProfile[] => {
  const repaymentProfiles = [
    {
      amount,
      dueDate,
      name: DEFAULTS.REPAYMENT_PROFILE.NAME,
    },
  ];

  return repaymentProfiles;
};
