import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { ApimGiftFacilityAmendmentPayload, TfmFacilityAmendmentData } from '../../../mappings/apim-gift-payloads/types';

type CanSendAmendmentsToApimGiftReturnShape = {
  canSendAmendmentsToApimGift: boolean;
  amendmentPayloads: ApimGiftFacilityAmendmentPayload[];
};

/**
 * Checks if the facility amendment can be sent to APIM/GIFT.
 * The function takes the facility amendment data from TFM and maps it to one or more APIM/GIFT payloads using the APIM_GIFT_PAYLOADS.amendFacility mapping function.
 * If at least one valid payload can be produced, the function returns true, indicating that the amendment can be sent to APIM/GIFT.
 * If no valid payloads can be produced, the function returns false, indicating that the amendment cannot be sent to APIM/GIFT.
 * @param {TfmFacilityAmendmentData} amendment - The facility amendment data from TFM.
 * @returns {CanSendAmendmentsToApimGiftReturnShape} The result indicating if the amendment can be sent to APIM/GIFT and the corresponding payloads.
 */
export const canSendAmendmentsToApimGift = (amendment: TfmFacilityAmendmentData): CanSendAmendmentsToApimGiftReturnShape => {
  const payloads = APIM_GIFT_PAYLOADS.amendFacility(amendment);

  if (!payloads.length) {
    return {
      canSendAmendmentsToApimGift: false,
      amendmentPayloads: [],
    };
  }

  return {
    canSendAmendmentsToApimGift: true,
    amendmentPayloads: payloads,
  };
};
