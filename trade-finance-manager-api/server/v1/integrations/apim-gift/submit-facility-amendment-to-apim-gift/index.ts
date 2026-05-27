import apiModule from '../../../api';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { ApiTypes, TfmFacilityAmendmentData } from '../../../mappings/apim-gift-payloads/types';

type SubmitFacilityAmendmentToApimGiftParams = {
  amendment: TfmFacilityAmendmentData;
  ukefFacilityId: string;
};

type SubmitFacilityAmendmentToApimGiftResponse = object | false;

/**
 * Submits a facility amendment to APIM/GIFT.
 * @param {SubmitFacilityAmendmentToApimGiftParams} params - The parameters for submitting the facility amendment.
 * @param {TfmFacilityAmendmentData} params.amendment - The facility amendment data from TFM.
 * @param {string} params.ukefFacilityId - The UKEF facility ID.
 * @returns The response from the APIM/GIFT system or false if the payload is invalid.
 */
export const submitFacilityAmendmentToApimGift = async ({
  amendment,
  ukefFacilityId,
}: SubmitFacilityAmendmentToApimGiftParams): Promise<SubmitFacilityAmendmentToApimGiftResponse> => {
  console.info('==================== submitFacilityAmendmentToApimGift - amendment ', JSON.stringify(amendment));

  const payload = APIM_GIFT_PAYLOADS.amendFacility(amendment);

  if (!payload) {
    return false;
  }

  const api = apiModule as ApiTypes;

  const response = await api.amendGiftFacility(payload, ukefFacilityId);

  return response;
};
